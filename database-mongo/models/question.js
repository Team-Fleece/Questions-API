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
          answer_id: {type: Number, required: true},
          question_id: {type: Number, required: true},
          body: {type: String, required: true},
          date: {type: Date, default: Date.now},
          answerer_name: {type: String, required: true},
          answerer_email: {type: String, required: true},
          reported: {type: Boolean, default: false},
          helpfulness: {type: Number, required: true},
          photos: [{
            id: {type: Number, required: true},
            answer_id: {type: Number, required: true},
            url: {type: String, required: true},
          }]
  }]
});

const Question = db.model("Question", questionSchema);

function addQuestions() {
  let filename = path.join(__dirname, 'questions.csv')
  let errors = [];
  let counter = 0;
  let batch = [];
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

function addAnswers() {
  let filename = path.join(__dirname, 'answerssorted.csv')
  let errors = [];
  let batch = [];
  let countAnswers = 0;
  let currentQuestion = 0;
  const stream = fs.createReadStream(filename)
  .pipe(csv(['answer_id', 'question_id', 'body', 'date', 'answerer_name', 'asker_email', 'reported', 'question_helpfulness']))
  .on('data', (data) => {
      if(data.reported === 'f') {
        data.reported = 0;
      } else if (data.reported === 't') {
        data.reported = 1;
      }
      if(currentQuestion == 0 || currentQuestion == data.question_id) {
        batch.push(data);
        currentQuestion = data.question_id;
      }
      else {
      stream.pause()
      let filter = {question_id: currentQuestion};
      let update = {answers: batch};
      let currentData = data;
      Question.findOneAndUpdate(filter, update)
        .then(data => {
          countAnswers += batch.length;
          console.log(batch.length, 'Answers inserted');
          console.log(countAnswers, 'Total Answers\n')
          batch = [currentData];
          currentQuestion = currentData.question_id;
          stream.resume()
        })
        .catch(err => {
          console.log("Error here!!!!\n", err);
          errors.push(batch);
          currentQuestion = 0;
          batch = [];
          stream.resume()
        })
      }
  })
  .on('error', (e) => {
    console.error("What?\n", e)
  })
  .on('end', () => {
    let filter = {question_id: currentQuestion};
    let update = {answers: batch};
    Question.findOneAndUpdate(filter, update)
      .then(data => {
        countAnswers += batch.length;
        console.log(countAnswers, 'Answers inserted');
        console.log(errors);
      })
      .catch(err => {
        console.log("Error here!!!!\n", err);
        errors.push(batch);
        console.log(countAnswers, 'Answers inserted');
        console.log(errors);
      })
    console.log('end');
  });
};

function addPhotos() {
  let filename = path.join(__dirname, 'answers_photos.csv')
  let errors = [];
  let batch = [];
  let countPhotos = 0;
  let currentAnswer = 5;
  const stream = fs.createReadStream(filename)
  .pipe(csv(['id', 'answer_id', 'url']))
  .on('data', (data) => {
      if(currentAnswer == data.answer_id) {
        batch.push(data);
      }
      else {
      stream.pause()
      let currentData = data;
      Question.findOneAndUpdate({"answers.answer_id": currentAnswer}, {"$set": {"answers.$.photos": batch}})
        .then(data => {
          countPhotos += batch.length;
          console.log(batch.length, 'Answers inserted');
          console.log(countPhotos, 'Total Photos\n')
          batch = [currentData];
          currentAnswer = currentData.answer_id;
          stream.resume()
        })
        .catch(err => {
          console.log("Error here!!!!\n", err);
          errors.push(batch);
          batch = [currentData];
          currentAnswer = currentData.answer_id;
          stream.resume()
        })
      }
  })
  .on('error', (e) => {
    console.error("What?\n", e)
  })
  .on('end', () => {
    Question.findOneAndUpdate({"answers.answer_id": currentAnswer}, {"$set": {"answers.$.photos": batch}})
      .then(data => {
        countPhotos += batch.length;
        console.log(countPhotos, 'Photos inserted');
        console.log(errors);
      })
      .catch(err => {
        console.log("Error here!!!!\n", err);
        errors.push(batch);
        console.log(countPhotos, 'Photos inserted');
        console.log(errors);
      })
    console.log('end');
  });
};

// addQuestions();
// addAnswers();
addPhotos();

module.exports = Question;