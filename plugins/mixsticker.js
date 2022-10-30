/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const fs = require('fs')
const { webpTopng } = require('../library/converter');
const { webp2mp4File, tmpfiles } = require('../library/upload');
const { fetchJson } = require('../library/lib');
const util = require('util')

module.exports = anuplug = async (m, anubis, { text, command, args, usedPrefix }) => {
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
  switch (command) {
    case 'smeme':
    case 'stickermeme':
    case 'stikermeme':
      {
        if (!/(webp|image)/.test(mime) || !text) return m.reply(`Kirim/reply image/sticker dengan caption ${usedPrefix + command} text atas|text bawah`)
        atas = text.split("|")[0] ? text.split("|")[0] : "-";
        bawah = text.split("|")[1] ? text.split("|")[1] : "-";
        m.reply(mess.wait);
        let media = await anubis.downloadAndSaveMediaMessage(qmsg);
        let json = await tmpfiles(media);
        let smeme = `https://api.memegen.link/images/custom/${encodeURIComponent(atas)}/${encodeURIComponent(bawah)}.png?background=${json}`;
        let encmedia = await anubis.sendAsSticker(m.chat, smeme, m, {
          packname: global.packname,
          author: global.author,
        });
        if (encmedia) await fs.unlinkSync(encmedia);
        await fs.unlinkSync(media);
      }
      break;
    case 'togif':
      {
        if (!/webp/.test(mime)) return m.reply(`Reply stiker dengan caption *${usedPrefix + command}*`)
        try {
          let media = await anubis.downloadAndSaveMediaMessage(qmsg);
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
          console.err(err)
          m.reply('error ngab! cba wa ownernya!')
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
            fs.unlinkSync(med);
          }
          const ff = await webpTopng(media)
          anubis.sendMessage(m.chat, { image: ff }, { quoted: m })
        } catch (err) {
          console.err(err)
          m.reply('error ngab! cba wa ownernya!')
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
          anubis.sendVideo(m.chat, webpToMp4.result, "Convert Webp To Video", m)
          fs.unlinkSync(media);
        } catch (err) {
          console.err(err)
          m.reply('error ngab! cba wa ownernya!')
        }
      }
      break;
    case 'emix': {
      if (!text) return m.reply(`Example: ${usedPrefix + command} 😍 😪\nExample: ${usedPrefix + command} 😍|😪\nExample: ${usedPrefix + command} 😍`)
      if (/\|/.test(text)) {
        args = []
        args.push(text.split('|')[0], text.split('|')[1])
      }
      if (/\+/.test(text)) {
        args = []
        args.push(text.split('+')[0], text.split('+')[1])
      }
      let [emo1, emo2] = args
      if (!emo1) return m.reply(`Example: ${usedPrefix + command} 😍 😪\nExample: ${usedPrefix + command} 😍|😪\nExample: ${usedPrefix + command} 😍`)
      if (!emo2) emo2 = emo1
      m.reply(mess.wait);
      try {
        const anu = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emo1)}_${encodeURIComponent(emo2)}`)
        if (typeof anu.results[0] !== 'object') return m.reply('emoji tidak valid coba ganti emoji')
        if (typeof anu.results[0].url !== 'string') return m.reply('emoji tidak valid coba ganti emoji')
        const a = await anubis.sendAsSticker(m.chat, anu.results[0].url, m)
        fs.unlinkSync(a)
      } catch (e) {
        console.err(e)
        m.reply('command lagi error ngab!')
      }
    }
      break;
    case 'stext': {
      if (!m.quoted) return m.reply(`reply pesan text dengan caption ${usedPrefix + command}`)
      if (typeof m.quoted.text !== 'string') return m.reply(`reply pesan text dengan caption ${usedPrefix + command}`)
      const pesan = String(util.format(m.quoted.text))
      const name = await anubis.getName(m.quoted.sender) || 'anubiskun'
      m.reply(mess.wait);
      try {
        let encmedia = await anubis.sendAsSticker(m.chat, `https://api-anubiskun.herokuapp.com/api/fakewa?name=${name}&pesan=${pesan}`, m, {
          packname: global.packname,
          author: global.author,
        });
        if (encmedia) fs.unlinkSync(encmedia);
      } catch (e) {
        console.err(e)
        m.reply('command lagi error ngab!')
      }
    }
      break;
    case 'stweet': {
      if (!m.quoted) return m.reply(`- reply pesan text dengan caption ${usedPrefix + command}\n- reply pesan text dengan caption ${usedPrefix + command} username_twitter_anda|username_twitter_reply|caption_reply`)
      const [username, replyusername, replycaption] = text.split('|')
      if (typeof m.quoted.text !== 'string') return m.reply(`reply pesan text dengan caption ${usedPrefix + command}`)
      const caption = String(util.format(m.quoted.text))
      let option = ''
      if (username) {
        option += `username=${username}&caption=${caption}&replyusername=${replyusername}&replycaption=${replycaption}`
      } else {
        const name = await anubis.getName(m.quoted.sender) || 'anubiskun'
        let pUser
        try {
          pUser = await anubis.profilePictureUrl(m.quoted.sender, 'image')
        } catch (e) {
          pUser = 'https://anubis.6te.net/api/thumb.png'
        }
        option += `pp=${encodeURIComponent(pUser)}&name=${name}&username=${name}&caption=${caption}`
      }
      m.reply(mess.wait);
      try {
        let encmedia = await anubis.sendAsSticker(m.chat, `https://api-anubiskun.herokuapp.com/api/faketweet?${option}`, m, {
          packname: global.packname,
          author: global.author,
        });
        if (encmedia) fs.unlinkSync(encmedia);
      } catch (e) {
        console.err(e)
        m.reply('command lagi error ngab!')
      }
    }
      break;
  }
}
anuplug.help = ['stickermeme', 'togif', 'toimg', 'topng', 'tomp4', 'emix', 'stext', 'stweet']
anuplug.tags = ['sticker']
anuplug.command = /^(s(ticker|tiker)?(meme)|to(gif|img|png|mp4)|emix|stext|stweet)$/i
anuplug.isPremium = true