import { FastifyReply } from "fastify";
import SQL from "sql-template-strings";
import { open } from "sqlite";

type db = Awaited<ReturnType<typeof open>>;

export const comment = {
  findByPostId: async (db: db, reply: FastifyReply, { id }: { id: number }) => {
    const statement = SQL`
      SELECT id, value, post_id FROM post_comment_rel AS rel
        INNER JOIN comment as c
        on rel.comment_id = c.id
      `.append(`where rel.post_id = ${id}`);
    const result = await db.all<CommentWithPostIdRow[]>(statement);

    const comments = result.map((t) => ({
      id: t.id,
      comment: t.value,
    }));

    // @ts-ignore
    reply.sqlCounter = reply.sqlCounter + 1;
    return comments;
  },
  findByPostIds: async (
    db: db,
    reply: FastifyReply,
    { ids }: { ids: number[] }
  ) => {
    const statement = SQL`
      SELECT id, value, post_id FROM post_comment_rel AS rel
        INNER JOIN comment as c
        on rel.comment_id = c.id
      `.append(`where rel.post_id in (${ids.join(",")})`);

    const result = await db.all<CommentWithPostIdRow[]>(statement);

    const comments = result.map((t) => ({
      id: t.id,
      comment: t.value,
      post_id: t.post_id,
    }));

    // @ts-ignore
    reply.sqlCounter = reply.sqlCounter + 1;
    return comments;
  },
};

type CommentRow = {
  id: number;
  value: string;
};

type CommentWithPostIdRow = CommentRow & {
  post_id: number;
};
