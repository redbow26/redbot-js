const PREFIX = process.env.PREFIX;

module.exports = (client, message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(PREFIX)) return;
    let cmdArgs = message.content.substring(message.content.indexOf(PREFIX) + 1).split(new RegExp(/\s+/));
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
            cmd(client, message, cmdArgs);
        }
    else
        client.emit("command_not_found", cmdName);
}