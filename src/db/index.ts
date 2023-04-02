import * as chalk from "chalk";
import * as sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initDb = async () => {
  // open the database
  let dbInstance = await open({
    filename: "sqlite.db",
    driver: sqlite3.Database,
  });

  console.log(
    chalk.yellow.bold(
      "Connection with SQLite has been established. Database at: sqlite.db"
    )
  );

  dbInstance.on("profile", (sql: string, elapsed: number) => {
    console.log("SQL statement: ", chalk.blue(sql));
  });

  return dbInstance;
};

// (async () => {
//   db = await initDb();
// })();

// export let db: Awaited<ReturnType<typeof open>>;
