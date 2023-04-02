PRAGMA foreign_keys = ON;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE task (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE user_task_rel (
  user_id INTEGER,
  task_id INTEGER,
  FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY(task_id) REFERENCES task(id) ON DELETE CASCADE
);

CREATE INDEX userindex ON user_task_rel(user_id);
CREATE INDEX taskindex ON user_task_rel(task_id);

INSERT INTO user(name) VALUES ("user one");
INSERT INTO user(name) VALUES ("user two");
INSERT INTO user(name) VALUES ("user three");
INSERT INTO user(name) VALUES ("user four");
INSERT INTO user(name) VALUES ("user five");

INSERT INTO task(title, status) VALUES ("task one", "draft");
INSERT INTO task(title, status) VALUES ("task two", "draft");
INSERT INTO task(title, status) VALUES ("task three", "draft");
INSERT INTO task(title, status) VALUES ("task four", "draft");
INSERT INTO task(title, status) VALUES ("task five", "draft");

INSERT INTO user_task_rel(user_id, task_id) VALUES (1, 1);
INSERT INTO user_task_rel(user_id, task_id) VALUES (2, 2);
INSERT INTO user_task_rel(user_id, task_id) VALUES (3, 3);
INSERT INTO user_task_rel(user_id, task_id) VALUES (4, 4);
INSERT INTO user_task_rel(user_id, task_id) VALUES (5, 5);
