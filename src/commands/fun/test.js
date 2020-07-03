module.exports = {
    run: async (client, message, args) => {
        message.channel.send("this is a test.")
    },
    name: "",
    aliases: ['t', 'tests'],
    description: "Test command",
    arg: false,
} 