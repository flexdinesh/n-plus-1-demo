import { nextBatch } from "../lib/next-batch";
import { usersAPI, postsAPI } from "./api";

console.log("... sync frame starts here");

const helloFunction = () => {
  console.log("... helloFunction() invoked");
};

/* invocation */
helloFunction();
usersAPI().then(async (users) => {
  const postsBatch = nextBatch({
    key: "posts",
    batchHandler: async (ids: number[]) => {
      const posts = await postsAPI(ids);
      const map = new Map<number, any>();
      ids.forEach((id) => {
        const post = posts.find((p) => p === id);
        map.set(id, post);
      });
      return map;
    },
  });
  const posts = await Promise.all(
    users.map(async (u) => {
      return postsBatch.add(u);
    })
  );
  console.log("... All posts and users resolved.");
  console.log("   ", { users, posts });
});

console.log("... sync frame ends here");
