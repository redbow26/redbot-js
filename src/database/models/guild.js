const mongoose = require('mongoose');
require('dotenv').config();

const GuildSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    guildName: { type: String, required: true },
    prefix: { type: String, required: true, default: process.env.BASE_PREFIX }
});

module.exports = mongoose.model('guild', GuildSchema);