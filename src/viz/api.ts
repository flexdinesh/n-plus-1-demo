import * as chalk from "chalk";

function randomDelay() {
  const randomMs = (Math.floor(Math.random() * 3) + 1) * 1000;
  return new Promise((resolve) => setTimeout(() => resolve(true), randomMs));
}

/* setup */
export const usersAPI = async () => {
  console.log("... usersAPI requested");
  const logAndReturn = (ids: number[]) => {
    console.log(chalk.blue("... usersAPI resolved: "));
    console.log("   ", { users: ids.map((id) => `user_${id}`) });
    return ids;
  };
  return randomDelay().then(() =>
    Promise.resolve([1, 2, 3, 4]).then(logAndReturn)
  );
  // return Promise.resolve([1, 2, 3, 4]).then(logAndReturn);
};

export const postAPI = async (id: number) => {
  console.log("... postAPI requested: ", `post_${id}`);
  const logAndReturn = (id: number) => {
    console.log(chalk.blue("... postAPI resolved: ", `post_${id}`));
    return id;
  };
  return randomDelay().then(() => Promise.resolve(id).then(logAndReturn));
  // return Promise.resolve([1, 2, 3, 4]).then(logAndReturn);
};

export const postsAPI = async (ids: number[]) => {
  console.log("... postsAPI requested in batch: ");

  console.log(
    "   ",
    ids.map((id) => `post_${id}`)
  );
  const logAndReturn = (ids: number[]) => {
    console.log(chalk.blue("... postsAPI resolved in batch: "));
    console.log(
      "   ",
      ids.map((id) => `post_${id}`)
    );
    return ids;
  };
  return randomDelay().then(() => Promise.resolve(ids).then(logAndReturn));
  // return Promise.resolve(ids).then(logAndReturn);
};
