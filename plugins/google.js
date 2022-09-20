const google = require('googlethis')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) throw `Example : ${usedPrefix + command} apakah bumi itu bulat?`
    m.reply(mess.wait)
    const options = {
        page: 0, 
        safe: false,
        additional_params: { 
          hl: 'en' 
        }
    }
    const {results} = await google.search(text, options)
    let teks = `Google Search From : ${text}\n\n`
    for (let g of results) {
        teks += `⭔ *Title* : ${g.title}\n`
        teks += `⭔ *Description* : ${g.description}\n`
        teks += `⭔ *Link* : ${g.url}\n\n────────────────────────\n\n`
    }
    anubis.sendMessage(m.chat, {text: teks}, { quoted: m });
}
anuplug.help = ['google']
anuplug.tags = ['tools']
anuplug.command = /^(google)$/i
