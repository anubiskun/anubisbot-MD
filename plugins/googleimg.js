const google = require('googlethis')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) throw `Example : ${usedPrefix + command} gojo satoru`
    m.reply(mess.wait)
    const n = await google.image(text, { safe: false });
    images = n[Math.floor(Math.random() * n.length)]
    let buttons = [
    {
        buttonId: `${usedPrefix + command} ${text}`,
        buttonText: { displayText: "Next Image" },
        type: 1,
    },
    ];
    let buttonMessage = {
    image: { url: images.url },
    caption: `*-------「 GIMAGE SEARCH 」-------*
🤠 *Query* : ${text}
🔗 *Media Url* : ${images.url}
⬛ *Size* : ${images.width}x${images.height}`,
    footer: anuFooter,
    buttons: buttons,
    headerType: 4,
    };
    anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
     
}
anuplug.help = ['gimage']
anuplug.tags = ['tools']
anuplug.command = /^(gimage)$/i