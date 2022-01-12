const db = require('../database-mongo');

const answerSchema = new db.Schema({
  answer_id: Number,
  question_id: Number,
  body: String,
  date: {type: Date, default: Date.now},
  answerer_name: String,
  helpfulness: Number,
  reported: {type: Boolean, default: false}
  photos: [{id: Number, url: String}]
})

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;