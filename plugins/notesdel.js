module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) return m.reply(`Example: ${usedPrefix + command} note name`)
    let msgs = global.db.data.database[m.chat]
    if (!(text.toLowerCase() in msgs)) return m.reply('Gaada ngab!')
    delete msgs[text.toLowerCase()];
    m.reply('berhasil ngab!')
}
anuplug.help = ['delnote']
anuplug.tags = ['owner']
anuplug.command = /^(delnote|dn)/i
anuplug.isAnubis = true