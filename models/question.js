const db = require('../database-mongo');

const questionSchema = new db.Schema({
  question_id: Number
  product_id: Number,
  question_body: String,
  question_date: {type: Date, default: Date.now},
  asker_name: String,
  question_helpfulness: Number,
  reported: {type: Boolean, default: false},
  answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}]
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;