import { FastifyReply } from "fastify";
import SQL from "sql-template-strings";
import { open } from "sqlite";

type db = Awaited<ReturnType<typeof open>>;

export const user = {
  findAll: async (db: db, reply: FastifyReply) => {
    const statement = SQL`select id, name from user`;
    const result = await db.all<UserRow[]>(statement);
    const users = result.map((u) => ({ id: u.id, name: u.name }));

    // @ts-ignore
    reply.sqlCounter = reply.sqlCounter + 1;
    return users;
  },
};

type UserRow = {
  id: number;
  name: string;
};
