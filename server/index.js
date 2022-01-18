const express = require('express');
const app = express();
const port = process.env.PORT || 3070;
const morgan = require('morgan');
const {getQuestions} = require('./controllers.js');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/qa/questions/:question_id/answers', (req, res) => {
  let {question_id} = req.params;
  let {page, count} = req.query;
  res.status(200).json('Ok');
})

app.get('/qa/questions', (req, res) => {
  let {product_id, page, count} = req.query;
  if (!product_id) {
    res.status(422).json('Error: invalid product_id provided');
  } else {
    getQuestions(req, res);
    // console.log('query', req.query)
  }
})


app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})