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
  // /posts
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

  // /posts-with-comments
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
        posts.map(async (post) => {
          const commentsForPost = await comment.findByPostId(
            fastify.db,
            reply,
            { id: post.id }
          );
          return {
            id: post.id,
            title: post.title,
            comments: commentsForPost,
          };
        })
      );

      return postsWithComments;
    },
  });

  // /posts-with-comments/better
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
        ids: posts.map((post) => post.id),
      });

      const postsWithComments = posts.map((post) => {
        const commentsForPost = comments
          .filter((comment) => comment.post_id === post.id)
          .map((comment) => ({ id: comment.id, comment: comment.comment }));
        return {
          id: post.id,
          title: post.title,
          comments: commentsForPost,
        };
      });

      return postsWithComments;
    },
  });
};

export default users;
