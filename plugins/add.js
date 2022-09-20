module.exports = anuplug = async(m, { anubis, participants, text, command, args, usedPrefix }) => {
    let user = m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "");
    let users = user.split("@")[0]
    let response = await anubis.groupParticipantsUpdate(m.chat, [users + '@s.whatsapp.net'], "add")
    if (response[0].status == 200) {
        return m.reply('Berhasil menambahkan')
    } else if (response[0].status == 409) {
        return m.reply('Gagal menambahkan ngab!\nNomer sudah ada di group!')
    } else if (response[0].status == 403) {
        return m.reply('Gagal menambahkan ngab!\nSilahkan kirim link ke nomer tsb!')
    }
}
anuplug.help = ['add']
anuplug.tags = ['group']
anuplug.command = /^(add)$/i
anuplug.group = true
anuplug.botAdmin = true
