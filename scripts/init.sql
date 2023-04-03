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

CREATE TABLE post (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL
);

CREATE TABLE comment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  value TEXT NOT NULL
);

-- M users : N tasks
CREATE TABLE user_task_rel (
  user_id INTEGER,
  task_id INTEGER,
  FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY(task_id) REFERENCES task(id) ON DELETE CASCADE
);

-- M users : N posts
CREATE TABLE user_post_rel (
  user_id INTEGER,
  post_id INTEGER,
  FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY(post_id) REFERENCES post(id) ON DELETE CASCADE
);

-- M posts : N comments
CREATE TABLE post_comment_rel (
  post_id INTEGER,
  comment_id INTEGER,
  FOREIGN KEY(post_id) REFERENCES post(id) ON DELETE CASCADE,
  FOREIGN KEY(comment_id) REFERENCES comment(id) ON DELETE CASCADE
);

CREATE INDEX user_usertaskindex ON user_task_rel(user_id);
CREATE INDEX task_usertaskindex ON user_task_rel(task_id);
CREATE INDEX user_userpostindex ON user_post_rel(user_id);
CREATE INDEX post_userpostindex ON user_post_rel(post_id);
CREATE INDEX post_postcommentindex ON post_comment_rel(post_id);
CREATE INDEX comment_postcommentindex ON post_comment_rel(comment_id);

INSERT INTO user(name) VALUES ("user one");
INSERT INTO user(name) VALUES ("user two");
INSERT INTO user(name) VALUES ("user three");
INSERT INTO user(name) VALUES ("user four");

INSERT INTO task(title, status) VALUES ("task one", "draft");
INSERT INTO task(title, status) VALUES ("task two", "draft");
INSERT INTO task(title, status) VALUES ("task three", "draft");
INSERT INTO task(title, status) VALUES ("task four", "draft");
INSERT INTO task(title, status) VALUES ("task one second", "draft");

INSERT INTO user_task_rel(user_id, task_id) VALUES (1, 1);
INSERT INTO user_task_rel(user_id, task_id) VALUES (2, 2);
INSERT INTO user_task_rel(user_id, task_id) VALUES (3, 3);
INSERT INTO user_task_rel(user_id, task_id) VALUES (4, 4);
INSERT INTO user_task_rel(user_id, task_id) VALUES (1, 5);

INSERT INTO post(title) VALUES ("post one for user one");
INSERT INTO post(title) VALUES ("post two for user one");
INSERT INTO post(title) VALUES ("post three for user one");
INSERT INTO post(title) VALUES ("post four for user two");
INSERT INTO post(title) VALUES ("post five for user two");
INSERT INTO post(title) VALUES ("post six for user two");
INSERT INTO post(title) VALUES ("post seven for user three");
INSERT INTO post(title) VALUES ("post eight for user three");
INSERT INTO post(title) VALUES ("post nine for user three");

INSERT INTO user_post_rel(user_id, post_id) VALUES (1, 1);
INSERT INTO user_post_rel(user_id, post_id) VALUES (1, 2);
INSERT INTO user_post_rel(user_id, post_id) VALUES (1, 3);
INSERT INTO user_post_rel(user_id, post_id) VALUES (2, 4);
INSERT INTO user_post_rel(user_id, post_id) VALUES (2, 5);
INSERT INTO user_post_rel(user_id, post_id) VALUES (2, 6);
INSERT INTO user_post_rel(user_id, post_id) VALUES (3, 7);
INSERT INTO user_post_rel(user_id, post_id) VALUES (3, 8);
INSERT INTO user_post_rel(user_id, post_id) VALUES (3, 9);

INSERT INTO comment(value) VALUES ("comment one");
INSERT INTO comment(value) VALUES ("comment two");
INSERT INTO comment(value) VALUES ("comment three");
INSERT INTO comment(value) VALUES ("comment four");
INSERT INTO comment(value) VALUES ("comment five");
INSERT INTO comment(value) VALUES ("comment one second");

INSERT INTO post_comment_rel(post_id, comment_id) VALUES (1, 1);
INSERT INTO post_comment_rel(post_id, comment_id) VALUES (2, 2);
INSERT INTO post_comment_rel(post_id, comment_id) VALUES (3, 3);
INSERT INTO post_comment_rel(post_id, comment_id) VALUES (4, 4);
INSERT INTO post_comment_rel(post_id, comment_id) VALUES (5, 5);
INSERT INTO post_comment_rel(post_id, comment_id) VALUES (1, 6);
