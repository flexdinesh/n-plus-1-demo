import * as chalk from "chalk";
import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync } from "fastify";

export type AppOptions = {} & Partial<AutoloadPluginOptions>;

const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });

  void fastify.addHook("onRequest", (req, reply, done) => {
    // @ts-ignore
    reply.startTime = Date.now();
    // @ts-ignore
    reply.sqlCounter = 0;
    console.log("Request received", {
      url: req.raw.url,
      // params: JSON.parse(JSON.stringify(req.query)),
    });
    done();
  });

  void fastify.addHook("onResponse", (req, reply, done) => {
    // @ts-ignore
    const numOfQueries = reply.sqlCounter;
    setImmediate(() => {
      console.log(chalk.magenta.bold(`Number of queries: ${numOfQueries}`));
      console.log("Request completed", {
        url: req.raw.url,
        statusCode: reply.raw.statusCode,
        // @ts-ignore
        // durationMs: Date.now() - reply.startTime,
      });
      console.log("-".repeat(process.stdout.columns));
    });
    done();
  });

  void fastify.addHook("onReady", async function () {
    console.log(
      chalk.green.bold("Server started at:", "http://localhost:3000")
    );
  });
};

export default app;
export { app, options };
