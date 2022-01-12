const db = require('mongoose');

db.connect('mongodb://localhost/QAndADB')
  .catch(error => {
    console.error('Error: ', error);
  })

module.exports = db;