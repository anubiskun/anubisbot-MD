const google = require('googlethis')
const fs = require('fs')
const {UploadFileUgu} = require('../library/upload');
const isUrl = require('is-url')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    const mquo = m.quoted || m;
    const quoted = mquo.mtype == "buttonsMessage"
        ? mquo[Object.keys(mquo)[1]]
        : mquo.mtype == "templateMessage"
        ? mquo.hydratedTemplate[Object.keys(mquo.hydratedTemplate)[1]]
        : mquo.mtype == "product"
        ? mquo[Object.keys(mquo)[0]]
        : m.quoted
        ? m.quoted
        : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const qmsg = quoted.msg || quoted;
    switch(command){
        case 'google':
            {
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
        break;
        case 'gimage':
            {
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
        break;
        case 'gimgrev':
            {
                let qstring
                if (!/image/.test(mime) && !isUrl(text)) return m.reply(`Reply gambar yang mau di cari di google ngab!`)
                if (isUrl(text)) qstring = text
                if (/image/.test(mime)) {
                    let media = await anubis.downloadAndSaveMediaMessage(qmsg, 'anu');
                    let {url} = await UploadFileUgu(media)
                    await fs.unlinkSync(media);
                    qstring = url
                }
                // let qstring
                m.reply(mess.wait)
                const {results} = await google.search(qstring, { ris: true });
                let teks = `Result from Google search by Image :\n\n`
                if (!results) return m.reply('Gambar Tidak di temukan kecocokan ngab!') 
                for (let g of results) {
                    teks += `⭔ *Title* : ${g.title}\n`
                    teks += `⭔ *Description* : ${g.description}\n`
                    teks += `⭔ *Link* : ${g.url}\n\n────────────────────────\n\n`
                }
                anubis.sendMessage(m.chat, {text: teks}, { quoted: m });
            }
        break;
    }
}
anuplug.help = ['google','gimage','gimgrev']
anuplug.tags = ['tools']
anuplug.command = /^(google|gimage|gimgrev)$/i
