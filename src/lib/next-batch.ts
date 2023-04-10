import * as chalk from "chalk";

type BatchHandler = (key: number[]) => Promise<Map<number, any>>;
type CleanupHandler = () => void;

class BatchScheduler {
  id: string;
  isBatchScheduledForNextTaskQueue: boolean;
  nextBatch: Map<
    any,
    {
      arg: any;
      resolve: any;
      reject: any;
    }
  >;
  batchHandler: BatchHandler | null = null;
  cleanupHandler: CleanupHandler | null = null;

  constructor({
    id,
    batchHandler,
    cleanupHandler,
  }: {
    id: string;
    batchHandler?: BatchHandler;
    cleanupHandler?: CleanupHandler;
  }) {
    this.id = id;
    this.isBatchScheduledForNextTaskQueue = false;
    this.nextBatch = new Map();
    if (batchHandler) {
      this.batchHandler = batchHandler;
    }
    if (cleanupHandler) {
      this.cleanupHandler = cleanupHandler;
    }
  }

  setBatchHandler(handler: BatchHandler) {
    this.batchHandler = handler;
  }

  setCleanupHandler(handler: CleanupHandler) {
    this.cleanupHandler = handler;
  }

  async flushBatch() {
    if (typeof this.batchHandler !== "function") {
      throw new Error(`batchHandler not setup for current batch: ${this.id}`);
    }

    const batchedArgs = [...this.nextBatch.keys()];
    console.log(chalk.magenta("... processing data in batch: "));
    const result = await this.batchHandler(batchedArgs);
    batchedArgs.forEach((arg, i) => {
      const resolvedValueForArg = result.get(arg);
      this.nextBatch.get(arg)?.resolve(resolvedValueForArg);
    });

    if (typeof this.cleanupHandler === "function") {
      this.cleanupHandler();
    }
  }

  async add(arg: number) {
    console.log(chalk.magenta("... submitting data to queue: ", `post_${arg}`));
    return new Promise((resolve, reject) => {
      const task = {
        arg,
        resolve,
        reject,
      };
      this.nextBatch.set(arg, task);

      if (!this.isBatchScheduledForNextTaskQueue) {
        this.isBatchScheduledForNextTaskQueue = true;
        process.nextTick(() => {
          this.flushBatch();
        });
      }
    });
  }
}

class BatchAccessUtil {
  batches: Map<string, BatchScheduler>;

  constructor() {
    this.batches = new Map();
  }

  create({ key }: { key: string }) {
    const existingBatch = this.batches.get(key);
    if (existingBatch) {
      throw new Error(`batch already exists for key: ${key}`);
    }
    const newBatch = new BatchScheduler({
      id: key,
    });
    this.batches.set(key, newBatch);
    return newBatch;
  }

  get({ key }: { key: string }) {
    const existingBatch = this.batches.get(key);
    if (!existingBatch) {
      const newBatch = new BatchScheduler({
        id: key,
      });
      this.batches.set(key, newBatch);
      return newBatch;
    }
    return existingBatch;
  }

  delete({ key }: { key: string }) {
    const existingBatch = this.batches.get(key);
    if (existingBatch) {
      this.batches.delete(key);
    }
  }
}

export const batch = new BatchAccessUtil();

export const nextBatch = ({
  key,
  batchHandler,
}: {
  key: string;
  batchHandler: (key: number[]) => Promise<Map<number, any>>;
}) => {
  const nBatch = batch.get({ key });
  if (typeof nBatch.batchHandler !== "function") {
    nBatch.setBatchHandler(batchHandler);
  }
  if (typeof nBatch.cleanupHandler !== "function") {
    nBatch.setCleanupHandler(() => {
      batch.delete({ key });
    });
  }
  return nBatch;
};

export const __internal = {
  BatchScheduler,
  BatchAccessUtil,
};
