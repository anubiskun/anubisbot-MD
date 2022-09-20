module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix, participants }) => {
    let teks = `        [ TAGALL ] 
Pesan : ${text ? text : 'kosong'}\n\n`
             for (let mem of participants) {
               teks += `> @${mem.id.split("@")[0]}\n`;
             }
    anubis.sendMessage(
        m.chat,
        { text: teks, mentions: participants.map((a) => a.id) },
        { quoted: m }
    );
}
anuplug.help = ['tagall']
anuplug.tags = ['group']
anuplug.command = /^(tagall)$/i
anuplug.group = true
