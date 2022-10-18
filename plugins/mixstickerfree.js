/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const fs = require('fs')
const Crypto = require("crypto")
const webp = require("node-webpmux")
const path = require("path");
const { WebpToWebp } = require('../library/converter');
const { webp2mp4File } = require('../library/upload');

module.exports = anuplug = async(m, anubis, { command, usedPrefix }) => {
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
    case 's':
    case 'sticker':
    case 'stiker':
      {
        try {
          if (!/(video|image|webp)/.test(mime)) return  m.reply(`Kirim/reply gambar/video/gif dengan caption ${usedPrefix + command}\nDurasi Video/Gif 1-9 Detik`);
          m.reply(mess.wait);
          const tmpFileOut = path.join(__root, `/temp/${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
          let media
          try {
            let med = await anubis.downloadAndSaveMediaMessage(qmsg);
            media = fs.readFileSync(med)
            fs.unlinkSync(med);
          } catch (e) {
            media = await anubis.downloadMediaMessage(qmsg);
          }
          if (/(video|image)/.test(mime)) media = await WebpToWebp(media)
          const img = new webp.Image()
          const json = { "sticker-pack-id": Crypto.randomBytes(32).toString('hex'), "sticker-pack-name": global.packname, "sticker-pack-publisher": global.author, "emojis": ["😂"] }
          const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
          const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
          const exif = Buffer.concat([exifAttr, jsonBuff])
          exif.writeUIntLE(jsonBuff.length, 14, 4)
          try {
            await img.load(media)
          } catch (err) {
            let mee = await anubis.downloadAndSaveMediaMessage(qmsg);
            let {result} = await webp2mp4File(mee)
            let buff = await WebpToWebp(result)
            fs.unlinkSync(mee);
            await img.load(buff)
          }
          img.exif = exif
          await img.save(tmpFileOut)
          await anubis.sendMessage(m.chat, { sticker: { url: tmpFileOut }}, { quoted: m })
          fs.unlinkSync(tmpFileOut);
        } catch (err) {
          m.reply('error ngab! cba wa ownernya!')
          console.err(err)
        }
      }
    break;
  }
}
anuplug.help = ['sticker']
anuplug.tags = ['sticker']
anuplug.command = /^(s(ticker|tiker)?)$/i