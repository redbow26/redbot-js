require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });