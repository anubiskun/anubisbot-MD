let { toPTT } = require("../library/converter");
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
    if (!/video/.test(mime) && !/audio/.test(mime)) return m.reply(`Reply Video/Audio Yang Ingin Dijadikan VN Dengan Caption ${usedPrefix + command}`)
    try {
    m.reply(mess.wait);
    let media = await anubis.downloadMediaMessage(qmsg);
    let audio = await toPTT(media, "mp4");
    anubis.sendMessage(
      m.chat,
      { audio: audio, mimetype: "audio/mpeg", ptt: true },
      { quoted: m }
    );
    } catch (err) {
        m.reply('error ngab! cba wa ownernya!')
        console.log(err)
    }
}
anuplug.help = ['tovn']
anuplug.tags = ['tools']
anuplug.command = /^to(vn)$/i