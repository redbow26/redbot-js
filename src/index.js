require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs').promises;
const path = require('path');
const { checkCommandModule, checkProperties } = require('./utils/validate');
const tableConfig = require('./utils/tableConfig');
const { createStream, table } = require('table');
const c = require('ansi-colors');

const commandStatus = [
    [`${c.bold('Command')}`, `${c.bold('Status')}`, `${c.bold("Description")}`]
];

const PREFIX = process.env.PREFIX;

client.login(process.env.BOT_TOKEN);

client.commands = new Map();

client.on('ready', () => {
    console.log('Bot ready');
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
})().then( () => {
    let stream = createStream(tableConfig);
    let i = 0;
    let fn = setInterval(() => {
        if (i === commandStatus.length){
            clearInterval(fn);
            console.log("\n")
        }
        else {
            stream.write(commandStatus[i]);
            i++;
        }
    }, 250);
});
