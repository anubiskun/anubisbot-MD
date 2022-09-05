let remobg = require("remove.bg");
let fs = require('fs')
let {getRandom} = require('../library/lib')
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
    if (!/image/.test(mime))return m.reply(`Kirim/Reply Image Dengan Caption ${prefix + command}`)
    if (/webp/.test(mime)) m.reply(`Kirim/Reply Image Dengan Caption ${prefix + command}`)
    let apinobg = apirnobg[Math.floor(Math.random() * apirnobg.length)]
    let hmm = (await "./temp/remobg-") + getRandom("")
    let localFile = await anubis.downloadAndSaveMediaMessage(qmsg, hmm);
    let outputFile = (await "./temp/hremo-") + getRandom(".png");
    m.reply(mess.wait)
    remobg
        .removeBackgroundFromImageFile({
            path: localFile,
            apiKey: apinobg,
            size: "regular",
            type: "auto",
            scale: "100%",
            outputFile,
        })
        .then(async (result) => {
            anubis.sendMessage(
                m.chat,
                { image: fs.readFileSync(outputFile), caption: mess.success },
                { quoted: m }
            );
            await fs.unlinkSync(localFile);
            await fs.unlinkSync(outputFile);
        });
}
anuplug.help = ['removebackground']
anuplug.tags = ['tools']
anuplug.command = /^(rmbg|removebg|removebackground)$/i
