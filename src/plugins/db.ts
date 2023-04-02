import fp from "fastify-plugin";
import * as chalk from "chalk";
import * as sqlite3 from "sqlite3";
import { open } from "sqlite";

export interface DbPluginOptions {}

export default fp<DbPluginOptions>(async (fastify, opts) => {
  const db = await open({
    filename: "sqlite.db",
    driver: sqlite3.Database,
  });

  console.log(
    chalk.yellow.bold(
      "Connection with SQLite has been established. Database at: sqlite.db"
    )
  );

  db.on("profile", (sql: string, elapsed: number) => {
    console.log("SQL statement: ", chalk.blue(sql));
  });

  fastify.decorate("db", db);
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    db: Awaited<ReturnType<typeof open>>;
  }
}
