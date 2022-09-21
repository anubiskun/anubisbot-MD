const { webp2mp4File, tmpfiles, telegraphUp } = require('../library/upload')
const {webpTopng, toAudio, toPTT} = require('../library/converter')
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
  switch(command){
    case 'togif':
      {
        if (!/webp/.test(mime)) return m.reply(`Reply stiker dengan caption *${usedPrefix + command}*`)
        try {
            let media = await anubis.downloadAndSaveMediaMessage(qmsg, 'anubisgif');
              let webpToMp4 = await webp2mp4File(media);
              await anubis.sendMessage(
                m.chat,
                {
                  video: {
                    url: webpToMp4.result,
                    caption: "Convert Webp To Video",
                  },
                  gifPlayback: true,
                },
                { quoted: m }
              );
              await fs.unlinkSync(media);
        } catch (err) {
            m.reply('error ngab! cba wa ownernya!')
            console.log(err)
        }
      }
    break;
    case 'toimg':
    case 'topng':
      {
        let media
        if (!/webp/.test(mime)) return m.reply(`Reply stiker dengan caption *${usedPrefix + command}*`)
        try {
          try {
            media = await anubis.downloadMediaMessage(qmsg);
          } catch (e) {
            let med = await anubis.downloadAndSaveMediaMessage(qmsg);
            media = await fs.readFileSync(med)
            await fs.unlinkSync(med);
          }
          const ff = await webpTopng(media)
          anubis.sendMessage(m.chat, { image: ff }, { quoted: m })
        } catch (err) {
            m.reply('error ngab! cba wa ownernya!')
            console.log(err)
        }
      }
    break;
    case 'tomp3':
      {
        if (!/video/.test(mime) && !/audio/.test(mime)) return m.reply(`Kirim/Reply Video/Audio Yang Ingin Dijadikan MP3 Dengan Caption ${usedPrefix + command}`)
        try {
          m.reply(mess.wait);
          let media = await anubis.downloadMediaMessage(qmsg);
          let audio = await toAudio(media, "mp4");
          anubis.sendMessage(
            m.chat,
            { audio: audio, mimetype: "audio/mpeg" },
            { quoted: m }
          );
        } catch (err) {
            m.reply('error ngab! cba wa ownernya!')
            console.log(err)
        }
      }
    break;
    case 'tomp4':
      {
        if (!/webp/.test(mime)) return m.reply(`Reply stiker dengan caption ${usedPrefix + command}`)
        try {
          m.reply(mess.wait);
          let media = await anubis.downloadAndSaveMediaMessage(qmsg);
          let webpToMp4 = await webp2mp4File(media);
          await anubis.sendMessage(
            m.chat,
            {
              video: {
                url: webpToMp4.result,
                caption: "Convert Webp To Video",
              },
            },
            { quoted: m }
          );
          await fs.unlinkSync(media);
        } catch (err) {
            m.reply('error ngab! cba wa ownernya!')
            console.log(err)
        }
      }
    break;
    case 'tourl':
      {
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
    break;
    case 'tovn':
      {
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
    break;
  }
}
anuplug.help = ['gif','png','img','mp3','mp4','url','vn'].map(v => 'to' + v)
anuplug.tags = ['tools']
anuplug.command = /^to(gif|png|img|mp3|mp4|url|vn)$/i