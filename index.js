require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const PREFIX = process.env.PREFIX;

client.on('ready', () => {
    console.log('Bot ready')
});

client.login(process.env.BOT_TOKEN).then(r => console.log(r))

const isValidCommand = (message, cmdName) => message.content.toLowerCase().startsWith(PREFIX + cmdName)


client.on('message', message => {

    if (message.author.bot) return;
    if (isValidCommand(message, "test"))
        message.channel.send("this is a test.")

})