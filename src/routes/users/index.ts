import { FastifyPluginAsync } from "fastify";
import { user } from "../../db/user";
import { task } from "../../db/task";

const users: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const users = await user.findAll(fastify.db, reply);
    return users;
  });

  fastify.get("-with-tasks", async function (request, reply) {
    const users = await user.findAll(fastify.db, reply);
    const usersWithTasks = await Promise.all(
      users.map(async (u) => {
        const t = await task.findByUserId(fastify.db, reply, { id: u.id });
        return {
          id: u.id,
          name: u.name,
          tasks: t,
        };
      })
    );

    return usersWithTasks;
  });

  fastify.get("-with-tasks/better", async function (request, reply) {
    const users = await user.findAll(fastify.db, reply);
    const tasks = await task.findByUserIds(fastify.db, reply, {
      ids: users.map((u) => u.id),
    });

    const usersWithTasks = users.map((u) => {
      const t = tasks
        .filter((t) => t.userId === u.id)
        .map((t) => ({ id: t.id, title: t.title, status: t.status }));
      return {
        id: u.id,
        name: u.name,
        tasks: t,
      };
    });

    return usersWithTasks;
  });
};

export default users;
