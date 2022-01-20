const {Pool} = require('pg');
const config = require('../config.js');

const pool = new Pool(config);

module.exports.getQuestions = (req, res) => {
  let { product_id, page, count } = req.query;
  pool.query(`SELECT q.id AS question_id, q.body AS question_body, q.date_written AS question_date, asker_name, q.helpful AS question_helpfulness, q.reported, jsonb_object_agg(a.id, json_build_object
    (
    'id', a.id,
    'body', a.body,
    'date', a.date_written,
    'answerer_name', answerer_name,
    'helpfulness', a.helpful,
    'photos', COALESCE((SELECT json_agg(url) from photos JOIN answers ON photos.answer_id = answers.id WHERE answers.id = a.id), json_build_array())
    )
  ) as answers FROM questions q JOIN answers a ON q.id = a.question_id WHERE q.product_id = $1 AND q.reported = false GROUP BY q.id, q.body, q.date_written, asker_name, q.helpful, q.reported`, [product_id], (error, questions) => {
    if (error) {
      console.log(error);
      res.sendStatus(404)
    } else {
      count = count || 5;
      page = page || 1;
      let results = [];
      let lowerBound = count * (page - 1);
      let upperBound = count * page - 1;
      while (lowerBound <= upperBound) {
        let question = questions.rows[lowerBound];
        if (!question) {
          break;
        }
        results.push(question);
        lowerBound++;
      }
      let response = {
        product_id,
        results
      }
      res.status(200).json(response)
    }
  })
}

module.exports.getAnswers = (req, res) => {
  let { question_id } = req.params;
  let { page, count } = req.query;
  pool.query(`SELECT answers.id AS answer_id, body, date_written AS date, answerer_name, helpful AS helpfulness, COALESCE(
    (SELECT json_agg(json_build_object
      ('id', photos.id,
      'url',url)
      ) from photos JOIN answers a ON photos.answer_id = a.id WHERE a.id = answers.id), json_build_array()
  ) as photos FROM answers WHERE answers.question_id = $1 AND reported = false GROUP BY answers.id, body, date_written, answerer_name, helpful ORDER BY answers.id`, [question_id], (error, answers) => {
    if (error) {
      console.log(error);
      res.status(404).json(error)
    } else {
      count = count || 5;
      page = page || 1;
      let results = [];
      let lowerBound = count * (page - 1);
      let upperBound = count * page - 1;
      while (lowerBound <= upperBound) {
        let answer = answers.rows[lowerBound];
        if (!answer) {
          break;
        }
        results.push(answer);
        lowerBound++;
      }
      let response = {
        question: question_id,
        page,
        count,
        results
      }
      res.status(200).json(response)
    }
  })
}

module.exports.addQuestions = (req, res) => {
  let {product_id, body, name, email} = req.body;
  name = name || '';
  body = body || '';
  pool.query('INSERT INTO questions (product_id, body, asker_name, asker_email) VALUES ($1, $2, $3, $4)', [product_id, body, name, email], (error, results) => {
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
    res.sendStatus(201);
    }
  })
}

module.exports.addAnswers = (req, res) => {
  let { question_id } = req.params;
  let {body, name, email, photos} = req.body;
  body = body || '';
  pool.query('SELECT * FROM questions WHERE id = $1', [question_id])
    .then(question => {
      if (!question.rows.length) {
        console.log('Invalid question_id')
        res.sendStatus(500);
        return;
      } else {
        return pool.query('INSERT INTO answers (question_id, body, answerer_name, answerer_email) VALUES ($1, $2, $3, $4) RETURNING id', [question_id, body, name, email])
      }
    })
    .then(answer => {
      if (photos) {
        console.log(answer.rows[0].id);
        let answer_id = answer.rows[0].id;
        let photosToInsert = photos.map(photo => {
          return pool.query('INSERT INTO photos (answer_id, url) VALUES ($1, $2)', [answer_id, photo])
        })
        console.log('Tried promise');
        return Promise.all[photosToInsert];
      }
    })
    .then(result => {
      console.log('Sent photo');
      res.sendStatus(201);
    })
    .catch(error => {
      console.log(error);
      res.sendStatus(500);
    });
}

module.exports.questionHelpful = (req, res) => {
  let { question_id } = req.params;
  pool.query('UPDATE questions SET helpful = helpful + 1 WHERE id = $1', [question_id], (error, answers) => {
    if (error) {
      console.log(error);
      res.status(500).json(error)
    } else {
      res.status(204).json(1)
    }
  })
}

module.exports.answerHelpful = (req, res) => {
  let { answer_id } = req.params;
  pool.query('UPDATE answers SET helpful = helpful + 1 WHERE id = $1', [answer_id], (error, answers) => {
    if (error) {
      console.log(error);
      res.status(500).json(error)
    } else {
      res.status(204).json(1)
    }
  })
}

module.exports.questionReport = (req, res) => {
  let { question_id } = req.params;
  pool.query('UPDATE questions SET reported = true WHERE id = $1', [question_id], (error, answers) => {
    if (error) {
      console.log(error);
      res.status(500).json(error)
    } else {
      res.status(204).json(1)
    }
  })
}

module.exports.answerReport = (req, res) => {
  let { answer_id } = req.params;
  pool.query('UPDATE answers SET reported = true WHERE id = $1', [answer_id], (error, answers) => {
    if (error) {
      console.log(error);
      res.status(500).json(error)
    } else {
      res.status(204).json(1)
    }
  })
}