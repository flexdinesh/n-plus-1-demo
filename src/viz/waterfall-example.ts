import { usersAPI, postAPI } from "./api";

console.log("... sync frame starts here");

const helloFunction = () => {
  console.log("... helloFunction() invoked");
};

/* invocation */
helloFunction();
usersAPI().then(async (users) => {
  const posts = await Promise.all(
    users.map((u) => postAPI(u))
  );
  console.log("... All posts and users resolved.");
  console.log("   ", { users, posts });
});

console.log("... sync frame ends here");
