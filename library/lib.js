/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

let fs = require('fs')
const { default: WAConnection, proto, jidDecode, downloadContentFromMessage, generateWAMessageFromContent, generateForwardMessageContent, getContentType, extractImageThumb } = require('@adiwajshing/baileys')
const Path = require('path')
const axios = require('axios').default
const { parsePhoneNumber } = require('awesome-phonenumber')
const moment = require('moment-timezone')
const { sizeFormatter } = require('human-readable')
const cheerio = require('cheerio')
const isUrl = require('is-url')
const { startFollowing } = require('follow-redirect-url')
const BodyForm = require('form-data')
const util = require('util')
const FileType = require('file-type')
const { writeExifVid, writeExif } = require('./exif')
const { videoToWebp, videoToThumb, imageToThumb } = require('./converter')

/**
* 
* @param {WAConnection} conn 
* @returns 
*/
const anubisFunc = (conn, store) => {
  return {
    ...conn,

    /**
    * 
    * @param {*} jid 
    * @returns 
    */
    decodeJid(jid) {

      if (!jid) return jid
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {}
        return decode.user && decode.server && decode.user + '@' + decode.server || jid
      } else return jid
    },

    getName(jid, withoutContact = false) {
      let id = this.decodeJid(jid)
      withoutContact = this.withoutContact || withoutContact
      let v
      if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
        v = store.contacts[id] || {}
        if (!(v.name || v.subject)) v = await this.groupMetadata(id) || {}
        resolve(v.name || v.subject || parsePhoneNumber('+' + id.replace(this.anubiskun, '')).getNumber('international'))
      })
      else v = id === '0' + this.anubiskun ? {
        id,
        name: 'WhatsApp'
      } : id === this.decodeJid(this.user.id) ? this.user : (store.contacts[id] || {})
      return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || parsePhoneNumber('+' + jid.replace(this.anubiskun, '')).getNumber('international')
    },
    /**
   * 
   * @param {string} jid 
   * @param {array} contact ex: '62,62,...' or ['62','62',...]
   * @param {m} quoted 
   * @param {{}} opts 
   */
    async sendContact(jid, contact, quoted = '', opts = {}) {
      let list = []
      contact = (typeof contact == 'string') ? contact.split(',') : contact
      for (let i of contact) {
        i = /@/.test(i) ? i.split('@')[0] : i
        list.push({
          displayName: await this.getName(i + this.anubiskun),
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await this.getName(i + this.anubiskun)}\nFN:${await this.getName(i + this.anubiskun)}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:anubiskun.xyz@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/anubiskun.xyz\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
        })
      }
      return await this.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
    },

    /**
 *
 * @param {*} jid
 * @param {*} url
 * @param {*} caption
 * @param {*} quoted
 * @param {*} options
 */
    async sendFileUrl(jid, url, caption, quoted, options = {}) {
      let mime = '';
      let res = await axios.get(url)
      mime = res.headers['content-type']
      if (mime.split("/")[1] === "gif") {
        return await this.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
      }
      let type = mime.split("/")[0] + "Message"
      if (mime === "application") {
        return await this.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
      }
      if (mime.split("/")[0] === "image") {
        return await this.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
      }
      if (mime.split("/")[0] === "video") {
        return await this.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
      }
      if (mime.split("/")[0] === "audio") {
        return await this.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
      }
    },

    /** Send Payment Message 
   *
   * @param {*} jid
   * @param {*} sender
   * @param {*} text
   * @param {Numeric} value
   */
    sendPaymentMsg(jid, sender, text = '', value) {
      const payment = generateWAMessageFromContent(jid, {
        "requestPaymentMessage": {
          "currencyCodeIso4217": "IDR",
          "amount1000": value,
          "requestFrom": sender,
          "noteMessage": {
            "extendedTextMessage": {
              "text": text
            }
          },
          "expiryTimestamp": "1660787819",
          "amount": {
            "value": value,
            "currencyCode": "IDR"
          }
        }
      }, { userJid: jid })

      return this.relayMessage(jid, payment.message, { messageId: payment.key.id })
    },

    /** Send Poll Message 
    *
    * @param {*} jid
    * @param {*} name
    * @param [*] options
    */
    sendPoll(jid, name = '', options = []) {
      const poll = generateWAMessageFromContent(jid, proto.Message.fromObject({
        "pollCreationMessage": {
          "name": name,
          "options": options,
          "selectableOptionsCount": options.length
        }
      }), { userJid: jid })
      return this.relayMessage(jid, poll.message, { messageId: poll.key.id })
    },

    /** Send Simple Poll Message 
    *
    * @param {*} jid
    * @param {*} name
    */
    sendSimplePoll(jid, name = '') {
      const simplePoll = generateWAMessageFromContent(jid, proto.Message.fromObject({
        "pollCreationMessage": {
          "name": name,
          "options": [
            { "optionName": "Yes" },
            { "optionName": "No" }
          ],
          "selectableOptionsCount": 2
        }
      }), { userJid: jid })
      return this.relayMessage(jid, simplePoll.message, { messageId: simplePoll.key.id })
    },

    /** Send Order Message 
     *
     * @param {*} jid
     * @param {*} text
     * @param {Numeric} orid
     * @param {Buffer} img
     * @param {Numeric} itcount
     * @param {*} title
     * @param {*} sellers
     * @param {*} tokens
     * @param {Numeric} amount
     */
    sendOrder(jid, text = '', orid = '', img, itcount = '', title = '', sellers, tokens = '', ammount) {
      const order = generateWAMessageFromContent(jid, proto.Message.fromObject({
        "orderMessage": {
          "orderId": orid,
          "thumbnail": img,
          "itemCount": itcount,
          "status": "INQUIRY",
          "surface": "CATALOG",
          "orderTitle": title,
          "message": text,
          "sellerJid": sellers,
          "token": tokens,
          "totalAmount1000": ammount,
          "totalCurrencyCode": "IDR",
        }
      }), { userJid: jid })
      return this.relayMessage(jid, order.message, { messageId: order.key.id })
    },

    /**
    * 
    * @param {Buffer} file Buffer or Path or URL
    * @returns 
    */
    async genThumb(file) {
      let buffer = Buffer.isBuffer(file) ? file : /^data:.*?\/.*?;base64,/i.test(file) ? Buffer.from(file.split`,`[1], 'base64') : /^https?:\/\//.test(file) ? await (await getBuffer(file)) : fs.existsSync(file) ? fs.readFileSync(file) : Buffer.alloc(0)
      if (!Buffer.isBuffer(buffer)) throw new TypeError('Result is not a buffer')
      let type = await FileType.fromBuffer(buffer)
      if (/(image|video)/.test(type.mime)) {
        let mim = type.mime.split('/')[0]
        buffer = (mim == 'video') ? await videoToThumb(buffer) : await imageToThumb(buffer)
      } else {
        return { status: false }
      }
      return {
        status: true,
        thumbnail: buffer,
        type: (/image/.test(type.mime)) ? 'image' : 'video',
      }
    },

    /**
    *
    * @param {*} jid
    * @param {*} title
    * @param {*} text
    * @param {*} sections
    * @param {*} quoted
    * @param {*} options
    * @returns
    */
    async sendList(jid, title, text, buttonText, sections, quoted = '', options = {}) {
      let listMessage = {
        text,
        footer: anuFooter,
        title,
        buttonText,
        sections,
      };

      return await this.sendMessage(jid, listMessage, { quoted, ...options });
    },

    /** Send Button 3 Message
    * 
    * @param {*} jid
    * @param {*} text
    * @param {*} button
    * @returns 
    */
    async sendButtonMsg(jid, text = '', buttons = [], quoted = '', options = {}) {
      let buttonMessage = {
        text: text,
        footer: anuFooter,
        buttons
      }
      return await this.sendMessage(jid, buttonMessage, { quoted, ...options })
    },

    /** Send Button 3 Image
    *
    * @param {*} jid
    * @param {*} text
    * @param {*} image
    * @param [*] button
    * @param {*} options
    * @returns
    */
    async sendButtonImg(jid, text = '', path, buttons = [], quoted = '', options = {}) {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      return await this.sendMessage(jid, { image: buffer, caption: text, footer: anuFooter, buttons }, { quoted, ...options })
    },

    /** Send Button 3 Video
    *
    * @param {*} jid
    * @param {*} text
    * @param {*} Video
    * @param [*] button
    * @param {*} options
    * @returns
    */
    async sendButtonVid(jid, text = '', path, buttons = [], quoted = '', thumb, options = {}) {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      let jpegThumbnail
      if (isUrl(thumb)) {
        jpegThumbnail = (await extractImageThumb(thumb)).buffer
      } else {
        let bb = await this.genThumb(buffer)
        jpegThumbnail = (bb.status) ? bb.thumbnail : ''
      }
      return await this.sendMessage(jid, { video: buffer, caption: text, jpegThumbnail, footer: anuFooter, buttons }, { quoted, ...options })
    },

    /** Send Button 3 Location
   *
   * @param {*} jid
   * @param {*} text
   * @param {*} location
   * @param [*] button
   * @param {*} options
   */
    async sendButtonLoc(jid, text = '', lok, buttons = [], quoted = '', options = {}) {
      let bb = await this.genThumb(lok)
      let jpegThumbnail = (bb.status) ? bb.thumbnail : ''
      return await this.sendMessage(jid, { location: { jpegThumbnail }, caption: text, footer: anuFooter, buttons }, { quoted, ...options })
    },

    /** Send Button 3 Gif
    *
    * @param {*} jid
    * @param {*} text
    * @param {*} Gif
    * @param [*] button
    * @param {*} options
    * @returns
    */
    async sendButtonGif(jid, text = '', gif, but = [], quoted = '', options = {}) {
      let bb = await this.genThumb(gif)
      let jpegThumbnail = (bb.status) ? bb.thumbnail : ''
      let a = [1, 2]
      let b = a[Math.floor(Math.random() * a.length)]
      return await this.sendMessage(jid, { video: gif, gifPlayback: true, gifAttribution: b, caption: text, footer: anuFooter, jpegThumbnail, templateButtons: but }, { quoted, ...options })
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} buttons 
    * @param {*} caption 
    * @param {*} quoted 
    * @param {*} options 
    */
    async sendButtonText(jid, buttons = [], text, quoted = '', options = {}) {
      let buttonMessage = {
        text,
        footer: anuFooter,
        buttons,
        headerType: 2,
        ...options
      }
      return await this.sendMessage(jid, buttonMessage, { quoted, ...options })
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} text 
    * @param {*} quoted 
    * @param {*} options 
    * @returns 
    */
    async sendText(jid, text = '', quoted = '', options) {
      return await this.sendMessage(jid, { text, ...options }, { quoted, ...options })
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} path 
    * @param {*} caption 
    * @param {*} quoted 
    * @param {*} options 
    * @returns 
    */
    async sendImage(jid, path, caption = '', quoted = '', options) {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      return await this.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} path 
    * @param {*} caption 
    * @param {*} quoted 
    * @param {*} options 
    * @returns 
    */
    async sendVideo(jid, path, caption = '', quoted = '', thumb, gif = false, options) {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      let jpegThumbnail
      if (isUrl(thumb)) {
        jpegThumbnail = (await extractImageThumb(thumb)).buffer
      } else {
        let bb = await this.genThumb(buffer)
        jpegThumbnail = (bb.status) ? bb.thumbnail : ''
      }
      return await this.sendMessage(jid, { video: buffer, caption: caption, jpegThumbnail, gifPlayback: gif, ...options }, { quoted })
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} path 
    * @param {*} quoted 
    * @param {*} mime 
    * @param {*} options 
    * @returns 
    */
    async sendAudio(jid, path, quoted = '', ptt = false, options) {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      return await this.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} text 
    * @param {*} quoted 
    * @param {*} options 
    * @returns 
    */
    async sendTextWithMentions(jid, text, quoted = '', options = {}) {
      return await this.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + this.anubiskun), ...options }, { quoted })
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} path 
    * @param {*} quoted 
    * @param {*} options 
    * @returns 
    */
    async sendAsSticker(jid, path, quoted = '', options = {}) {
      try {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
          buffer = await writeExif(buff, options)
        } else {
          buffer = await writeExif(buff, { packname: global.packname, author: global.author })
        }
        await this.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
      } catch (err) {
        console.log('error ngab!')
        console.err(err)
      }
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} path 
    * @param {*} quoted 
    * @param {*} options 
    * @returns 
    */
    async sendVideoAsSticker(jid, path, quoted = '', options = {}) {
      let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      let buffer
      if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options)
      } else {
        buffer = await videoToWebp(buff)
      }

      await this.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
      return buffer
    },

    /**
    * 
    * @param {*} message 
    * @param {*} filename 
    * @param {*} attachExtension 
    * @returns 
    */
    async downloadAndSaveMediaMessage(message, filename = getRandom(), attachExtension = true) {
      let quoted = message.msg ? message.msg : message
      let mime = (message.msg || message).mimetype || ''
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
      const stream = await downloadContentFromMessage({ mediaKey: quoted.mediaKey, directPath: quoted.directPath }, messageType)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }
      let type = await FileType.fromBuffer(buffer)
      trueFileName = attachExtension ? (Path.join(__temp, filename + '.' + type.ext)) : filename
      // save to file
      await fs.writeFileSync(trueFileName, buffer)
      return trueFileName
    },

    async downloadMediaMessage(message) {
      let mime = (message.msg || message).mimetype || ''
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
      const stream = await downloadContentFromMessage(message, messageType)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }
      return buffer
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} path 
    * @param {*} filename
    * @param {*} caption
    * @param {*} quoted 
    * @param {*} options 
    * @returns 
    */
    async sendMedia(jid, path, fileName, caption = '', quoted = '', options = {}) {
      let a = {}, types = {}, txt
      if (isUrl(path)) {
        const url = new URL(path)
        const res = await axios({ url: url.href, method: "GET", responseType: "arraybuffer" })
        path = res.data
        types = (/text|json/.test(res.headers['content-type'])) ? { ext: 'txt' } : (/application/.test(res.headers['content-type'])) ? { mime: 'application' } : await FileType.fromBuffer(path)
      } else {
        path = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : isUrl(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        types = await FileType.fromBuffer(path)
      }
      if (/txt/.test(types.ext)) {
        try {
          path = util.format(JSON.parse(path + ''))
        } catch (e) {
          path = path + ''
        } finally {
          a = await this.sendText(jid, path.slice(0, 65536) + '', quoted, options)
        }
      } else {
        if (!fileName) fileName = getRandom('.' + types.ext)
        console.log(types)
        if (/(png|jpg|webp)/.test(types.ext)) {
          a = await this.sendImage(jid, path, caption, quoted)
        } else if (/mp4/.test(types.ext)) {
          a = await this.sendMessage(jid, { video: path, fileName, caption }, { quoted })
        } else if (/mp3/.test(types.ext)) {
          a = await this.sendText(jid, caption, quoted, options)
          if (a.status) a = await this.sendAudio(jid, path, quoted)
        } else if (/gif/.test(types.ext)) {
          a = await this.sendMessage(jid, { video: path, fileName, caption, gifPlayback: true }, { quoted })
        } else if (/application/.test(types.mime)) {
          a = await this.sendMessage(jid, { document: path, mimetype: types.mime, fileName, caption }, { quoted })
        }
      }
      return {
        ...a
      }
    },

    /**
    * 
    * @param {*} jid 
    * @param {*} message 
    * @param {*} forceForward 
    * @param {*} options 
    * @returns 
    */
    async copyNForward(jid, message, forceForward = false, options = {}) {
      let vtype
      if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
        vtype = Object.keys(message.message.viewOnceMessage.message)[0]
        delete (message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
        delete message.message.viewOnceMessage.message[vtype].viewOnce
        message.message = {
          ...message.message.viewOnceMessage.message
        }
      }

      let mtype = Object.keys(message.message)[0]
      let content = await generateForwardMessageContent(message, forceForward)
      let ctype = Object.keys(content)[0]
      let context = {}
      if (mtype != "conversation") context = message.message[mtype].contextInfo
      content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo
      }
      const waMessage = await generateWAMessageFromContent(jid, content, options ? {
        ...content[ctype],
        ...options,
        ...(options.contextInfo ? {
          contextInfo: {
            ...content[ctype].contextInfo,
            ...options.contextInfo
          }
        } : {})
      } : {})
      await this.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
      return waMessage
    },

    cMod(jid, copy, text = '', sender = this.user.id, options = {}) {
      //let copy = message.toJSON()
      let mtype = Object.keys(copy.message)[0]
      let isEphemeral = mtype === 'ephemeralMessage'
      if (isEphemeral) {
        mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
      }
      let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
      let content = msg[mtype]
      if (typeof content === 'string') msg[mtype] = text || content
      else if (content.caption) content.caption = text || content.caption
      else if (content.text) content.text = text || content.text
      if (typeof content !== 'string') msg[mtype] = {
        ...content,
        ...options
      }
      if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
      else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
      if (copy.key.remoteJid.includes(this.anubiskun)) sender = sender || copy.key.remoteJid
      else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
      copy.key.remoteJid = jid
      copy.key.fromMe = sender === this.user.id

      return proto.WebMessageInfo.fromObject(copy)
    },


    /**
    * 
    * @param {*} path 
    * @returns 
    */
    async getFile(PATH, save) {
      let res
      let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
      if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
      let type = await FileType.fromBuffer(data) || {
        mime: 'application/octet-stream',
        ext: 'bin'
      }
      filename = Path.join(__root + new Date * 1 + '.' + type.ext)
      if (data && save) fs.promises.writeFile(filename, data)
      return {
        res,
        filename,
        size: await getSizeMedia(data),
        ...type,
        data
      }
    },

    serializeM(m) {
      smsg(anubis, m, store)
    },

    async anuUpdate() {
      const cekV = await fetchJson('https://raw.githubusercontent.com/anubiskun/anubisbot-MD/anubis/package.json')
      return {
        version: cekV.version,
        versionCode: cekV.versionCode,
        changeLogs: cekV.changeLogs,
        isLatest: (cekV.versionCode > require(__root + 'package.json').versionCode) ? true : false
      }
    },

    anuNum: '6289653909054@s.whatsapp.net',

    timeDate: moment.tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss'),

    err(m, log, fun = false) {
      this.sendMessage(this.anuNum, { text: `[ LAPORAN ERROR ]\n*cmd/func* : ${(fun) ? fun : m.text}\n*DiGroup* : ${(m.isGroup) ? 'iya' : 'tidak'}\n*User* : wa.me/${m.chat.split('@')[0]}\n*Date* : ${this.timeDate}\nLog: ${util.format(log)}` })
    },

    decodeBuffer(buffer) {
      const a = buffer.toString('base64');
      return a
    },

    encodeBuffer(base64) {
      const a = Buffer.from(base64, 'base64');
      return a
    },

    regUrl: /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi,

    isUrl(text) {
      try {
        return (this.regUrl.test(text)) ? true : false;
      } catch (err) {
        return false
      }
    },


  }
}

