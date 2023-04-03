import { FastifyReply } from "fastify";
import SQL from "sql-template-strings";
import { open } from "sqlite";

type db = Awaited<ReturnType<typeof open>>;

export const post = {
  findByUserId: async (db: db, reply: FastifyReply, { id }: { id: number }) => {
    const statement = SQL`
      SELECT id, title, user_id FROM user_post_rel AS rel
        INNER JOIN post as p
        on rel.post_id = p.id
      `.append(`where rel.user_id = ${id}`);
    const result = await db.all<PostWithUserIdRow[]>(statement);

    const posts = result.map((t) => ({
      id: t.id,
      title: t.title,
    }));

    // @ts-ignore
    reply.sqlCounter = reply.sqlCounter + 1;
    return posts;
  },
};

type PostRow = {
  id: number;
  title: string;
};

type PostWithUserIdRow = PostRow & {
  user_id: number;
};
