/*
install
*/
require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { createStream } = require('table');
const c = require('ansi-colors');

// Require file
const { checkCommandModule, checkProperties } = require('./utils/validate');
const tableConfig = require('./utils/tableConfig');
const { findEmoji, findRole } = require('./utils/discordUtils.js');
// Database
const database = require('./database/database');
const MessageModel = require('./database/models/message');

const cachedMessageReactions = new Map();

const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION']});
const commandStatus = [
    [`${c.bold('Command')}`, `${c.bold('Status')}`, `${c.bold("Description")}`]
];

// ENV
const PREFIX = process.env.PREFIX;

client.commands = new Map();

client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
    let stream = createStream(tableConfig);
    let i = 0;
    let fn = setInterval(() => {
        if (i === commandStatus.length){
            clearInterval(fn);
            console.log("\n")
            console.log('Bot ready');
        }
        else {
            stream.write(commandStatus[i]);
            i++;
        }
    }, 250);
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


client.on('messageReactionAdd', async (reaction, user) => {
    let addMemberRole = (emojiRoleMappings) => {
        if (emojiRoleMappings.hasOwnProperty(reaction.emoji.id)) {
            let roleId = emojiRoleMappings[reaction.emoji.id];
            let role = findRole(reaction.message.guild, roleId);
            let member = reaction.message.guild.members.cache.get(user.id);            

            if (role && member) {
                member.roles.add(role);
            }
        }
    }

    if (reaction.message.partial) {
        await reaction.message.fetch();
        let { id } = reaction.message;
        try {
            let msgDocument = await MessageModel.findOne({ messageId: id });
            if (msgDocument) {
                cachedMessageReactions.set(id, msgDocument.emojiRoleMappings);
                let { emojiRoleMappings } = msgDocument;
                addMemberRole(emojiRoleMappings);
                
            }
        } catch (err) {
            err => console.log(err);
        }
    }
    else {
        let emojiRoleMappings = cachedMessageReactions.get(reaction.message.id);
        if (emojiRoleMappings)
            addMemberRole(emojiRoleMappings);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    let rmMemberRole = (emojiRoleMappings) => {
        if (emojiRoleMappings.hasOwnProperty(reaction.emoji.id)) {
            let roleId = emojiRoleMappings[reaction.emoji.id];
            let role = findRole(reaction.message.guild, roleId);
            let member = reaction.message.guild.members.cache.get(user.id);

            if (role && member) {
                member.roles.remove(role);
            }
        }
    }

    if (reaction.message.partial) {
        await reaction.message.fetch();
        let { id } = reaction.message;
        try {
            let msgDocument = await MessageModel.findOne({ messageId: id });
            if (msgDocument) {
                cachedMessageReactions.set(id, msgDocument.emojiRoleMappings);
                let { emojiRoleMappings } = msgDocument;
                rmMemberRole(emojiRoleMappings);
                
            }
        } catch (err) {
            err => console.log(err);
        }
    }
    else {
        let emojiRoleMappings = cachedMessageReactions.get(reaction.message.id);
        if (emojiRoleMappings)
            rmMemberRole(emojiRoleMappings);
    }
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

                try {
                    let cmdModule = require(path.join(__dirname, dir, file));
                    if (checkCommandModule(cmdName, cmdModule)) {
                        if (checkProperties(cmdName, cmdModule)) {
                            
                            if (cmdModule.name !== "") 
                                cmdName = cmdModule.name;
                            
                            let { aliases } = cmdModule;
        
                            client.commands.set(cmdName, cmdModule.run);
        
                            if (aliases.length !== 0)
                                aliases.forEach(alias => { client.commands.set(alias, cmdModule.run) });

                            commandStatus.push(
                                [`${c.white(`${cmdName}`)}`, `${c.bgGreenBright.black('Success')}`, `${c.white(`${cmdModule.description}`)}`]
                            );
                        }
                    }
                } catch (e) {
                    console.log(e.message);
                    commandStatus.push(
                        [`${c.white(`${cmdName}`)}`, `${c.bgRedBright.black('Failed')}`, '']
                    );
                }
            }
        }
    }
})();
