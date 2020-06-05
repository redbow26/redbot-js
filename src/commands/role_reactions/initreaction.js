const { MessageCollector } = require('discord.js');

const { findEmoji, findRole } = require('../../utils/discordUtils.js');

const MessageModel = require('../../database/models/message')

let msgCollectorFilter = (newMsg, originalMsg) => newMsg.author.id === originalMsg.author.id;

module.exports = {
    run: async (client, message, args) => {
        if (args.length !== 1) {
            let msg = await message.channel.send("Too many arguments. Must only provide 1 message id");
            await msg.delete({ timeout: 3500 }).catch(err => console.log(err));
        }
        else {
            try {
                let fetchedMessage = await message.channel.messages.fetch(args[0]);
                if (fetchedMessage) {
                    await message.channel.send("Please provide all the emoji names with the role name, one by one, separated with a space and send \"end\" when you're done. \nYou can give name, id, emoji form for the emoji and name, id, tag for the role \ne.g: emoji role\ne.g: :iphone: iphone");
                    let collector = new MessageCollector(message.channel, msgCollectorFilter.bind(null, message));
                    let emojiRoleMappings = new Map();
                    collector.on('collect', msg => {

                        if (msg.content.toLowerCase() === 'end'){
                            collector.stop('end command');
                            return;
                        }

                        let args = msg.content.split(/\s+?/)
                        if (args.length !== 2) return;

                        let emoji = findEmoji(msg.guild, args[0]);
                        let role = findRole(msg.guild, args[1]);

                        if (!emoji) {
                            msg.channel.send("Emoji not found")
                            .then(msg => msg.delete({ timeout: 3500 }))
                            .catch(err => console.log(err));
                            return;
                        }

                        if (!role){
                            msg.channel.send("Role not found")
                            .then(msg => msg.delete({ timeout: 3500 }))
                            .catch(err => console.log(err));
                            return;
                        }

                        if (emoji && role) {
                            fetchedMessage.react(emoji)
                            .then()
                            .catch(err => console.log(err));
                            emojiRoleMappings.set(emoji.id, role.id);
                        }
                        msg.delete({ timeout: 5000 }).catch(err => console.log(err));
                    });
                    collector.on('end', async (collected, reason) => {
                        let findMsgDocument = await MessageModel
                            .findOne({ messageId: fetchedMessage.id })
                            .catch(err => console.log(err));

                        if (findMsgDocument){
                            message.channel.send("A role reaction set up exists for this message already.")
                            .then(delete({ timeout: 5000 }))
                            .catch(err => console.log(err))
                        }
                        else{
                            let dbMsgModel = new MessageModel({
                                messageId: fetchedMessage.id,
                                emojiRoleMappings: emojiRoleMappings
                            });
                            dbMsgModel.save()
                                .then()
                                .catch(err => console.log(err));
    
                            message.channel.send("Role reation setup complete.")
                                .then(delete({ timeout: 3500 }))
                                .catch(err => console.log(err))
                        }
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }
    },
    name: "",
    aliases: [],
    description: "Enables a message to listen to reactions to give roles"
} 