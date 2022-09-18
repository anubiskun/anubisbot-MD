module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!m.quoted) return m.reply('Reply pesan/media yang mau di save ke notes!')
    if (!text) return m.reply(`Example: ${usedPrefix + command} note name`)
    const [nama, priv] = text.split('|')
    let lock
    if (!priv) {
        lock = false
    } else {
        lock = true
    }
    let msgs = global.db.data.database[m.chat]
    let pesan = JSON.stringify(m.quoted.fakeObj)
    pesan = JSON.parse(pesan)
    if (nama.toLowerCase() in msgs) return m.reply(`nama '${nama}' sudah ada ngab!`)
    msgs[nama.toLowerCase()] = {
        lock,
        pesan
    }
    console.log(msgs)
    return m.reply('note berhasil di simpan ngab!')
}
anuplug.help = ['addnote']
anuplug.tags = ['owner']
anuplug.command = /^(addnote|an)/i
anuplug.isAnubis = true