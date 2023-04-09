import * as chalk from "chalk";

export class BatchScheduler {
  isBatchScheduledForNextTick: boolean;
  batch: Map<
    any,
    {
      arg: any;
      resolve: any;
      reject: any;
    }
  >;
  batchFn: (key: number[]) => Promise<Map<number, any>>;
  cleanupFn: () => void;

  constructor(
    fn: (key: number[]) => Promise<Map<number, any>>,
    cleanupFn: () => void
  ) {
    this.isBatchScheduledForNextTick = false;
    this.batchFn = fn;
    this.batch = new Map();
    this.cleanupFn = cleanupFn;
  }

  async flushBatch() {
    const batchedArgs = [...this.batch.keys()];
    console.log(chalk.magenta("... processing data in batch: "));
    const result = await this.batchFn(batchedArgs);
    batchedArgs.forEach((arg, i) => {
      const resolvedValueForArg = result.get(arg);
      this.batch.get(arg)?.resolve(resolvedValueForArg);
    });

    this.cleanupFn();
  }

  async resolveInBatch(arg: number) {
    console.log(chalk.magenta("... submitting data to queue: ", `post_${arg}`));
    return new Promise((resolve, reject) => {
      const item = {
        arg,
        resolve,
        reject,
      };
      this.batch.set(arg, item);

      if (!this.isBatchScheduledForNextTick) {
        this.isBatchScheduledForNextTick = true;
        process.nextTick(() => {
          this.flushBatch();
        });
      }
    });
  }
}

export class DataQueue {
  queue: Map<string, BatchScheduler>;

  constructor() {
    this.queue = new Map();
  }

  get(key: string, batchFn: (key: number[]) => Promise<Map<number, any>>) {
    const queue = this.queue.get(key);
    if (!queue) {
      const cleanupFn = () => {
        this.queue.delete(key);
      };
      const newQueue = new BatchScheduler(batchFn, cleanupFn);
      this.queue.set(key, newQueue);
      return newQueue;
    }
    return queue;
  }
}
