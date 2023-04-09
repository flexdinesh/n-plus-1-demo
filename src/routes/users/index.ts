import { FastifyPluginAsync } from "fastify";
import { user } from "../../db/user";
import { task } from "../../db/task";

const users: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // /users
  fastify.get("/", async function (request, reply) {
    const users = await user.findAll(fastify.db, reply);
    return users;
  });

  // /users-with-tasks
  fastify.get("-with-tasks", async function (request, reply) {
    const users = await user.findAll(fastify.db, reply);
    const usersWithTasks = await Promise.all(
      users.map(async (user) => {
        const tasksForUser = await task.findByUserId(fastify.db, reply, {
          id: user.id,
        });
        return {
          id: user.id,
          name: user.name,
          tasks: tasksForUser,
        };
      })
    );

    return usersWithTasks;
  });

  // /users-with-tasks/better
  fastify.get("-with-tasks/better", async function (request, reply) {
    const users = await user.findAll(fastify.db, reply);
    const tasks = await task.findByUserIds(fastify.db, reply, {
      ids: users.map((user) => user.id),
    });

    const usersWithTasks = users.map((user) => {
      const tasksForUser = tasks
        .filter((task) => task.userId === user.id)
        .map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
        }));
      return {
        id: user.id,
        name: user.name,
        tasks: tasksForUser,
      };
    });

    return usersWithTasks;
  });
};

export default users;
