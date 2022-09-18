module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix, participants }) => {
    anubis.sendMessage(
        m.chat,
        { text: text ? text : "", mentions: participants.map((a) => a.id) },
        { quoted: m }
      );
}
anuplug.help = ['hidetag']
anuplug.tags = ['owner']
anuplug.command = /^(hidetag|ht)/i
anuplug.group = true
anuplug.isAnubis = true
