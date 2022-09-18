module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix, isAnubis }) => {
    if (!text) return m.reply(`Example: ${usedPrefix + command} note name`)
    let msgs = global.db.data.database[m.chat]
    if (!(text.toLowerCase() in msgs)) return m.reply(`lawak bener lu ngab! '${text}' gak ada ngab!`)
    if (msgs[text.toLowerCase()].lock && !isAnubis) return m.reply('ga liat itu di lock!')
    return anubis.copyNForward(m.chat, msgs[text.toLowerCase()].pesan, true);
}
anuplug.help = ['get']
anuplug.tags = ['group']
anuplug.command = /^(get)/i
anuplug.group = true