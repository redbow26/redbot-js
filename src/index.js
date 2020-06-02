require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs').promises;
const path = require('path');

const PREFIX = process.env.PREFIX;

client.login(process.env.BOT_TOKEN);

client.commands = new Map();

client.on('ready', () => {
    console.log('Bot ready')
});


client.on('message', message => {
    if (message.author.bot) return;

    if (!message.content.startsWith(PREFIX)) return;
    let cmdArgs = message.content.substring(message.content.indexOf(PREFIX) + 1).split(new RegExp(/\s+/));
    let cmdName = cmdArgs.shift();

    if (client.commands.get(cmdName))
        client.commands.get(cmdName)(client, message, cmdArgs);
    else
        console.log(cmdName + " does not exist.");
});


(async function registerCommands(dir = 'commands') {
    // Read the directory/file
    let files = await fs.readdir(path.join(__dirname, dir));
    // Loop through each file
    for (let file of files) {
        let stat = await fs.lstat(path.join(__dirname, dir, file));
        if (stat.isDirectory()) // If file is a directory, recursive call 
            registerCommands(path.join(dir, file));
        else {
            // Check if file is a .js file
            if (file.endsWith('.js')) {
                let cmdName = file.substring(0, file.indexOf(".js"));
                let cmdModule = require(path.join(__dirname, dir, file));
                let { aliases } = cmdModule;
                client.commands.set(cmdName, cmdModule.run);
                if (aliases.length !== 0)
                    aliases.forEach(alias => { client.commands.set(alias, cmdModule.run)});
            }
        }
    }
})();