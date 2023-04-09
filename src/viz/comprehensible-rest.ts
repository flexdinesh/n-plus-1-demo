// @ts-nocheck
// just to demonstrate approaches. Not a part of this codebase.

// N + 1 requests
router.get("/users-with-tasks", async function (request, response) {
  const users = await userDB.findAll(request.query.boardId);
  const usersWithTasks = await Promise.all(
    users.map(async (user) => {
      const tasksForUser = await taskDB.findByUserId(user.id);
      return {
        ...user,
        tasks: tasksForUser,
      };
    })
  );

  return usersWithTasks;
});

// 1 + 1 requests
router.get("/users-with-tasks", async function (request, response) {
  const users = await userDB.findAll(request.query.boardId);
  const userIds = users.map((user) => user.id);
  const tasks = await taskDB.findByUserIds(userIds);

  const usersWithTasks = users.map((user) => {
    const tasksForUser = tasks.filter((task) => task.userId === user.id);
    return {
      ...user,
      tasks: tasksForUser,
    };
  });

  return usersWithTasks;
});


User: {
  tasks: async ({ id: userId }, _args, context) => {
    // fetch tasks for each user
    const tasks = await task.findByUserId(fastify.db, context.reply, {
      id: userId,
    });
    return tasks;
  }
}

User: {
  tasks: async ({ id: userId }, _args, context) => {
    // batch function to fetch tasks in batch for all users
    const tasksBatchFn = async (ids: number[]) => {
      const tasks = await task.findByUserIds(
        fastify.db,
        context.reply,
        { ids }
      );
      const map = new Map<number, any>();
      ids.forEach((id) => {
        const task = tasks.filter((task) => task.id === id);
        map.set(id, task);
      });
      return map;
    };
    // queue to collect all resolver requests that are flushed
    // in the next execution frame using process.nextTick()
    const tasksQueue = queue.get("tasks", tasksBatchFn);
    // tasks are requested per user but resolved in batch for all users
    // via the JavaScript magic of our DataQueue
    const tasks = await tasksQueue.resolveInBatch(userId);
    return tasks;
  }
}