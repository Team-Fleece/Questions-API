const questions = require("../database-mongo/question.js");

module.exports.getQuestions = (req, res) => {
  console.log(req.query);
  let { product_id, page, count } = req.query;
  questions
    .find(
      { product_id, reported: false },
      {
        _id: 0,
        question_id: 1,
        question_body: 1,
        question_date: 1,
        asker_name: 1,
        question_helpfulness: 1,
        reported: 1,
        answers: 1
      }
    )
    .then((questions) => {
      count = count || 5;
      page = page || 1;
      let results = questions.filter((question, index) => {
        let lowerBound = count * (page - 1);
        let upperBound = count * page - 1;
        return index >= lowerBound && index <= upperBound;
      })
      res.status(200).json(results);
    })
    .catch((err) => {
      console.log(err);
    });
};
