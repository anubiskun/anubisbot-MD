module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix, botNumber }) => {
    let public = botpublic
    let pubMes
    if (public) pubMes = 'public nyala ngab!'
    if (!public) pubMes = 'public mati ngab!'
    let buttons = [
        { buttonId: `${usedPrefix}public on`, buttonText: { displayText: "ON" }, type: 1 },
        { buttonId: `${usedPrefix}public off`, buttonText: { displayText: "OFF" }, type: 1 },
      ];
    let buttonMessage = { text: 'Pilih untuk switch mode bot\n\n' + pubMes, footer: global.anuFooter, buttons };
    if (!text) return anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
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
