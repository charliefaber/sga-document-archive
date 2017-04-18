var mongoose = require('mongoose');

var documentSchema = mongoose.Schema({
      _id: String,
      path: String,
      docType: String,
      amount: String,
      date: String,
      tagline: String,
      text: String;
});

module.exports = mongoose.model('Document' ,documentSchema);