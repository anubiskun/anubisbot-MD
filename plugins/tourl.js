const { tmpfiles, telegraphUp } = require('../library/upload')
const fs = require('fs')
const util = require('util')
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
    const isMedia = /image|video|sticker|audio/.test(mime);
    // console.log(isMedia)
    if (!isMedia) return m.reply(`Reply media dengan caption *${usedPrefix + command}*`)
    try {
        let media = await anubis.downloadAndSaveMediaMessage(qmsg, 'anubiskun');
        if (/image/.test(mime)) {
            let anu = await telegraphUp(media);
            m.reply(util.format(anu));
        } else if (!/image/.test(mime)) {
            let anu = await tmpfiles(media);
            m.reply(util.format(anu));
        }
        await fs.unlinkSync(media);
    } catch (err) {
        m.reply('error ngab! cba wa ownernya!')
        console.log(err)
    }
}
anuplug.help = ['tourl']
anuplug.tags = ['tools']
anuplug.command = /^to(url)$/i