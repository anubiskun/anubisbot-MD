const fs = require('fs')
module.exports = anuplug = async(m, {anubis, text, command, args, usedPrefix }) => {
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
    if (/image/.test(mime)) {
        m.reply(mess.wait);
        let media = await anubis.downloadMediaMessage(qmsg);
        let encmedia = await anubis.sendImageAsSticker(m.chat, media, m, {
            packname: global.packname,
            author: global.author,
          });
        await fs.unlinkSync(encmedia);
      } else if (/video/.test(mime)) {
        m.reply(mess.wait);
        if (qmsg.seconds > 11) return m.reply("Maksimal 10 detik!");
        let media = await anubis.downloadMediaMessage(qmsg);
        let encmedia = await anubis.sendVideoAsSticker(m.chat, media, m, {
          packname: global.packname,
          author: global.author,
        });
        await fs.unlinkSync(encmedia);
      } else {
        m.reply(
          `Kirim/reply gambar/video/gif dengan caption ${
            usedPrefix + command
          }\nDurasi Video/Gif 1-9 Detik`
        );
      }
}
anuplug.help = ['sticker']
anuplug.tags = ['sticker']
anuplug.command = /^s(ticker)?$/i
