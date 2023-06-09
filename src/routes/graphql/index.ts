import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { FastifyPluginAsync } from "fastify";
import { user } from "../../db/user";
import { task } from "../../db/task";
import { post } from "../../db/post";
import { comment } from "../../db/comment";
// import { nextBatch } from "next-batch";
import { nextBatch } from "../../lib/next-batch";

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
        tasksBetter: [Task]!
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
          tasks: async ({ id: userId }, _args, context) => {
            // fetch tasks for each user
            const tasks = await task.findByUserId(fastify.db, context.reply, {
              id: userId,
            });
            return tasks;
          },
          tasksBetter: async ({ id: userId }, _args, context) => {
            const tasksBatch = nextBatch({
              key: "comments",
              batchHandler: async (ids: number[]) => {
                const tasks = await task.findByUserIds(
                  fastify.db,
                  context.reply,
                  { ids }
                );
                const map = new Map<
                  number,
                  Awaited<ReturnType<typeof task.findByUserIds>>
                >();
                ids.forEach((id) => {
                  const task = tasks.filter((task) => task.id === id);
                  map.set(id, task);
                });
                return map;
              },
            });
            const tasks = await tasksBatch.add(userId);
            return tasks;
          },
          posts: async ({ id: userId }, _args, context) => {
            const posts = await post.findByUserId(fastify.db, context.reply, {
              id: userId,
            });
            return posts;
          },
        },
        Post: {
          comments: async ({ id: postId }, _args, context) => {
            const comments = await comment.findByPostId(
              fastify.db,
              context.reply,
              {
                id: postId,
              }
            );
            return comments;
          },
          commentsBetter: async ({ id: postId }, _args, context) => {
            const commentsBatch = nextBatch({
              key: "comments",
              batchHandler: async (ids: number[]) => {
                const comments = await comment.findByPostIds(
                  fastify.db,
                  context.reply,
                  { ids }
                );
                const map = new Map<
                  typeof ids[number],
                  Awaited<ReturnType<typeof comment.findByPostIds>>
                >();
                ids.forEach((id) => {
                  const post = comments.filter((c) => c.id === id);
                  map.set(id, post);
                });
                return map;
              },
            });
            const comments = await commentsBatch.add(postId);
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