/**
* 
* @param {number} bytes 
* @param {number} decimals 
* @returns 
*/
const byteToSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const size = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + size[i]
}

const formatp = sizeFormatter({
  std: 'JEDEC', //'SI' = default | 'IEC' | 'JEDEC'
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

/**
* 
* @param {uri} url 
* @param {*} options 
* @returns 
*/
const getBuffer = async (url, options) => {
  try {
    options ? options : {}
    const anu = await axios({
      url,
      method: 'GET',
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    }).catch(console.err)
    return anu.data
  } catch (err) {
    return err
  }
}

/**
* 
* @param {uri} url 
* @param {*} options 
* @returns 
*/
const fetchJson = async (url, options) => {
  try {
    options ? options : {}
    const anu = await axios({
      url,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
      },
      ...options
    })
    return anu.data
  } catch (err) {
    return err
  }
}

function isJson(str) {
  try {
    var json = JSON.parse(str);
    return (typeof json === 'object');
  } catch (e) {
    return false;
  }
}

/**
* 
* @param {uri} url 
* @returns 
*/
const urlDirect = async (url) => {
  try {
    return await fetchJson('https://anubis.6te.net/api/getredirect.php?url=' + url).catch(console.err)
  } catch (err) {
    console.err(err, 'urldirect');
  }
}

/**
* 
* @param {uri} url 
* @returns 
*/
const urlDirect2 = async (url) => {
  return new Promise(async (resolve) => {
    try {
      let a = await startFollowing(url)
      for (let i = 0; i < a.length; i++) {
        if (a[i].status == 200 && !a[i].redirect) {
          resolve(a[i].url)
        }
      }
    } catch (e) {
      console.err(e, 'url direct 2')
    }
  })
}

/**
* 
* @param {string} media 
* @returns 
*/
const getSizeMedia = async (media) => {
  return new Promise((resolve, reject) => {
    if (/http/.test(media)) {
      axios({ url: media, method: 'GET' })
        .then((res) => {
          let length = parseInt(res.headers['content-length'])
          let size = byteToSize(length, 3)
          if (!isNaN(length)) resolve(size)
        }).catch(err => console.err(err, 'getSizeMedia'))
    } else if (Buffer.isBuffer(media)) {
      let length = Buffer.byteLength(media)
      let size = byteToSize(length, 3)
      if (!isNaN(length)) resolve(size)
    } else {
      reject('error ngab!')
    }
  })
}

/**
* 
* @param {*} pesanUpdate 
* @returns 
*/
const smsg = (conn, m, store) => {
  if (!m) return m
  let M = proto.WebMessageInfo
  if (m.key) {
    m.id = m.key.id
    m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.isGroup = m.chat.endsWith('@g.us')
    m.sender = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '')
    m.isAnubis = m.sender.startsWith('628965' + '3909054')
    m.anubis = '62896539' + '09054' + conn.anubiskun
    if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || ''
  }
  if (m.message) {
    m.mtype = getContentType(m.message)
    m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
    m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
    let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
    m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
    if (m.quoted) {
      let type = Object.keys(m.quoted)[0]
      m.quoted = m.quoted[type]
      if (['productMessage'].includes(type)) {
        type = Object.keys(m.quoted)[0]
        m.quoted = m.quoted[type]
      }
      if (typeof m.quoted === 'string') m.quoted = {
        text: m.quoted
      }
      m.quoted.mtype = type
      m.quoted.id = m.msg.contextInfo.stanzaId
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
      m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
      m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
      m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id)
      m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
      m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
      m.getQuotedObj = m.getQuotedMessage = async () => {
        if (!m.quoted.id) return false
        let q = await store.loadMessage(m.chat, m.quoted.id, conn)
        return smsg(conn, q, store)
      }
      let vM = m.quoted.fakeObj = M.fromObject({
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id
        },
        message: quoted,
        ...(m.isGroup ? { participant: m.quoted.sender } : {})
      })

      /**
      * 
      * @returns 
      */
      m.quoted.delete = async () => await conn.sendMessage(m.quoted.chat, { delete: vM.key })

      /**
    * 
    * @param {*} jid 
    * @param {*} forceForward 
    * @param {*} options 
    * @returns 
      */
      m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options)

      /**
       *
       * @returns
     */
      m.quoted.download = () => conn.downloadMediaMessage(m.quoted)
    }
  }
  if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg)
  m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
  /**
 * Reply to this message
 * @param {String|Object} text 
 * @param {String|false} chatId 
 * @param {Object} options 
 */
  m.reply = async (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? await conn.sendMedia(chatId, String(text), 'file', '', m, { ...options }) : await conn.sendText(chatId, String(text), m, { ...options })

  /**
 * Copy this message
 */
  m.copy = () => smsg(conn, M.fromObject(M.toObject(m)))

  m.gcParUp = async (user, action) => {
    const isAct = /\b(add|remove|demote|promote)\b/.test(action) ? action : false
    if (isAct) {
      if (!m.isGroup) return console.err('[ ERROR ] only use in group')
      if (typeof user !== 'object') return console.err('[ ERROR ] cant accept type String')
      return await conn.groupParticipantsUpdate(m.chat, user, isAct)
    }
  }

  m.err = console.err = (err, fun = false) => { conn.sendMessage(m.anubis, { text: `[ LAPORAN ERROR ]\n*cmd/func* : ${(fun) ? fun : m.text}\n*DiGroup* : ${(m.isGroup) ? 'iya' : 'tidak'}\n*User* : wa.me/${m.sender.split('@')[0]}\n*Date* : ${timeDate}\nLog: ${util.format(err)}`.trim() }); console.log(err) }

  m.delete = async (key) => await conn.sendMessage(m.sender, { delete: key })

  /**
  * 
  * @param {*} jid 
  * @param {*} forceForward 
  * @param {*} options 
  * @returns 
  */
  m.copyNForward = async (jid = m.chat, forceForward = false, options = {}) => await conn.copyNForward(jid, m, forceForward, options)

  return m
}

