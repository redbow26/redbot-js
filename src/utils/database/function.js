const mongoose = require("mongoose");
const GuildModel = require('../../database/models/guild');

module.exports = client => {
    client.createGuildDB = async guild => {
        let dbGuildModel = new GuildModel({
            guildId: guild.id,
            guildName: guild.name
        });
        dbGuildModel.save()
            .then()
            .catch(err => console.log(err));
    },
    client.deleteGuildDB = async guild => {
        GuildModel.deleteOne({ guildId: guild.id})
        .then()
        .catch(err => console.log(err));
    },
    client.getGuild = async guild => {
        let guildFound = client.cachedGuild.get(guild.id);
        if (!guildFound) {
            try {
                let guildDocument = await GuildModel.findOne({ guildId: guild.id });
                if (!guildDocument) {
                    
                    await client.createGuildDB(guild);
                    guildDocument = await client.getGuild(guild);
                }
                
                client.cachedGuild.set(guild.id, guildDocument);
                guildFound = guildDocument;
            } catch (err) {
                err => console.log(err);
            }
        }
        return guildFound;
    }
}