const db = require('../index.js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const questionSchema = new db.Schema({
  question_id: {type: Number, required: true},
  product_id: {type: Number, required: true},
  question_body: {type: String, required: true},
  question_date: {type: Date, required: true},
  asker_name: {type: String, required: true},
  asker_email: {type: String, required: true},
  reported: {type: Boolean, default: false},
  question_helpfulness: {type: Number, required: true},
  answers: [{
          answer_id: Number,
          question_id: Number,
          body: String,
          date: {type: Date, default: Date.now},
          answerer_name: String,
          helpfulness: Number,
          reported: {type: Boolean, default: false},
          photos: [{id: Number, url: String}]
  }]
});

const Question = db.model("Question", questionSchema);

function addQuestions() {
  let filename = path.join(__dirname, 'questions.csv')
  let errors = [];
  let counter = 0;
  let batch = []
  const stream = fs.createReadStream(filename)
  .pipe(csv(['question_id', 'product_id', 'question_body', 'question_date', 'asker_name', 'asker_email', 'reported', 'question_helpfulness']))
  .on('data', (data) => {
      batch.push(data)
      counter ++
      if(counter > 1000) {
        stream.pause()
        Question.create(batch)
        .then(data => {
          counter = 0;
          batch = []
          stream.resume()
        })
        .catch(err => {
          console.log("Error here!!!!\n", err);
          counter = 0;
          batch = []
          stream.resume()
        })
      }
  })
  .on('error', (e) => {
    console.error("What?\n", e)
  })
  .on('end', () => {
    Question.create(batch)
    .then(data => {
      counter = 0;
      batch = []
    })
    .catch(err => {
      console.log("Error here!!!!\n", err);
    })
    console.log('end');
  });
};




addQuestions();


module.exports = Question;