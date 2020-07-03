// Custom Event

module.exports = async (client, message) => {
    msg = message.reply('Command need argument')
    await msg.delete({ timeout: 3500 }).catch(err => console.log(err));
}