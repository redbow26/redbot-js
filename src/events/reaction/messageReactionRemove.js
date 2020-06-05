const MessageModel = require('../../database/models/message');
const { findRole } = require('../../utils/discordUtils.js');
const cachedMessageReactions = new Map();

module.exports = async (client, reaction, user) => {
    let rmMemberRole = (emojiRoleMappings) => {
        let emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/

        if (emojiRegex.test(reaction.emoji.name)){
            let roleId = emojiRoleMappings[reaction.emoji.name];
            let role = findRole(reaction.message.guild, roleId);
            let member = reaction.message.guild.members.cache.get(user.id);            

            if (role && member) {
                member.roles.remove(role);
            }
        }
        else if (emojiRoleMappings.hasOwnProperty(reaction.emoji.id)) {
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
                client.cachedMessageReactions.set(id, msgDocument.emojiRoleMappings);
                let { emojiRoleMappings } = msgDocument;
                rmMemberRole(emojiRoleMappings);
                
            }
        } catch (err) {
            err => console.log(err);
        }
    }
    else {
        let emojiRoleMappings = client.cachedMessageReactions.get(reaction.message.id);
        if (emojiRoleMappings)
            rmMemberRole(emojiRoleMappings);
    }
}