const express = require('express');
const app = express();
const port = process.env.PORT || 3070;
// const morgan = require('morgan');
const {getQuestions, getAnswers, addQuestions, addAnswers, questionHelpful, answerHelpful, questionReport, answerReport} = require('../database-postgres');

// app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/qa/questions/:question_id/answers', (req, res) => {
  if (req.params.question_id === ':question_id') {
    res.status(404).json('Error: invalid question id provided');
  } else {
    getAnswers(req, res);
  }
})

app.get('/qa/questions', (req, res) => {
  if (!req.query.product_id) {
    res.status(422).json('Error: invalid product_id provided');
  } else {
    getQuestions(req, res);
  }
})

app.post('/qa/questions', (req, res) => {
  if (!req.body.product_id) {
    res.sendStatus(400);
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(req.body.email)){
    res.status(422).json('Error: Question body contains invalid entries');
  } else {
    addQuestions(req, res);
  }
})

app.post('/qa/questions/:question_id/answers', (req, res) => {
  let errMessage = 'Error: Answer body contains invalid entries';
  let errors = 0;
  if (!req.body.name) {
    errMessage += ' username text is required ';
    errors++;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(req.body.email)) {
    errMessage += ' email must be valid ';
    errors++;
  }
  if (req.body.photos) {
    for (var i = 0; i < req.body.photos.length; i++) {
      if (typeof req.body.photos[i] !== 'string') {
        errMessage += ' photos must contain text urls ';
        errors++;
        break;
      }
    }
  }
  if(errors) {
    res.status(422).json(errMessage);
  } else {
    addAnswers(req, res);
  }
})

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  questionHelpful(req, res);
})

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  if (req.params.answer_id === ':answer_id') {
    res.status(404).json('Error: invalid answer id provided');
  } else {
    answerHelpful(req, res);
  }
})

app.put('/qa/questions/:question_id/report', (req, res) => {
  questionReport(req, res);
})

app.put('/qa/answers/:answer_id/report', (req, res) => {
  if (req.params.answer_id === ':answer_id') {
    res.status(404).json('Error: invalid answer id provided');
  } else {
    answerReport(req, res);
  }
})

app.get('/loaderio-a3009e923f03cb5cba7683069608462a/', (req, res) => {
  var dirPath = __dirname;
  res.sendFile(`${dirPath}/loaderio-a3009e923f03cb5cba7683069608462a.txt`);
})

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})