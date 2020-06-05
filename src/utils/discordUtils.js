module.exports.findEmoji = (guild, value) => {
    let { emojis } = guild;
    let emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/
    let emoji;

    if (/^<:.+:\d+>$/.test(value))
        value = value.replace(/\D/g, '');

    if (/^\d+$/.test(value))
        emoji = emojis.cache.get(value);
    else if (emojiRegex.test(value))
        emoji = value;
    else 
        emoji = emojis.cache.find(emoji => emoji.name.toLowerCase() === value.toLowerCase());

    return emoji;
}

module.exports.findRole = (guild, value) => {
    let { roles } = guild;
    let role;

    if (/^<@&\d+>$/.test(value))
        value = value.replace(/\D/g, '');


    if (/^\d+$/.test(value))
        role = roles.cache.get(value);
    else
        role = roles.cache.find(role => role.name.toLowerCase() === value.toLowerCase());

    return role;
}





