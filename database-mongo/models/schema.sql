
COPY (SELECT * FROM answers ORDER BY question_id ASC, id ASC) TO '/Users/reh/Documents/SEI/questions-api/qa-data/answerssorted.csv' DELIMITER ',' CSV HEADER;

-- run command psql -d questionsapi -f database-mongo/models/schema.sql
