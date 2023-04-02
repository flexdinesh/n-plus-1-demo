import path from "path";
import fs from "fs/promises";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const initSchema = async () => {
  const initSQL = await fs.readFile(path.join(__dirname, "init.sql"), "utf8");
  const db = await open({
    filename: "sqlite.db",
    driver: sqlite3.Database,
  });

  db.exec(initSQL);
};

(async () => {
  await initSchema();
})();
