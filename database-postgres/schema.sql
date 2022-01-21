DROP TABLE IF EXISTS questions, answers, photos;

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER,
  body TEXT,
  date_written DATE DEFAULT CURRENT_DATE,
  asker_name VARCHAR(40),
  asker_email VARCHAR(40),
  reported BOOLEAN DEFAULT FALSE,
  helpful INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER,
  body TEXT,
  date_written DATE DEFAULT CURRENT_DATE,
  answerer_name VARCHAR(40),
  answerer_email VARCHAR(40),
  reported BOOLEAN DEFAULT FALSE,
  helpful INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  answer_id INTEGER,
  url TEXT
);

COPY questions FROM '/home/ubuntu/questions-api/qa-data/questions.csv' DELIMITER ',' CSV HEADER;

CREATE INDEX product_id_idx ON questions (product_id);

COPY answers FROM '/home/ubuntu/questions-api/qa-data/answers.csv' DELIMITER ',' CSV HEADER;

CREATE INDEX question_id_idx ON answers (question_id);

COPY photos FROM '/home/ubuntu/questions-api/qa-data/answers_photos.csv' DELIMITER ',' CSV HEADER;

CREATE INDEX answer_id_idx ON photos (answer_id);

-- run command psql -d questionsapi -f database-postgres/schema.sql
