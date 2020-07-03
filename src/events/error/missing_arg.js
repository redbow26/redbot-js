// Custom Event

module.exports = async (client, message) => {
    let msg = await message.channel.send('Command need argument');
    await msg.delete({ timeout: 3500 }).catch(err => console.log(err));
}