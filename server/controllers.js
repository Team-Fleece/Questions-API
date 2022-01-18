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
        answers: 1,
      }
    )
    .then((questions) => {
      count = count || 5;
      page = page || 1;
      let results = [];
      let lowerBound = count * (page - 1);
      let upperBound = count * page - 1;

      while (lowerBound <= upperBound) {
        if (!questions[lowerBound]) {
          break;
        }
        let question = questions[lowerBound];
        answers = {};
        for (var i = 0; i < question.answers.length; i++) {
          let answer = question.answers[i];
          if (answer.reported === false) {
            let answerFormated = {
              id: answer.answer_id,
              body: answer.body,
              date: answer.date,
              answerer_name: answer.answerer_name,
              helpfulness: answer.helpfulness,
              photos: answer.photos
            };
            answers[answerFormated.id] = answerFormated;
          }
        }
        let questionFormatted = {
          question_id: question.question_id,
          question_body: question.question_body,
          question_date: question.question_date,
          asker_name: question.asker_name,
          reported: false,
          question_helpfulness: question.question_helpfulness,
          answers
        }
        results.push(questionFormatted);
        lowerBound++;
      }
      let response = {
        product_id,
        results
      }
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
    });
};
