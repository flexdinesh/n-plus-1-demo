import { DataProcessingQueue } from "../lib/data-queue";
import { usersAPI, postsAPI } from "./api";

console.log("... sync frame starts here");

const helloFunction = () => {
  console.log("... helloFunction() invoked");
};

const batchFn = async (ids: number[]) => {
  const posts = await postsAPI(ids);
  const map = new Map<number, any>();
  ids.forEach((id) => {
    const post = posts.find((p) => p === id);
    map.set(id, post);
  });
  return map;
};

const queue = new DataProcessingQueue();

/* invocation */
helloFunction();
usersAPI().then(async (users) => {
  const postsQueue = queue.get("posts", batchFn);
  const posts = await Promise.all(
    users.map(async (u) => {
      return postsQueue.resolveInBatch(u);
    })
  );
  console.log("... All posts and users resolved.");
  console.log("   ", { users, posts });
});

console.log("... sync frame ends here");