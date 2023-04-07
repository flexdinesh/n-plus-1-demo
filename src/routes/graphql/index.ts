import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { FastifyPluginAsync } from "fastify";
import { user } from "../../db/user";
import { task } from "../../db/task";
import { post } from "../../db/post";
import { comment } from "../../db/comment";
import { DataProcessingQueue } from "../../lib/data-queue";

const queue = new DataProcessingQueue();

const getSchema = (fastify: FastifyInstance) => {
  const schema = makeExecutableSchema<{ reply: FastifyReply }>({
    typeDefs: [
      `
      schema {
        query: Query
      }

      type Query {
        users: [User]!
        posts(userId: ID!): [Post]!
      }

      type User {
        id: ID!
        name: String!
        tasks: [Task]!
        posts: [Post]!
      }

      type Task {
        id: ID!
        title: String!
        status: String!
      }

      type Post {
        id: ID!
        title: String!
        comments: [Comment]!
        commentsBetter: [Comment]!
      }

      type Comment {
        id: ID!
        comment: String!
      }
    `,
    ],
    resolvers: [
      {
        Query: {
          users: async (_parent, _args, context) => {
            const users = await user.findAll(fastify.db, context.reply);
            return users;
          },
          posts: async (_parent, { userId }, context) => {
            const posts = await post.findByUserId(fastify.db, context.reply, {
              id: userId,
            });
            return posts;
          },
        },
        User: {
          tasks: async (parent, _args, context) => {
            const tasks = await task.findByUserId(fastify.db, context.reply, {
              id: parent.id,
            });
            return tasks;
          },
          posts: async (parent, _args, context) => {
            const posts = await post.findByUserId(fastify.db, context.reply, {
              id: parent.id,
            });
            return posts;
          },
        },
        Post: {
          comments: async (parent, _args, context) => {
            const comments = await comment.findByPostId(
              fastify.db,
              context.reply,
              {
                id: parent.id,
              }
            );
            return comments;
          },
          commentsBetter: async (parent, _args, context) => {
            const commentBatchFn = async (ids: number[]) => {
              const comments = await comment.findByPostIds(
                fastify.db,
                context.reply,
                { ids }
              );
              const map = new Map<number, any>();
              ids.forEach((id) => {
                const post = comments.filter((c) => c.id === id);
                map.set(id, post);
              });
              return map;
            };
            const commentsQueue = queue.get("comments", commentBatchFn);
            const comments = await commentsQueue.resolveInBatch(parent.id);

            return comments;
          },
        },
      },
    ],
  });
  return schema;
};

const graphql: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // This will allow Fastify to forward multipart requests to GraphQL Yoga
  fastify.addContentTypeParser(
    "multipart/form-data",
    {},
    (req, payload, done) => done(null)
  );

  const schema = getSchema(fastify);
  const yoga = createYoga<{
    req: FastifyRequest;
    reply: FastifyReply;
  }>({
    schema,
    context: async ({ req, reply }) => {
      return { reply };
    },
    logging: {
      debug: (...args) => args.forEach((arg) => fastify.log.debug(arg)),
      info: (...args) => args.forEach((arg) => fastify.log.info(arg)),
      warn: (...args) => args.forEach((arg) => fastify.log.warn(arg)),
      error: (...args) => args.forEach((arg) => fastify.log.error(arg)),
    },
  });
  /**
   * We pass the incoming HTTP request to GraphQL Yoga
   * and handle the response using Fastify's `reply` API
   * Learn more about `reply` https://www.fastify.io/docs/latest/Reply/
   **/
  fastify.route({
    url: "/",
    method: ["GET", "POST", "OPTIONS"],
    handler: async (request, reply) => {
      // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
      const response = await yoga.handleNodeRequest(request, {
        req: request,
        reply,
      });
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      reply.status(response.status);

      reply.send(response.body);

      return reply;
    },
  });
};

export default graphql;
