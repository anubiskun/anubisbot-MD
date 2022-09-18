module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) return m.reply(`Example: ${usedPrefix + command} namalama|namabaru`)
    const [nama, ganti] = text.split('|')
    if (!nama) return m.reply('lu mau ganti nama note yang mana ngab!')
    if (!ganti) return m.reply('mau di ganti nama apa ngab! masukin dong!')
    let msgs = global.db.data.database[m.chat]
    if (!(nama.toLowerCase() in msgs)) return m.reply('Gaada ngab!')
    msgs[ganti.toLowerCase()] = msgs[nama.toLowerCase()]
    delete msgs[nama.toLowerCase()];
    m.reply('berhasil ngab!')
}
anuplug.help = ['rennote']
anuplug.tags = ['owner']
anuplug.command = /^(rennote|rn)/i
anuplug.isAnubis = true