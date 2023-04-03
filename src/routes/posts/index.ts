import { FastifyPluginAsync } from "fastify";
import { post } from "../../db/post";
import { comment } from "../../db/comment";

const parseQueryParams = (params: unknown): { userId: number } | null => {
  if (
    params !== null &&
    typeof params === "object" &&
    "userId" in params &&
    typeof (params as any).userId === "string"
  ) {
    return { userId: Number((params as any).userId) };
  }

  return null;
};
const users: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.route({
    method: "GET",
    url: "/",
    handler: async function (request, reply) {
      const params = parseQueryParams(request.query);
      if (params === null) {
        return reply
          .status(400)
          .send({ error: true, message: "userId missing in args" });
      }
      const posts = await post.findByUserId(fastify.db, reply, {
        id: params.userId,
      });
      return posts;
    },
  });

  fastify.route({
    method: "GET",
    url: "-with-comments",
    handler: async function (request, reply) {
      const params = parseQueryParams(request.query);
      if (params === null) {
        return reply
          .status(400)
          .send({ error: true, message: "userId missing in args" });
      }
      const posts = await post.findByUserId(fastify.db, reply, {
        id: params.userId,
      });
      const postsWithComments = await Promise.all(
        posts.map(async (p) => {
          const c = await comment.findByPostId(fastify.db, reply, { id: p.id });
          return {
            id: p.id,
            title: p.title,
            comments: c,
          };
        })
      );

      return postsWithComments;
    },
  });

  fastify.route({
    method: "GET",
    url: "-with-comments/better",
    handler: async function (request, reply) {
      const params = parseQueryParams(request.query);
      if (params === null) {
        return reply
          .status(400)
          .send({ error: true, message: "userId missing in args" });
      }
      const posts = await post.findByUserId(fastify.db, reply, {
        id: params.userId,
      });
      const comments = await comment.findByPostIds(fastify.db, reply, {
        ids: posts.map((p) => p.id),
      });

      const postsWithComments = posts.map((p) => {
        const c = comments
          .filter((c) => c.post_id === p.id)
          .map((c) => ({ id: c.id, comment: c.comment }));
        return {
          id: p.id,
          title: p.title,
          comments: c,
        };
      });

      return postsWithComments;
    },
  });
};

export default users;
