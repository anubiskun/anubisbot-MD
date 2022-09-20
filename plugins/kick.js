module.exports = anuplug = async(m, { anubis, participants, text, command, args, usedPrefix }) => {
    let user = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "");
    let users = user.split("@")[0]
    let response = await anubis.groupParticipantsUpdate(m.chat, [users + '@s.whatsapp.net'], "remove")
    if (response[0].status == 200) return m.reply('Berhasil mengeluarkan')
    else return m.reply('Gagal mengeluarkan ngab!\nNomer tidak ada di group!')
}
anuplug.help = ['kick']
anuplug.tags = ['group']
anuplug.command = /^(kick)$/i
anuplug.group = true
anuplug.botAdmin = true
