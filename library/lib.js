/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

let fs = require('fs')
const { default: WAConnection, proto, jidDecode, downloadContentFromMessage, generateWAMessageFromContent, generateForwardMessageContent, getContentType, BufferJSON, initAuthCreds } = require('@adiwajshing/baileys')
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
const { imageToWebp, videoToWebp, ffmpeg, videoToThumb, imageToThumb } = require('./converter')

const KEY_MAP = {
  'pre-key': 'preKeys',
  'session': 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory'
};

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
      else v = id === '0'+this.anubiskun ? {
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
        return {status: false}
      }
      return {
        thumbnail: buffer,
        status: true,
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

    /** Send Button 5 Message
   * 
   * @param {*} jid
   * @param {*} text
   * @param {*} footer
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

    /** Send Button 5 Image
   *
   * @param {*} jid
   * @param {*} text
   * @param {*} footer
   * @param {*} image
   * @param [*] button
   * @param {*} options
   * @returns
   */
    async sendButtonImg(jid, text = '', img, buttons = [], quoted = '', options = {}) {
      return await this.sendMessage(jid, { image: img, caption: text, footer: anuFooter, buttons }, { quoted, ...options })
    },

    /** Send Button 5 Location
  *
  * @param {*} jid
  * @param {*} text
  * @param {*} footer
  * @param {*} location
  * @param [*] button
  * @param {*} options
  */
    async sendButtonLoc(jid, text = '', footer = '', lok, but = [], quoted = '', options = {}) {
      let bb = await this.genThumb(lok)
      let jpegThumbnail = (bb.status) ? bb.thumbnail : '' 
      return await this.sendMessage(jid, { location: { jpegThumbnail }, caption: text, footer: anuFooter, templateButtons: but }, { quoted, ...options })
    },

    /** Send Button 5 Video
   *
   * @param {*} jid
   * @param {*} text
   * @param {*} footer
   * @param {*} Video
   * @param [*] button
   * @param {*} options
   * @returns
   */
    async sendButtonVid(jid, text = '', footer = '', vid, but = [], quoted = '', options = {}) {
      let bb = await this.genThumb(vid)
      let jpegThumbnail = (bb.status) ? bb.thumbnail : '' 
      return await this.sendMessage(jid, { video: vid, caption: text, jpegThumbnail, footer: anuFooter, templateButtons: but }, { quoted, ...options })
    },

    /** Send Button 5 Gif
   *
   * @param {*} jid
   * @param {*} text
   * @param {*} footer
   * @param {*} Gif
   * @param [*] button
   * @param {*} options
   * @returns
   */
    async sendButtonGif(jid, text = '', footer = '', gif, but = [], quoted = '', options = {}) {
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
   * @param {*} footer 
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
    async sendText(jid, text, quoted = '', options) {
      return await this.sendMessage(jid, { text: text, ...options }, { quoted, ...options })
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
    async sendVideo(jid, path, caption = '', quoted = '', gif = false, options) {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      let bb = await this.genThumb(buffer)
      let jpegThumbnail = (bb.status) ? bb.thumbnail : '' 
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
          buffer = await imageToWebp(buff)
        }
        await this.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
      } catch (err) {
        console.log(err)
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
    async sendMedia(jid, path, fileName = '', caption = '', quoted = '', options = {}) {
      let types = await this.getFile(path, true)
      let { mime, ext, res, data, filename } = types
      if (res && res.status !== 200) {
        try { throw { json: JSON.parse(file.toString()) } }
        catch (e) { if (e.json) throw e.json }
      }
      let type = '', mimetype = mime, pathFile = filename
      if (options.asDocument) type = 'document'
      if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require('./lib/exif')
        let media = { mimetype: mime, data }
        pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
        await fs.promises.unlink(filename)
        type = 'sticker'
        mimetype = 'image/webp'
      }
      else if (/image/.test(mime)) type = 'image'
      else if (/video/.test(mime)) type = 'video'
      else if (/audio/.test(mime)) type = 'audio'
      else type = 'document'
      let a = await this.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
      return {
        ...a,
        pathFile: fs.promises.unlink(pathFile)
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

    sendLog(m,log, fun = false) {
      this.sendMessage(this.anuNum, {text: `[ LAPORAN ]\n*cmd/func* : ${(fun) ? fun : m.text}\n*DiGroup* : ${(m.isGroup) ? 'iya' : 'tidak'}\n*User* : wa.me/${m.chat.split('@')[0]}\n*Date* : ${this.timeDate}\nLog: ${util.format(log)}`})
    },

    decodeBuffer(buffer){
      const a = buffer.toString('base64');
      return a
    },

    encodeBuffer(base64){
      const a = Buffer.from(base64, 'base64');
      return a
    }

  }
}

/**
 * 
 * @param {{*}} database database filename or database cloud
 * @param String} name 
 * @returns if use database cloud save/write database after saveCreds
 */
const jsonFileAuth = async (database, name = null) => {
  const { readFileSync, writeFileSync, existsSync } = require('fs');
  let creds;
  let keys = {};

  /**
 * save the authentication state to the database cloud
 */
  const saveDB = () => {
      database[name] = JSON.parse((0, JSON.stringify({creds, keys}, BufferJSON.replacer, 2)))
  }
  /**
 * save the authentication state in JSON file
 */
  const saveLocal = () => {
      writeFileSync(database, 
      JSON.stringify({ creds, keys }, BufferJSON.replacer, 2));
  };

  if (typeof database == 'object') {
      if (name == null) throw new Error("parameter name can't be null");
      if (typeof database[name] == 'object' && typeof database[name].creds == 'object') {
          const res = JSON.parse(JSON.stringify(database[name]), BufferJSON.reviver);
          creds = res.creds;
          keys = res.keys;
      } else {
          database[name] = {};
          creds = (0, initAuthCreds)()
          keys = {};
      }
  } else if (typeof database == 'string') {
      if (existsSync(database)) {
          const result = JSON.parse(readFileSync(database, { encoding: 'utf-8' }), BufferJSON.reviver);
          creds = result.creds;
          keys = result.keys;
      }
      else {
          creds = (0, initAuthCreds)();
          keys = {};
      }
  } else {
      throw new Error("Invalid database that is not a JSONFile or Database :\n" + database);
  }

  return {
      state: {
          creds,
          keys: {
              get: async(type, ids) => {
                  const data = {};
                  const key = KEY_MAP[type];
                  await Promise.all(ids.map(async (id) => {
                      var _a;
                      let value = (_a = keys[key]) === null || _a === void 0 ? void 0 : _a[id];
                      if (type === 'app-state-sync-key' && value) {
                          value = proto.Message.AppStateSyncKeyData.fromObject(value);
                      }
                      data[id] = value;
                  }));
                  return data;
              },
              set: (data) => {
                  for (const _key in data) {
                      const key = KEY_MAP[_key];
                      keys[key] = keys[key] || {};
                      Object.assign(keys[key], data[_key]);
                  }
                  (typeof database == 'object') ? saveDB() : saveLocal()
              }
          }
      },
      anuCreds: (typeof database == 'object') ? saveDB : saveLocal
  };
};

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
    const getBuffer = async(url, options) => {
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
            })
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
    const fetchJson = async(url, options) => {
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
    const urlDirect = async(url) => {
      try {
        return await fetchJson('https://anubis.6te.net/api/getredirect.php?url=' + url)
      } catch (err) {
        console.log(err)
      }
    }

    /**
   * 
   * @param {uri} url 
   * @returns 
   */
    const urlDirect2 = async(url) => {
      return new Promise(async(resolve) => {
        try {
          let a = await startFollowing(url)
          for (let i = 0; i < a.length; i++) {
            if (a[i].status == 200 && !a[i].redirect){
              resolve(a[i].url)
            }
          }
        } catch (e) {
          
        }
      })
    }

    /**
   * 
   * @param {string} media 
   * @returns 
   */
    const getSizeMedia = async(media) => {
        return new Promise((resolve, reject) => {
            if (/http/.test(media)) {
                axios({url: media, method: 'GET'})
                .then((res) => {
                    let length = parseInt(res.headers['content-length'])
                    let size = byteToSize(length, 3)
                    if (!isNaN(length)) resolve(size)
                })
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
      m.quoted.delete = async() => await conn.sendMessage(m.quoted.chat, { delete: vM.key })

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
  m.reply = async (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? await conn.sendMedia(chatId, text, 'file', '', m, { ...options }) : await conn.sendText(chatId, text, m, { ...options })
  /**
* Copy this message
*/
  m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)))

  /**
 * 
 * @param {*} jid 
 * @param {*} forceForward 
 * @param {*} options 
 * @returns 
 */
  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => sconn.copyNForward(jid, m, forceForward, options)

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
          i.admin === "superadmin" ? admins.push(i.id) :  i.admin === "admin" ? admins.push(i.id) : ''
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
    
      return hrs + ':' + mins + ':' + secs + '.' + ms;
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
    function durasiConverter(duration)
    {   
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
          const ax = await axios.get("https://returnyoutubedislikeapi.com/votes?videoId=" + id)
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
 * @param {number} id 
 * @returns 
 */
    const igjson = (id) => {
        return new Promise((resolve, reject) => {
          //   const regex = /(https?:\/\/)?(www.)?instagram.com\/?([a-zA-Z0-9\.\_\-]+)?\/([p]+)?([reel]+)?([tv]+)?([stories]+)?\/([a-zA-Z0-9\-\_\.]+)\/?([0-9]+)?/g;
          let hasil = [];
          let user = {};
          let post = {};
          let media = [];
          let promoses = [];
          promoses.push(
            axios
              .get(`https://i.instagram.com/api/v1/media/${id}/info/`, {
                headers: {
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
                    cookie: anuCookie.ig,
                    "x-ig-app-id": 936619743392459,
                    "x-ig-www-claim":0,
                    "x-asbd-id":198387,
                    Accept: "*/*",
                },
              })
              .then(({ data }) => {

                let j = data.items[0];
                if (j.carousel_media) {
                  for (var i = 0; i < j.carousel_media.length; i++) {
                    let jj = j.carousel_media[i];
                    if (jj.video_versions) {
                      media.push({
                        url: jj.video_versions[0].url,
                        type: "mp4",
                      });
                    } else {
                      media.push({
                        url: jj.image_versions2.candidates[0].url,
                        type: "jpg",
                      });
                    }
                  }
                } else if (j.video_versions) {
                  media.push({
                    url: j.video_versions[0].url,
                    type: "mp4",
                  });
                } else {
                  media.push({
                    url: j.image_versions2.candidates[0].url,
                    type: "jpg",
                  });
                }
                let cap;
                if (j.caption == null) {
                  cap = "";
                } else {
                  cap = j.caption.text;
                }
                user = {
                  username: j.user.username,
                  full_name: j.user.full_name,
                  is_private: j.user.is_private,
                  is_verified: j.user.is_verified,
                  profile_pic_url: j.user.profile_pic_url,
                  id: j.user.pk,
                };
    
                if (j.taken_at) {
                  post = {
                    title: j.title,
                    caption: cap,
                    taken_at: j.taken_at,
                    comment_count: j.comment_count,
                    like_count: j.like_count,
                    video_duration: j.video_duration,
                    view_count: j.view_count,
                    play_count: j.play_count,
                    has_audio: j.has_audio,
                  };
                }
    
                hasil.push({
                  user: user,
                  post: post,
                  media: media,
                });
    
                Promise.all(promoses).then(() =>
                  resolve({
                    creator: "anubis-bot",
                    status: true,
                    data: hasil,
                  })
                );
              })
              .catch(reject)
          );
        });
      }

      /**
     * 
     * @param {string} shortcode 
     * @returns 
     */
      const iggetid = (shortcode) => {
        return new Promise( async(resolve, reject) => {
          // const regex = /(https?:\/\/)?(www.)?instagram.com\/?([a-zA-Z0-9\.\_\-]+)?\/([p]+)?([reel]+)?([tv]+)?([stories]+)?\/([a-zA-Z0-9\-\_\.]+)\/?([0-9]+)?/g;
          let promoses = [];
          // let iglink = regex.exec(query);
          const igid = await axios(
            {
                url: `https://www.instagram.com/graphql/query/?query_hash=d4e8ae69cb68f66329dcebe82fb69f6d&variables={"shortcode":"${shortcode}"}`,
                headers: {
                    "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
                    cookie: anuCookie.ig,
                    },
                data: null,
                method: "GET",
            }
          )
              try {
                resolve({status: true, id: igid.data.data.shortcode_media.id})
              } catch (e) {
                resolve({status: false})
              }
        });
      }

      /**
     * 
     * @param {uri} urlnya 
     * @returns 
     */
      const igstory = (urlnya) => {
        return new Promise(async(resolve, reject) => {
          let igPreg = /(?:https?:\/\/)?(?:www.)?instagram.com\/?(?:[a-zA-Z0-9\.\_\-]+)?\/((?:[p]+)?(?:[reel]+)?(?:[tv]+)?(?:[stories]+)?)\/([a-zA-Z0-9\-\_\.]+)\/?([0-9]+)?/g;
          let urll = new URL(urlnya)
          let url = await urlDirect2(urll.href)
          let regx = igPreg.exec(url)
          let media = [];
          let anubis = {}
          let user = {};
          if (regx[2] == 'highlights') {
            axios({
              url: `https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=highlight:${regx[3]}`,
              headers: {
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
                cookie: anuCookie.ig,
                "x-ig-app-id": 936619743392459,
                "x-ig-www-claim":0,
                "x-asbd-id":198387,
                Accept: "*/*",
              },
              method: 'GET'
            }).then(({data}) => {
              let j = data.reels_media[0];
                for (var i = 0; i < j.items.length; i++) {
                  let jj = j.items[i];
                  let cap;
                  if (jj.caption == null) {
                    cap = "";
                  } else {
                    cap = jj.caption.text;
                  }
                  if (jj.video_versions) {
                    media.push({
                      id: jj.id,
                      url: jj.video_versions[0].url,
                      type: "mp4",
                      caption: cap,
                      taken_at: jj.taken_at,
                    });
                  } else {
                    media.push({
                      id: jj.id,
                      url: jj.image_versions2.candidates[0].url,
                      type: "jpg",
                      caption: cap,
                      taken_at: jj.taken_at,
                    });
                  }
                }
                user = {
                  username: j.user.username,
                  full_name: j.user.full_name,
                  is_private: j.user.is_private,
                  is_verified: j.user.is_verified,
                  profile_pic_url: j.user.profile_pic_url,
                };
                if (urll.searchParams.get('story_media_id')) {
                  for (let i = 0; i < media.length; i++) {
                    if (media[i].id == urll.searchParams.get('story_media_id')) {
                      anubis = {
                        id: media[i].id,
                        url: media[i].url,
                        type: media[i].type,
                        caption: media[i].caption,
                        taken_at: media[i].taken_at,
                      }
                    }
                  }
                }
                return resolve({
                  status: true,
                  user,
                  media,
                  anubis,
                });
            })
          }
        });
      }

      /**
     * 
     * @param {uri} url 
     * @returns 
     */
      function tiktok(url) {
        return new Promise(async(resolve, reject) => {
          // try {
            axios.get('https://musicaldown.com/id', {
                headers: {
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
                }
            }).then(res => {
                const $ = cheerio.load(res.data)
                const url_name = $("#link_url").attr("name")
                const token_name = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("name")
                const token_ = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("value")
                const verify = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(3)").attr("value")
                let data = {
                    [`${url_name}`]: url,
                    [`${token_name}`]: token_,
                    verify: verify
                }
              return axios({
                  url: 'https://musicaldown.com/id/download',
                  method: 'post',
                  data: new URLSearchParams(Object.entries(data)),
                  headers: {
                      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                      'cookie': res.headers["set-cookie"]
                  }
              })
            }).then(respon => {
              const ch = cheerio.load(respon.data)
              resolve({
                  status: true,
                  profile: ch('body > div.welcome.section > div > div:nth-child(2) > div.col.s12.l4.center-align > div > div > img').attr('src'),
                  name: ch('body > div.welcome.section > div > div:nth-child(2) > div.col.s12.l4.center-align > div > h2:nth-child(2) > b').text(),
                  cap: ch('body > div.welcome.section > div > div:nth-child(2) > div.col.s12.l4.center-align > div > h2:nth-child(3)').text(),
                  nowm: ch('body > div.welcome.section > div > div:nth-child(2) > div.col.s12.l8 > a:nth-child(4)').attr('href'),
              })
          })
        })
      }

      /**
     * 
     * @param {uri} Url 
     * @returns 
     */
      async function tiktok2 (Url) {
        return new Promise (async (resolve, reject) => {
          let uri = await urlDirect2(Url)
          await axios.request({
            url: "https://ttdownloader.com/",
            method: "GET",
            headers: {
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "accept-language": "en-US,en;q=0.9,id;q=0.8",
              "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
              "cookie": "_ga=GA1.2.1240046717.1620835673; PHPSESSID=i14curq5t8omcljj1hlle52762; popCookie=1; _gid=GA1.2.1936694796.1623913934"
            }
          }).then(respon => {
            const $ = cheerio.load(respon.data)
            const token = $('#token').attr('value')
            axios({
              url: "https://ttdownloader.com/search/",
              method: "POST",
              data: new URLSearchParams(Object.entries({url: uri, format: "", token: token})),
              headers: {
                "accept": "/",
                "accept-language": "en-US,en;q=0.9,id;q=0.8",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
                "cookie": "_ga=GA1.2.1240046717.1620835673; PHPSESSID=i14curq5t8omcljj1hlle52762; popCookie=1; _gid=GA1.2.1936694796.1623913934"
              }
            }).then(res => {
              const ch = cheerio.load(res.data)
              resolve({
                videoUrl: ch('#results-list > div:nth-child(3)').find('div.download > a').attr('href'),
                nowatermark: ch('#results-list > div:nth-child(2)').find('div.download > a').attr('href'),
                music: ch('#results-list > div:nth-child(4)').find('div.download > a').attr('href')
              })
            }).catch(reject)
          }).catch(reject)
        })
      }

      /**
     * 
     * @param {string} querry 
     * @returns 
     */
      function pinterest(querry){
        return new Promise(async(resolve,reject) => {
          axios.get('https://id.pinterest.com/search/pins/?autologin=true&q=' + querry, {
            headers: {
            "cookie" : "_auth=1; _b=\"AVna7S1p7l1C5I9u0+nR3YzijpvXOPc6d09SyCzO+DcwpersQH36SmGiYfymBKhZcGg=\"; _pinterest_sess=TWc9PSZHamJOZ0JobUFiSEpSN3Z4a2NsMk9wZ3gxL1NSc2k2NkFLaUw5bVY5cXR5alZHR0gxY2h2MVZDZlNQalNpUUJFRVR5L3NlYy9JZkthekp3bHo5bXFuaFZzVHJFMnkrR3lTbm56U3YvQXBBTW96VUgzVUhuK1Z4VURGKzczUi9hNHdDeTJ5Y2pBTmxhc2owZ2hkSGlDemtUSnYvVXh5dDNkaDN3TjZCTk8ycTdHRHVsOFg2b2NQWCtpOWxqeDNjNkk3cS85MkhhSklSb0hwTnZvZVFyZmJEUllwbG9UVnpCYVNTRzZxOXNJcmduOVc4aURtM3NtRFo3STlmWjJvSjlWTU5ITzg0VUg1NGhOTEZzME9SNFNhVWJRWjRJK3pGMFA4Q3UvcHBnWHdaYXZpa2FUNkx6Z3RNQjEzTFJEOHZoaHRvazc1c1UrYlRuUmdKcDg3ZEY4cjNtZlBLRTRBZjNYK0lPTXZJTzQ5dU8ybDdVS015bWJKT0tjTWYyRlBzclpiamdsNmtpeUZnRjlwVGJXUmdOMXdTUkFHRWloVjBMR0JlTE5YcmhxVHdoNzFHbDZ0YmFHZ1VLQXU1QnpkM1FqUTNMTnhYb3VKeDVGbnhNSkdkNXFSMXQybjRGL3pyZXRLR0ZTc0xHZ0JvbTJCNnAzQzE0cW1WTndIK0trY05HV1gxS09NRktadnFCSDR2YzBoWmRiUGZiWXFQNjcwWmZhaDZQRm1UbzNxc21pV1p5WDlabm1UWGQzanc1SGlrZXB1bDVDWXQvUis3elN2SVFDbm1DSVE5Z0d4YW1sa2hsSkZJb1h0MTFpck5BdDR0d0lZOW1Pa2RDVzNySWpXWmUwOUFhQmFSVUpaOFQ3WlhOQldNMkExeDIvMjZHeXdnNjdMYWdiQUhUSEFBUlhUVTdBMThRRmh1ekJMYWZ2YTJkNlg0cmFCdnU2WEpwcXlPOVZYcGNhNkZDd051S3lGZmo0eHV0ZE42NW8xRm5aRWpoQnNKNnNlSGFad1MzOHNkdWtER0xQTFN5Z3lmRERsZnZWWE5CZEJneVRlMDd2VmNPMjloK0g5eCswZUVJTS9CRkFweHc5RUh6K1JocGN6clc1JmZtL3JhRE1sc0NMTFlpMVErRGtPcllvTGdldz0=; _ir=0"
          }
            }).then(({ data }) => {
          const $ = cheerio.load(data)
          const result = [];
          const hasil = [];
              $('div > a').get().map(b => {
              const link = $(b).find('img').attr('src')
                  result.push(link)
          });
            result.forEach(v => {
          if(v == undefined) return
          hasil.push(v.replace(/236/g,'736'))
            })
            hasil.shift();
          resolve(hasil)
          })
        })
      }

      /**
     * 
     * @param {uri} url 
     * @returns 
     */
      function hagodl(url) {
        return new Promise(async(resolve, reject) => {
          let promoses = [];
          let media = [];
          axios.get(url).then(({request}) => {
            let regx = /postId\=([0-9]*)\&/i
            let preg = regx.exec(request.res.responseUrl);
            // console.log()
            return preg[1]
          }).then((postId) => {
            return axios.get(`https://i-863.ihago.net/bbs/get_post_info?data={"post_id":"${postId}","lang":"id"}`)
          }).then(({data}) => {
            // return console.log(data)
            if (data.code !== 1) return resolve({status: false})
            if (data.data.info.video) {
            let video = [data.data.info.video]
                media.push({
                    url: video,
                    type: "mp4",
                });
            } else {
                media.push({
                    url: data.data.info.images,
                    type: "jpg",
                });
            }
            return resolve({
                status: true,
                nick: data.data.info.creator.nick,
                avatar: data.data.info.creator.avatar,
                sex: data.data.info.creator.sex,
                birth: data.data.info.creator.birth,
                post_id: data.data.info.post_id,
                tag_name: data.data.info.tag_name,
                text: data.data.info.text,
                media: media,
                likes: data.data.info.likes,
                replys: data.data.info.replys || ''
            })
            });
        });
      }

      /**
     * 
     * @param {uri} url 
     * @returns 
     */
    function subFinder(url) {
      return new Promise(async(resolve) => {
          axios({
              url: 'https://opentunnel.net/subdomain-finder',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                  'Accept': '*/*',
                  'X-Requested-With': 'XMLHttpRequest',
              },
              data: `g-recaptcha-response=03ANYolqsVi0vgOx8zJdI4bfM-6Q_7Rw-e7-mpsnDOo0O18lEUk2LUi33fgXbT0jvPFPHXzb2o3W7goQBqJk8Dd7IbutnoXyr1vJFUr8lle1sgU7A_zHUf76Bz-TxDf71fmX88johua53qHzlZy0ADE9PU2ogciIOOFPvWK5HO1zP4r2rvfum_pXzdatjjLvQohYteWZj2xNKWnaL__qLkFp0g-48bal7NuDs-Tc_EAH41iKumQsGiMcdyvziJgGJHpvNVPllfvghWxdNr1DtX-E7mLTbV1OKnfG6UMB3AUYY499Jvi5_q1DFntNOZSxS1FbHdHFvmGy0iKNdN_hspXgIgQFug_Bx-ZNiMyGHfci5IXtyms48544ce3IKArnxWBDP8k6pDFCxGayTjthgUCE8HUU4M9O9knEayGmQ6tA-uRj1dLudMVXE-Fj-ILdAeXlqbsGoAO8ED3JY1vbmQ0uJAvZTLgLI-5M-CUQmO-o77NtP7w8OUdLebgtpN9UoB8sFUw8CCQcqQqRviQheIkJAC7w7PB2c4Qw&action=validate_captcha&domain=`+ url,
              method: 'POST'
          }).then(({data}) => {
              let out = []
              const $ = cheerio.load(data)
              const a = $('div.table-responsive > table > tbody > tr')
              for (let i = 0; i < a.length; i++) {
                  const cf = $(a[i]).find('td:nth-child(1) > img').attr('alt')
                  const subdom = $(a[i]).find('td:nth-child(2) > a').text()
                  const ip = $(a[i]).find('td:nth-child(3) > a').text()
                  const country = $(a[i]).find('td:nth-child(4) > img').attr('alt')
                  const isp = $(a[i]).find('td:nth-child(5)').text()
                  let clf
                  if (cf == 'cloudflare_on') {
                      clf = true
                  } else {
                      clf = false
                  }

                  out.push({
                      cloudflare: clf,
                      subdomain: subdom,
                      ip: ip,
                      country: country,
                      isp: isp,
                  })
              }
              if (out.cloudflare == '') return resolve({status: false})
              resolve({status: true, data: out})
          })
      })
    }

    const ytUrlRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/i

  /**
 * 
 * @param {string} id // youtube id / url
 * @returns 
 */
  function ytdlr(id){
    let ytId
    if (isUrl(id)) {
        let getid = ytUrlRegex.exec(id)
        ytId = getid[1]
    } else {
        ytId = id
    }
    return new Promise(async(resolve) => {
        let mp3 = []
        let mp4 = []
        axios({
            url: `https://api.btclod.com/v1/youtube/extract-infos/?detail=${ytId}&video=1`,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'authorization': '',
            },
            method: 'GET',
        }).then(({data}) => {
            if (data.code !== 200) return resolve({status: false})
            let ytdl = data.data
            for (let i=0; i<ytdl.audios.length; i++){
                if (ytdl.audios[i].extension == 'mp3'){
                    let anu = ytdl.audios[i]
                    if (anu.file_size !== null) {
                        let cek = false
                        for (let resl in mp3){
                            if (mp3[resl].reso == anu.format_note){
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
            for (let i=0; i<ytdl.videos.length; i++){
                if (ytdl.videos[i].extension == 'mp4'){
                    let anu = ytdl.videos[i]
                    if (anu.file_size !== null) {
                        let cek = false
                        for (let resl in mp4){
                            if (mp4[resl].reso == anu.format_note){
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
        })
    })
}

/**
 * 
 * @param {uri} url 
 * @returns 
 */
function y2mate(url){
  return new Promise(async(resolve) => {
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
      })
    }
    let ytId = ytUrlRegex.exec(url);
    let {likes, dislikes, rating, viewCount} = await ytDislike(ytId[1])
    url = "https://youtu.be/" + ytId[1];
    let {data} = await post(`https://www.y2mate.com/mates/en154/analyze/ajax`, {url,q_auto: 0,ajax: 1,});
    if (typeof data.result == 'undefined') await y2mate(url)
    let $ = cheerio.load(data.result)
    let video = []
    let audio = []
    let page = $('div.tabs')
    let mp4 = $(page).find('#mp4 > table > tbody > tr')
    let mp3 = $(page).find('#mp3 > table > tbody > tr')
    for (let i = 0; i < mp4.length; i++){
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
    for (let i = 0; i < mp3.length; i++){
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

function y2mateConvert(id, ytid, type, quality){
  return new Promise(async(resolve) => {
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
      }).then(async({data}) => {
        if (typeof data.result == 'undefined') {
          let a = y2mateConvert(id, ytid, type, quality) 
          return resolve({a});
        }
        const $ = cheerio.load(data.result)
        const url = $('div > a').attr('href')
        resolve({url})
      })
  })
}

function ytdlr3(url) {
  return new Promise(async(resolve, reject) => {
    axios.get('https://a2converter.com/youtube-downloader/').then(({data}) => {
      const $ = cheerio.load(data)
      const token = $('#token').attr('value')
      const form = new BodyForm()
      form.append('url', url)
      form.append('token', token)
      return axios({
          url: "https://a2converter.com/wp-json/aio-dl/video-data/",
          headers: {
              "accept": "*/*",
              "accept-language": "en-US,en;q=0.9,id;q=0.8",
              "content-type": "application/x-www-form-urlencoded",
              "sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "cookie": "pll_language=en",
              "Referer": "https://a2converter.com/youtube-downloader/",
              "Referrer-Policy": "no-referrer-when-downgrade"
          },
          data: form,
          method: "POST"
      })
    }).then(({data}) => {
      let audio = []
      let video = []
      for (let i = 0; i < data.medias.length; i++) {
          let media = data.medias[i]
          if (media.audioAvailable) {
              if (media.videoAvailable){
                  video.push({
                      title: data.title,
                      duration: data.duration,
                      thumb: data.thumbnail,
                      url: media.url,
                      quality: media.quality,
                      extension: media.extension,
                      size: media.size,
                      formattedSize: media.formattedSize,
                  })
              } else {
                if (media.extension == 'mp3') {
                  audio.push({
                    title: data.title,
                    duration: data.duration,
                    thumb: data.thumbnail,
                    url: media.url,
                    quality: media.quality,
                    extension: media.extension,
                    size: media.size,
                    formattedSize: media.formattedSize,
                  })
                }
              }
          }
      }
      resolve({
          status: true,
          title: data.title,
          duration: data.duration,
          thumb: data.thumbnail,
          video,
          audio,
      })
    })
  })
}

/**
 * 
 * @param {string} query 
 * @returns 
 */
function jooxSearch (query) {
  let Query = query.replace(' ', '-')
  let tracks = []
  return new Promise (async (resolve, reject) => {
      axios({
          url: `https://api-jooxtt.sanook.com/openjoox/v2/search_type?country=id&lang=id&key=${Query}&type=0`,
          headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9,id;q=0.8",
            "sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://www.joox.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          data: null,
          method: "GET"
      }).then(({data}) => {
          if (data.error_code !== 0) return resolve({status: false})
          for (let i = 0; i < data.tracks.length; i++) {
            let track = data.tracks[i][0]
            let artis_list = ''
              for (let j = 0; j < track.artist_list.length; j++) {
                  artis_list += track.artist_list[j].name
                  artis_list += ', '
              }
              if (track.is_playable) {
                  let duration = durasiConverter(track.play_duration)
                  tracks.push({
                      id: track.id,
                      name: track.name,
                      album_name: track.album_name,
                      artis_list,
                      duration,
                      thumb: (track.images) ? track.images[1].url : undefined
                  })
              }
          }
          resolve({status: true, anubis: tracks})
        })
  })
}

/**
 * 
 * @param {string} id 
 * @returns 
 */
function jooxDownloader(id) {
  return new Promise(async(resolve) => {
      axios({
          url: "http://api.joox.com/web-fcgi-bin/web_get_songinfo?songid=" + id,
          headers: {
              "X-Forwarded-For": "36.73.34.109",
              Cookie: anuCookie.joox,
          },
          data: null,
          method: 'GET'
      }).then(({data}) => {
          const res = JSON.parse(data.replace("MusicInfoCallback(", "").replace("\n)", ""));
          if (res.code !== 0) return resolve({status: false})
          let hasil = {
              msong: res.msong,
              malbum: res.malbum,
              msinger: res.msinger,
              public_time: res.public_time,
              imgSrc: res.imgSrc,
              mp3Url: res.mp3Url,
              duration: durasiConverter(res.minterval),
              sizeByte: res.size128,
              size: byteToSize(res.size128),
          }
          resolve({status: true, anubis: hasil})
      })
  })
}

/**
 * 
 * @param {string} id 
 * @returns 
 */
function jooxLyric(id) {
  return new Promise(async(resolve) => {
      axios({
          url: "http://api.joox.com/web-fcgi-bin/web_lyric?musicid=" + id,
          headers: {
              "X-Forwarded-For": "36.73.34.109",
              Cookie: anuCookie.joox,
          },
          data: null,
          method: 'GET'
      }).then(({data}) => {
          const res = JSON.parse(data.replace("MusicJsonCallback(", "").replace("\n)", ""));
          if (res.code !== 0) return resolve({status: false})
          const lir = Buffer.from(res.lyric, "base64").toString("utf8");
          const lirik = lir.replace(/[[0-9]+\:[0-9]+\.[0-9]+\]/g, "").replace(/\n(\*\*\*(.)+\*\*\*)/g, "\n\n***By anubisbot-MD***");
          resolve({status: true, anubis: lirik})
      })
  })
}

/**
 * 
 * @param {string} query 
 * @returns 
 */
function soundcloud(query) {
  let search = encodeURIComponent(query)
  let hasil = []
  let headers = {
      "accept": "application/json, text/javascript, */*; q=0.1",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      "sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "Referer": "https://m.soundcloud.com/",
      "Referrer-Policy": "origin",
      'X-Forwarded-For': '13.227.231.38:443',
  }
  return new Promise(async(resolve) => {
      const res = await axios.get(`https://api-mobi.soundcloud.com/search/tracks?q=${search}&client_id=${anuCookie.soundcloud}&stage=`, {headers})
      
      if (typeof res.data.collection !== 'object') return resolve({status: false})
      for (let i = 0; i < 5; i++) {
          let json = res.data.collection[i]
          const getLagu = await axios.get(`${json.media.transcodings[1].url}?client_id=${anuCookie.soundcloud}&track_authorization=${json.track_authorization}`, {headers})
          
          hasil.push({
              artwork_url: json.artwork_url,
              full_name: json.user.full_name,
              username: json.user.username,
              verified: json.user.verified,
              user_url: json.user.permalink_url,
              comment_count: json.comment_count,
              created_at: json.created_at,
              description: json.description,
              duration: msToMinute(json.duration),
              genre: json.genre,
              title: json.title,
              playback_count: json.playback_count,
              likes_count: json.likes_count,
              reposts_count: json.reposts_count,
              id: json.id,
              urlmp3: getLagu.data.url,
          })
      }
      resolve({status: true, anubis: hasil})
  })
}

/**
 * 
 * @param {uri} url 
 */
async function shortlink(url) {
  let res = await axios.get('https://tinyurl.com/api-create.php?url=' + url)
  return res.data

}


module.exports = {
  anubisFunc,
  jsonFileAuth,
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
  igjson,
  iggetid,
  igstory,
  tiktok,
  tiktok2,
  urlDirect,
  urlDirect2,
  isJson,
  pinterest,
  hagodl,
  subFinder,
  ytUrlRegex,
  ytdlr,
  y2mate,
  y2mateConvert,
  ytdlr3,
  jooxSearch,
  jooxDownloader,
  jooxLyric,
  soundcloud,
  shortlink,
}
