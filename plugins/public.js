module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix, botNumber }) => {
    let public = botpublic
    console.log(public)
    let pubMes
    if (public) pubMes = 'public nyala ngab!'
    if (!public) pubMes = 'public mati ngab!'
    if (!text) return anubis.send5ButMsg(m.chat, 'Pilih untuk switch mode bot!\n\n'+ pubMes, '', [
        {
            quickReplyButton: {
                displayText: "ON",
                id: `${usedPrefix}public on`,
            }
        },
        {
            quickReplyButton: {
                displayText: "OFF",
                id: `${usedPrefix}public off`,
            },
        }
    ])
    if (text == 'on') {
        botpublic = true
        anubis.sendMessage(m.chat, {text: 'Bot sekarang bisa merespons semua orang!'}, {quoted: m})
    } else if (text == 'off') {
        botpublic = false
        anubis.sendMessage(m.chat, {text: 'Bot sekarang hanya merespons owner/admin!'}, {quoted: m})
    } else {
        anubis.sendMessage(m.chat, {text: 'Mau lu apa bangsad??!!'}, {quoted: m})
    }
}
anuplug.help = ['public']
anuplug.tags = ['owner']
anuplug.command = /^(public)$/i
anuplug.isAnubis = true
