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
  findAllWithTasks: async (db: db, reply: FastifyReply) => {
    const statement = SQL`
      SELECT * FROM user_task_rel AS rel
        INNER JOIN user as u
        on rel.user_id = u.id
        INNER JOIN task as t
        on rel.task_id = t.id;`;
    const result = await db.all<UserTaskJoinRow[]>(statement);
    const users = result.map((j) => {
      const tasks = result
        .filter((r) => r.user_id === j.user_id)
        .map((t) => ({ id: t.task_id, title: t.title, status: t.status }));
      return {
        id: j.user_id,
        name: j.name,
        tasks,
      };
    });

    // @ts-ignore
    reply.sqlCounter = reply.sqlCounter + 1;
    return users;
  },
};

type UserRow = {
  id: number;
  name: string;
};

type UserTaskJoinRow = {
  user_id: number;
  task_id: number;
  name: string;
  title: string;
  status: string;
};
