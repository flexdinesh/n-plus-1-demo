// @ts-nocheck
// just to demonstrate approaches. Not a part of this codebase.

// N + 1
User: {
  tasks: async ({ id: userId }, _args, context) => {
    // fetch tasks for each user
    const tasks = await taskDB.findByUserId({
      id: userId,
    });
    return tasks;
  };
}

// 1 + 1
User: {
  tasks: async ({ id: userId }, _args, context) => {
    // batch to collect all resolver requests that are flushed
    // in the next execution frame using process.nextTick()
    const tasksBatch = nextBatch({
      // unique string key to collect all promises into a single batch
      key: "tasks",
      // batchHandler is the callback that will be invoked when the batch
      // is flushed in the next tick. All keys from taskBatch.add(key)
      // will be collected as an array and sent as an argument to this
      // batchHandler callback
      batchHandler: async (ids: number[]) => {
        const tasks = await taskDB.findByUserIds({
          ids,
        });
        // batch handler should return a Map with every key in keys arg
        // and its corresponding value as a map entry.
        const result = new Map<typeof keys[number], { title: string }>();
        ids.forEach((id) => {
          const task = tasks.filter((task) => task.id === id);
          result.set(id, task);
        });
        return result;
      },
    });
    // tasks are requested per user but resolved in batch for all users
    // via the JavaScript magic of our next-batch util
    const tasks = await tasksBatch.add(userId);
    return tasks;
  };
}