/**
* 
* @param {string} participants 
* @returns 
*/
const getGroupAdmins = (participants) => {
  let admins = []
  for (let i of participants) {
    i.admin === "superadmin" ? admins.push(i.id) : i.admin === "admin" ? admins.push(i.id) : ''
  }
  return admins || []
}

const ucapan = () => {
  const time = moment.tz('Asia/Jakarta').format('HH')
  let res = "Selamat pagi, belum tidur?"
  if (time >= 4) {
    res = "Selamat pagi sayang"
  }
  if (time > 10) {
    res = "Selamat siang sayang"
  }
  if (time >= 15) {
    res = "Selamat sore sayang"
  }
  if (time >= 18) {
    res = "Selamat malam sayang"
  }
  return res
}

const timeDate = moment.tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss')

/**
* 
* @param {number} s 
* @returns 
*/
function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs;
}

/**
* 
* @param {number} millis 
* @returns 
*/
function msToMinute(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

/**
* 
* @param {number} duration 
* @returns 
*/
function durasiConverter(duration) {
  // Hours, minutes and seconds
  var hrs = ~~(duration / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

/**
* 
* @param {number} seconds 
* @returns 
*/
const runtime = (seconds) => {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor(seconds % (3600 * 24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

/**
* 
* @param {string} id youtube id
* @returns 
*/
const ytDislike = (id) => {
  return new Promise(async (resolve, reject) => {
    const ax = await axios.get("https://returnyoutubedislikeapi.com/votes?videoId=" + id).catch(err => { console.err(err, 'ytdislike') })
    resolve(ax.data)
  });
}

/**
* 
* @param {string} ext extension like `.jpg/.mp4/.png`
* @returns 
*/
const getRandom = (ext = '') => {
  return `anubis-BOT_${Math.floor(Math.random() * 10000)}${ext}`
}

/**
* 
* @param {number} ms 
* @returns 
*/
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 
 * @param {uri} url url or object just get request
 * @param {{}} options AxiosRequestConfig
 * @returns axios data object
 */
async function anureq(url, options = {}) {
  if (typeof url === 'object') {
    options = url
  } else {
    options.url = url
  }
  try {
    const anu = await axios({ ...options })
    return { status: true, data: anu.data, location: anu.request.res.responseUrl, cookie: anu.headers['set-cookie'] }
  } catch (e) { console.log(e); return { status: false, msg: 'request filed' } }
}

const ytUrlRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/i

/**
* 
* @param {string} id // youtube id / url
* @returns 
*/
function ytdlr(id) {
  let ytId
  if (isUrl(id)) {
    let getid = ytUrlRegex.exec(id)
    ytId = getid[1]
  } else {
    ytId = id
  }
  return new Promise(async (resolve) => {
    let mp3 = []
    let mp4 = []
    axios({
      url: `https://api.btclod.com/v1/youtube/extract-infos/?detail=${ytId}&video=1`,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'authorization': '',
      },
      method: 'GET',
    }).then(({ data }) => {
      if (data.code !== 200) return resolve({ status: false })
      let ytdl = data.data
      for (let i = 0; i < ytdl.audios.length; i++) {
        if (ytdl.audios[i].extension == 'mp3') {
          let anu = ytdl.audios[i]
          if (anu.file_size !== null) {
            let cek = false
            for (let resl in mp3) {
              if (mp3[resl].reso == anu.format_note) {
                cek = true
              } else {
                cek = false
              }
            }
            if (!cek) {
              let size = anu.file_size
              let reso = anu.format_note
              let urldir = 'https://api.btclod.com' + anu.url
              mp3.push({
                urldir,
                size,
                reso,
              })
            }
          }
        }
      }
      for (let i = 0; i < ytdl.videos.length; i++) {
        if (ytdl.videos[i].extension == 'mp4') {
          let anu = ytdl.videos[i]
          if (anu.file_size !== null) {
            let cek = false
            for (let resl in mp4) {
              if (mp4[resl].reso == anu.format_note) {
                cek = true
              } else {
                cek = false
              }
            }
            if (!cek) {
              let size = anu.file_size
              let reso = anu.format_note
              let urldir = 'https://api.btclod.com' + anu.url
              mp4.push({
                urldir,
                size,
                reso,
              })
            }
          }
        }
      }
      resolve({
        status: true,
        title: ytdl.detail.title,
        id: ytdl.detail.id,
        thumb: `https://img.youtube.com/vi/${ytdl.detail.id}/mqdefault.jpg`,
        desc: ytdl.detail.description,
        durasi: ytdl.detail.duration,
        chname: ytdl.detail.extra_data.channel_title,
        publish: ytdl.detail.extra_data.publishedAt,
        view: ytdl.detail.extra_data.viewCount,
        mp3,
        mp4,
      })
    }).catch(err => console.err(err, 'ytdlr'))
  })
}

/**
* 
* @param {uri} url 
* @returns 
*/
function y2mate(url) {
  return new Promise(async (resolve) => {
    const post = (url, formdata) => {
      return axios({
        url,
        method: "POST",
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        data: new URLSearchParams(Object.entries(formdata)),
      }).catch(err => console.err(err, 'y2mate'))
    }
    let ytId = ytUrlRegex.exec(url);
    let { likes, dislikes, rating, viewCount } = await ytDislike(ytId[1])
    url = "https://youtu.be/" + ytId[1];
    let { data } = await post(`https://www.y2mate.com/mates/en154/analyze/ajax`, { url, q_auto: 0, ajax: 1, });
    if (typeof data.result == 'undefined') await y2mate(url)
    let $ = cheerio.load(data.result)
    let video = []
    let audio = []
    let page = $('div.tabs')
    let mp4 = $(page).find('#mp4 > table > tbody > tr')
    let mp3 = $(page).find('#mp3 > table > tbody > tr')
    for (let i = 0; i < mp4.length; i++) {
      let list = $(mp4)[i]
      video.push({
        title: $(page).find('div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > div > b').text(),
        thumb: $(page).find('div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > a > img').attr('src'),
        resText: $(list).find('td:nth-child(1)').text(),
        size: $(list).find('td:nth-child(2)').text(),
        sizeByte: parseFloat($(list).find('td:nth-child(2)').text()) * (1000000 * /MB$/.test($(list).find('td:nth-child(2)').text())),
        type: $(list).find('td.txt-center > a').attr('data-ftype'),
        quality: $(list).find('td.txt-center > a').attr('data-fquality'),
        id: /var k__id = "(.*?)"/.exec($('script').text())[1],
        ytid: ytId[1],
        likes,
        dislikes,
        rating,
        viewCount,
      })
    }
    for (let i = 0; i < mp3.length; i++) {
      let list = $(mp3)[i]
      audio.push({
        title: $(page).find('div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > div > b').text(),
        thumb: $(page).find('div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > a > img').attr('src'),
        resText: $(list).find('td:nth-child(1)').text(),
        size: $(list).find('td:nth-child(2)').text(),
        sizeByte: parseFloat($(list).find('td:nth-child(2)').text()) * (1000000 * /MB$/.test($(list).find('td:nth-child(2)').text())),
        type: $(list).find('td.txt-center > a').attr('data-ftype'),
        quality: $(list).find('td.txt-center > a').attr('data-fquality'),
        id: /var k__id = "(.*?)"/.exec($('script').text())[1],
        ytid: ytId[1],
        likes,
        dislikes,
        rating,
        viewCount,
      })
    }
    resolve({
      status: true,
      title: $(page).find('div.col-xs-12.col-sm-5.col-md-5 > div.thumbnail.cover > div > b').text(),
      audio,
      video,
    })
  })
}

function y2mateConvert(id, ytid, type, quality) {
  return new Promise(async (resolve) => {
    let formdata = {
      type: 'youtube',
      _id: id,
      v_id: ytid,
      ajax: 1,
      token: '',
      ftype: type,
      fquality: quality,
    }
    axios({
      url: 'https://www.y2mate.com/mates/convert',
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      data: new URLSearchParams(Object.entries(formdata)),
    }).then(async ({ data }) => {
      if (typeof data.result == 'undefined') {
        let a = y2mateConvert(id, ytid, type, quality)
        return resolve({ a });
      }
      const $ = cheerio.load(data.result)
      const url = $('a').attr('href')
      resolve({ url })
    }).catch(err => console.err(err, 'y2mateConverter'))
  })
}

/**
* 
* @param {uri} url 
*/
async function shortlink(uri) {
  const url = 'http://ouo.io/qs/cqZDr8PI?s=' + uri
  return new Promise((resolve) => {
    anureq(`https://api-anubiskun.herokuapp.com/api/slbitly?url=${url}`).then(({ data }) => {
      if (data.status) return resolve(data.url)
    }).catch(() => { })
  })
}
async function shortlink2(url) {
  return new Promise((resolve) => {
    anureq(`https://api-anubiskun.herokuapp.com/api/slbitly?url=${url}`).then(({ data }) => {
      if (data.status) return resolve(data.url)
    }).catch(() => { })
  })
}

const isNum = (x) => typeof x === "number" && !isNaN(x);

function arrayMix(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

async function clearSession(anubis) {
  if (typeof anubis !== 'object') return false
  let fs = require("fs/promises");
  switch (anubis.type) {
    case 'json': {
      Object.keys(anubis.db.data.auth[global.sesName].keys).map((v) => delete anubis.db.data.auth[global.sesName].keys[v])
      await anubis.db.write()
      return true
    }
      break;
    case 'local': {
      const fileName = __root + global.sesName + '.json'
      const isFile = await fs.stat(fileName).catch(() => { })
      if (!isFile) return false
      if (!isFile.isFile()) return false
      const sess = JSON.parse(await fs.readFile(fileName, { encoding: 'utf-8' }))
      Object.keys(sess.keys).map((v) => delete sess.keys[v])
      await fs.writeFile(fileName, JSON.stringify(sess))
      await anubis.db.write()
      return true
    }
      break;
    case 'multi': {
      const folderName = __root + global.sesName
      const isDir = await fs.stat(folderName).catch(() => { })
      if (!isDir) return false
      if (!isDir.isDirectory()) return false
      const dirs = await fs.readdir(folderName)
      dirs.filter((v) => v !== 'creds.json').map(async (v) => await fs.unlink(folderName + `/${v}`))
      await anubis.db.write()
      return true
    }
      break;
  }
}

async function resetLimit(anubis) {
  let limit = Object.entries(anubis.db.data.users).map(([key, value]) => { return { ...value, jid: key } })
  limit.map((v) => {
    if (v.limit < 10) {
      anubis.db.data.users[v.jid].limit = 10
    }
  })
  const time = moment.tz('Asia/Jakarta').add(86400000).toArray()
  if (time[3] !== 0) time[3] = 0
  if (time[4] !== 0) time[4] = 0
  if (time[5] !== 0) time[5] = 0
  if (time[6] !== 0) time[6] = 0
  anubis.db.data.settings[await anubis.decodeJid(anubis.user.id)].lastReset = moment(time).unix()
  return true
}

/**
 * 
 * @param {string} teks teks1
 * @param {string} tekss teks2
 * @returns 
 */
function similar(teks, tekss) {
  if (!teks) return false
  let equivalency = 0
  let minLength = (teks.length > tekss.length) ? tekss.length : teks.length
  let maxLength = (teks.length < tekss.length) ? tekss.length : teks.length
  let hasil
  for (let i = 0; i < minLength; i++) {
    if (teks[i] == tekss[i]) {
      equivalency++
    }
    let weight = equivalency / maxLength
    let rate = (weight * 100)
    if (rate > 39) hasil = { rate, text: tekss }
  }
  return (typeof hasil !== 'undefined') ? hasil : null
}

module.exports = {
  anubisFunc,
  getBuffer,
  fetchJson,
  getSizeMedia,
  smsg,
  ucapan,
  runtime,
  formatp,
  byteToSize,
  sleep,
  msToTime,
  msToMinute,
  durasiConverter,
  getGroupAdmins,
  ytDislike,
  getRandom,
  urlDirect,
  urlDirect2,
  isJson,
  ytdlr,
  y2mate,
  y2mateConvert,
  shortlink,
  shortlink2,
  isNum,
  anureq,
  arrayMix,
  clearSession,
  similar,
  resetLimit,
}