const express = require('express');
const app = express();
const port = process.env.PORT || 3070;
const morgan = require('morgan');
const {getQuestions, getAnswers} = require('./controllers.js');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/qa/questions/:question_id/answers', (req, res) => {
  getAnswers(req, res);
})

app.get('/qa/questions', (req, res) => {
  if (!req.query.product_id) {
    res.status(422).json('Error: invalid product_id provided');
  } else {
    getQuestions(req, res);
  }
})


app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})