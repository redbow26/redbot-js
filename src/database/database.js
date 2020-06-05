const mongoose = require('mongoose');

module.exports = mongoose.connect('mongodb://localhost:27017/redbot', { useNewUrlParser: true, useUnifiedTopology: true });