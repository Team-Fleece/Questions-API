const db = require('../database-mongo');
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
  answers: [{type: db.Schema.Types.ObjectId, ref: 'Answer'}]
});

const Question = db.model("Question", questionSchema);

let addPreviousData = () => {
  let filename = path.join(__dirname, 'questions.csv')
  let dataToInsert = [];
  fs.createReadStream(filename)
  .pipe(csv(['question_id', 'product_id', 'question_body', 'question_date', 'asker_name', 'asker_email', 'reported', 'question_helpfulness']))
  .on('data', (data) => Question.create(data))
  .on('end', () => {
    console.log('Ended');
  });
  // let data = fs.readFileSync(filename, (err, fileData) {
  //   parse
  // });
  // let dataArray = data.split('\n').map((row) => row.split(','));
  // let dataToInsert = dataArray.map(current => {
  //   return {
  //     question_id: Number(current[0]),
  //     product_id: Number(current[1]),
  //     question_body: current[2],
  //     question_date: current[3],
  //     asker_name: current[4],
  //     asker_email: current[5],
  //     reported: current[6],
  //     question_helpfulness: Number(current[7])
  //   };
  // });
  // console.log(dataToInsert);
  // Question.create(dataToInsert)
  // .then(() => mongoose.connection.close())
  // .catch((err) => console.log(err));
};

addPreviousData();





module.exports = Question;