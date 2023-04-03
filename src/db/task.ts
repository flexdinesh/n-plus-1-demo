import { FastifyReply } from "fastify";
import SQL from "sql-template-strings";
import { open } from "sqlite";

type db = Awaited<ReturnType<typeof open>>;

export const task = {
  findAll: async (db: db, reply: FastifyReply) => {
    const result = await db.all<TaskRow[]>(SQL`select id, name from task`);
    const tasks = result.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
    }));
    // @ts-ignore
    reply.sqlCounter = reply.sqlCounter + 1;
    return tasks;
  },
  findByUserId: async (db: db, reply: FastifyReply, { id }: { id: number }) => {
    const statement = SQL`
      SELECT id, title, status, user_id FROM user_task_rel AS rel
        INNER JOIN task as t
        on rel.task_id = t.id
      `.append(`where rel.user_id = ${id}`);
    const result = await db.all<TaskWithUserIdRow[]>(statement);

    const tasks = result.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
    }));

    // @ts-ignore
    reply.sqlCounter = reply.sqlCounter + 1;
    return tasks;
  },
  findByUserIds: async (
    db: db,
    reply: FastifyReply,
    { ids }: { ids: number[] }
  ) => {
    const statement = SQL`
      SELECT id, title, status, user_id FROM user_task_rel AS rel
        INNER JOIN task as t
        on rel.task_id = t.id
      `.append(`where rel.user_id in (${ids.join(",")})`);
    const result = await db.all<TaskWithUserIdRow[]>(statement);

    const tasks = result.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      userId: t.user_id,
    }));

    // @ts-ignore
    reply.sqlCounter = reply.sqlCounter + 1;
    return tasks;
  }
};

type TaskRow = {
  id: number;
  title: string;
  status: string;
};

type TaskWithUserIdRow = TaskRow & {
  user_id: number;
};
