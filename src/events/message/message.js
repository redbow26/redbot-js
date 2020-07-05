module.exports = async (client, message) => {
    if (message.author.bot) return;

    if (!message.guild) return;

    let setting = await client.getGuild(message.guild);

    if (!message.content.startsWith(setting.prefix)) return;
    let cmdArgs = message.content.substring(message.content.indexOf(setting.prefix) + 1).split(new RegExp(/\s+/));
    let cmdName = cmdArgs.shift();
    let cmd = client.commands.get(cmdName);

    if (cmd)
        {
        if (cmd.arg)
            if (cmdArgs >= 1)
                cmd.run(client, message, cmdArgs);
            else
                client.emit("missing_arg", message)
        else
            cmd.run(client, message, cmdArgs);
        }
    else
        client.emit("command_not_found", cmdName);
}