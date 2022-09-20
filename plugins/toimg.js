const {webpTopng} = require('../library/converter')
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
  let media
  if (!/webp/.test(mime)) return m.reply(`Reply stiker dengan caption *${usedPrefix + command}*`)
  try {
    try {
      media = await anubis.downloadMediaMessage(qmsg);
    } catch (e) {
      media = await anubis.downloadAndSaveMediaMessage(qmsg);
    }
    const ff = await webpTopng(media)
    anubis.sendMessage(m.chat, { image: ff }, { quoted: m })
  } catch (err) {
      m.reply('error ngab! cba wa ownernya!')
      console.log(err)
  }
}
anuplug.help = ['toimg']
anuplug.tags = ['sticker']
anuplug.command = /^to(img|png)$/i