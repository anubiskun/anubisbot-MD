const google = require('googlethis')
const fs = require('fs')
const {UploadFileUgu} = require('../library/upload');
const isUrl = require('is-url');
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
anuplug.help = ['gimgrev']
anuplug.tags = ['tools']
anuplug.command = /^(gimgrev)$/i
