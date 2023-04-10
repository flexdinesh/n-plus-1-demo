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
