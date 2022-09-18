const { getContentType } = require("@adiwajshing/baileys");

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    let seplit = Object.entries(global.db.data.database[m.chat]).map(([nama, isi]) => {
        return { nama, ...isi };
    })
    let teks = "───〔 NOTE LIST 〕───\n";
    for (let i of seplit) {
        let kunci
        if (i.lock) {
            kunci = '🔒'
        } else {
            kunci = ''
        }
        teks += `> ${i.nama} (${getContentType(i.pesan.message).replace(/Message/i, "")}) ${kunci}\n`;
    }
    teks += `───〔 NOTE LIST 〕───\n\nGunakan command ${usedPrefix}get namanotenya\nEx: ${usedPrefix}get test`
    m.reply(teks);
}
anuplug.help = ['notes']
anuplug.tags = ['group']
anuplug.command = /^(notes|note)/i
anuplug.group = true