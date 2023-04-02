import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { FastifyPluginAsync } from "fastify";
import { user } from "../../db/user";
import { task } from "../../db/task";

const getSchema = (fastify: FastifyInstance) => {
  const schema = makeExecutableSchema<{ reply: FastifyReply }>({
    typeDefs: [
      `
      schema {
        query: Query
      }

      type Query {
        users: [User]!
      }

      type User {
        id: ID!
        name: String!
        tasks: [Task]!
      }

      type Task {
        id: ID!
        title: String!
        status: String!
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
        },
        User: {
          tasks: async (parent, _args, context) => {
            const t = await task.findByUserId(fastify.db, context.reply, {
              id: parent.id,
            });
            return t;
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
