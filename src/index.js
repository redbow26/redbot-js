require('dotenv').config();
const discord = require('discord.js');
const client = new discord.Client({ partials: ['MESSAGE', 'REACTION']});
const { registerCommands, registerEvents } = require('./utils/registry');
const database = require("./database/database");
require("./utils/database/function")(client);
(async () => {
    client.login(process.env.BOT_TOKEN);
    client.commands = new Map();
    client.cachedMessageReactions = new Map();
    client.cachedGuild = new Map();
    await registerEvents(client, '../events');
    await registerCommands(client, '../commands'); 
})();