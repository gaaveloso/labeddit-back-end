-- Active: 1678460683474@@127.0.0.1@3306

CREATE TABLE users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL
);

INSERT INTO users (id, name, email, password, role)
VALUES
	("u001", "Veloso", "veloso@email.com", "veloso123", "ADMIN"),
	("u002", "Maria", "maria@email.com", "maria123", "NORMAL");

CREATE TABLE posts (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    creator_id TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT (0) NOT NULL,
    dislikes INTEGER DEFAULT (0) NOT NULL,
    comments INTEGER DEFAULT(0) NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO posts (id, creator_id, content)
VALUES
    ("p001", "u001", "Estudando React hoje"),
    ("p002", "u002", "Assistindo netflix");

CREATE TABLE posts_likes_dislikes(
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    like INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
INSERT INTO posts_likes_dislikes (user_id, post_id, like)
VALUES
    ("u001", "p002", 1),
    ("u002", "p001", 1);

CREATE TABLE comments(
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    post_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    likes INTEGER DEFAULT (0) NOT NULL,
    dislikes INTEGER DEFAULT (0) NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO comments (id, post_id, creator_id, content)
VALUES
    ("c001", "p002", "u001", "O que você está assistindo?"),
    ("c002", "p001", "u002", "Está estudando por onde?");


CREATE TABLE comments_likes_dislikes (
    user_id TEXT NOT NULL,
    comment_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    like INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO comments_likes_dislikes (user_id, comment_id, post_id, like)
VALUES
    ("u002", "c001", "p002", 1),
    ("u001", "c002", "p001", 0);

SELECT * FROM users;
SELECT * FROM posts;
SELECT * FROM posts_likes_dislikes;
SELECT * FROM comments;
SELECT * FROM comments_likes_dislikes;
