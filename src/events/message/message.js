const PREFIX = process.env.PREFIX;

module.exports = (client, message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(PREFIX)) return;
    let cmdArgs = message.content.substring(message.content.indexOf(PREFIX) + 1).split(new RegExp(/\s+/));
    let cmdName = cmdArgs.shift();

    if (client.commands.get(cmdName))
        client.commands.get(cmdName)(client, message, cmdArgs);
    else
        console.log(cmdName + " does not exist.");
}