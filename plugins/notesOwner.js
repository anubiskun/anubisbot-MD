module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    switch(command){
        case 'addnote':
        case 'an':
            {
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
                m.reply('note berhasil di simpan ngab!')
            }
        break;
        case 'delnote':
        case 'dn':
            {
                if (!text) return m.reply(`Example: ${usedPrefix + command} note name`)
                let msgs = global.db.data.database[m.chat]
                if (!(text.toLowerCase() in msgs)) return m.reply('Gaada ngab!')
                delete msgs[text.toLowerCase()];
                m.reply('berhasil ngab!')
            }
        break;
        case 'rennote':
        case 'rn':
            {
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
        break;
    }
}
anuplug.help = ['add','del','ren'].map(v => v + 'note')
anuplug.tags = ['owner']
anuplug.command = /^(addnote|an|delnote|dn|rennote|rn)/i
anuplug.isAnubis = true