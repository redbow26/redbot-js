module.exports = {
    run: async (client, message, args) => {
        message.channel.send("this is a test.")
    },
    aliases: ['t', 'tests'],
    description: "Test command"
} 