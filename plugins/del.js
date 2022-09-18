module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!m.quoted) return m.reply('reply pesan yang mau di delete')
    anubis.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.quoted.id,
          participant: m.quoted.sender,
        },
    })
    m.reply('udah ngab!')
}
anuplug.help = ['delete']
anuplug.tags = ['tools']
anuplug.command = /^(del|delete)$/i
anuplug.group = true
anuplug.isAnubis = true
anuplug.botAdmin = true