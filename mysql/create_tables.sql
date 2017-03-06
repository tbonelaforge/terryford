CREATE DATABASE IF NOT EXISTS arithmetic;

CREATE TABLE IF NOT EXISTS arithmetic.user (
       id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
       initials CHAR(3),
       created_date DATETIME
);

CREATE TABLE IF NOT EXISTS arithmetic.user_score (
       id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       score INT,
       level VARCHAR(255),
       created_date DATETIME
);
