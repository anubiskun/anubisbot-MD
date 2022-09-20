let {pinterest} = require('../library/lib')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) throw `Example : ${usedPrefix + command} gojo satoru`
    m.reply(mess.wait)
    try {
        anu = await pinterest(text);
        result = anu[Math.floor(Math.random() * anu.length)];
        let buttons = [
            {
              buttonId: `${usedPrefix}pinterest ${text}`,
              buttonText: { displayText: "Next Image" },
              type: 1,
            },
          ];
          let buttonMessage = {
            image: { url: result },
            caption: `*-------「 PINTEREST SEARCH 」-------*hero
    🤠 *Query* : ${text}
    🔗 *Media Url* : ${result}`,
            footer: anuFooter,
            buttons: buttons,
            headerType: 4,
          };
          anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
        
    } catch (e) {
        anu = await pinterest(text);
        result = anu[Math.floor(Math.random() * anu.length)];
        let buttons = [
            {
              buttonId: `${usedPrefix}pinterest ${text}`,
              buttonText: { displayText: "Next Image" },
              type: 1,
            },
          ];
          let buttonMessage = {
            image: { url: result },
            caption: `*-------「 PINTEREST SEARCH 」-------*hero
    🤠 *Query* : ${text}
    🔗 *Media Url* : ${result}`,
            footer: anuFooter,
            buttons: buttons,
            headerType: 4,
          };
          anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
        
    }
}
anuplug.help = ['pinterest']
anuplug.tags = ['tools']
anuplug.command = /^(pinterest)$/i
