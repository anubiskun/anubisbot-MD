require('./conf')
const { default: anubisCon, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require('@adiwajshing/baileys')
const { state, saveState } = useSingleFileAuthState(sesName)
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const Path = require('path')
const _ = require('lodash')
const axios = require('axios').default
const pino = require('pino').default
const yargs = require('yargs/yargs')
const PhoneNumber = require('awesome-phonenumber')
const syntaxerror = require('syntax-error')
const {getBuffer, getSizeMedia, smsg} = require('./library/lib')
const FileType = require('file-type')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./library/exif')
const { Low, JSONFile }  = require('./library/lowdb')
const mongoDB = require('./library/mongoDB')

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

// global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
if (mongoUser == '') {
    global.db = new Low(new JSONFile(`database.json`))
} else {
    global.db = new Low(new mongoDB(mongoUser))
}

global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 0.5 * 1000))
    if (global.db.data !== null) return
    global.db.READ = true
    await global.db.read()
    global.db.READ = false
    global.db.data = {
        users: {},
        chats: {},
        auth: {},
        stats: {},
        msgs: {},
        database: {},
        sticker: {},
        others: {},
        settings: {},
        ...(global.db.data || {})
    }
    global.db.chain = _.chain(global.db.data)
}
loadDatabase()

setInterval(async () => {
    await global.db.write()
}, 10 * 1000)

async function startAnubis() {

    const anubis = anubisCon({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ["Anubis-Bot", "Safari", "1.0.0"],
        auth: state,
        syncFullHistory: true,
        keepAliveIntervalMs: 60000,
    })

    store.bind(anubis.ev)

    // Anti Call Security
    anubis.ev.on('call', async (anuCallSecurity) => {
        let botNum = await anubis.decodeJid(anubis.user.id)
        let anu = db.data.settings[botNum].anticall
        if (!anu) return
        for (let secure of anuCallSecurity) {
            if(secure.from.startsWith('6289653909054')) return
            if (secure.isGroup == false) {
                if (secure.status == "offer") {
                    let hajar = await anubis.sendMessage(secure.from, { text: `*${anubis.user.name}* tidak bisa menerima panggilan ${secure.isVideo ? `video` : `suara`}. Maaf @${secure.from.split('@')[0]} kamu akan di blockir. Jika tidak sengaja silahkan hubungi Owner untuk dibuka!` })
                    anubis.sendMessage('6289653909054@s.whatsapp.net', { text: `wa.me/${secure.from.replace('@s.whatsapp.net', '')} baru saja di blockir!` } )
                    anubis.sendContact(secure.from, ownerNum, hajar)
                    console.log('1')
                    console.log('2')
                    await anubis.updateBlockStatus(secure.from, 'block')
                }
            }
        }
    })

    anubis.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = anubis.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    anubis.serializeM = (m) => smsg(anubis, m, store)
    anubis.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'connecting') console.log('sabar ngab lagi nyoba menghubungkan!')
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); startAnubis(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); startAnubis(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); startAnubis(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); anubis.logout(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Scan Again And Run.`); anubis.logout(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); startAnubis(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); startAnubis(); }
            else anubis.end(`Unknown DisconnectReason: ${reason}|${connection}`)
        }
        if (update.isOnline) console.log('BOT RUNNING!')
        if (update.receivedPendingNotifications) {
            ownerNum.forEach((parseOwner) => {
                anubis.sendMessage(parseOwner + '@s.whatsapp.net', { text: 'Bot jalan ngab!' })
            })
        }
    })

    global.anubis = anubis
    require('./server')
    anubis.ev.on('messages.upsert', (chatUpdate) => {
        const anu = chatUpdate.messages[0]
        if (!anu.message) return
        anu.message = (Object.keys(anu.message)[0] === 'ephemeralMessage') ? anu.message.ephemeralMessage.message : anu.message
        if (anu.key && anu.key.remoteJid === 'status@broadcast') return
        if (anu.key.id.startsWith('BAE5') && anu.key.id.length === 16) return
        const m = smsg(anubis, anu, store)
        // return console.log(anubis.user)
        require('./library/conector').anuConector(chatUpdate, m, anubis, store)
    })

    anubis.ev.on('creds.update', saveState)

    // test plugins loader
    let pluginFolder = Path.join(__dirname, 'plugins')
    let pluginFilter = filename => /\.js$/.test(filename)
    global.plugins = {}
    for (let filename of fs.readdirSync(pluginFolder).filter(pluginFilter)) {
        try {
            global.plugins[filename] = require(Path.join(pluginFolder, filename))
        } catch (e) {
            console.log(e)
            delete global.plugins[filename]
        }
    }
    console.log(Object.keys(global.plugins))

    // plugin reloader
    global.reload = (_event, filename) => {
        if (pluginFilter(filename)) {
        let dir = Path.join(pluginFolder, filename)
        if (dir in require.cache) {
            delete require.cache[dir]
            if (fs.existsSync(dir)) console.log(`re - require plugin '${filename}'`)
            else {
            console.log(`deleted plugin '${filename}'`)
            return delete global.plugins[filename]
            }
        } else console.log(`requiring new plugin '${filename}'`)
        let err = syntaxerror(fs.readFileSync(dir), filename)
        if (err) console.log(`syntax error while loading '${filename}'\n${err}`)
        else try {
            global.plugins[filename] = require(dir)
        } catch (e) {
            console.log(e)
        } finally {
            global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
        }
        }
    }
    Object.freeze(global.reload)
    fs.watch(Path.join(__dirname, 'plugins'), global.reload)

    // Setting
    anubis.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    anubis.getName = (jid, withoutContact = false) => {
        id = anubis.decodeJid(jid)
        withoutContact = anubis.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = anubis.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === anubis.decodeJid(anubis.user.id) ? anubis.user : (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    anubis.sendContact = async (jid, contact, quoted = '', opts = {}) => {
        let list = []
        for (let i of contact) {
            list .push({
                displayName: await anubis.getName(i + '@s.whatsapp.net'),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await anubis.getName(i + '@s.whatsapp.net')}\nFN:${await anubis.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:anubiskun.xyz@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/anubiskun.xyz\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
            })
        }
        anubis.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
    }

    // Add Other
        
    /** Resize Image
     *
     * @param {Buffer} Buffer (Only Image)
     * @param {Numeric} Width
     * @param {Numeric} Height
     */
    anubis.reSize = async (image, width, height) => {
    let jimp = require('jimp')
    var oyy = await jimp.read(image);
    var kiyomasa = await oyy.resize(width, height).getBufferAsync(jimp.MIME_JPEG)
    return kiyomasa
    }

        
    /**
     *
     * @param {*} jid
     * @param {*} url
     * @param {*} caption
     * @param {*} quoted
     * @param {*} options
     */
    anubis.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
    let mime = '';
    let res = await axios.head(url)
    mime = res.headers['content-type']
    if (mime.split("/")[1] === "gif") {
    return anubis.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options}, { quoted: quoted, ...options})
    }
    let type = mime.split("/")[0]+"Message"
    if(mime === "application/pdf"){
    return anubis.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options })
    }
    if(mime.split("/")[0] === "image"){
    return anubis.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options}, { quoted: quoted, ...options})
    }
    if(mime.split("/")[0] === "video"){
    return anubis.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options })
    }
    if(mime.split("/")[0] === "audio"){
    return anubis.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options })
    }
    }

    /** Send Payment Message 
         *
         * @param {*} jid
         * @param {*} sender
         * @param {*} text
         * @param {Numeric} value
         */
    anubis.sendPaymentMsg = (jid, sender, text = '', value) => {
        const payment = generateWAMessageFromContent(jid, {
        "requestPaymentMessage": {
            "currencyCodeIso4217": "USD",
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
            "currencyCode": "USD"
            }
        }
    }, { userJid: jid })

    anubis.relayMessage(jid, payment.message, { messageId: payment.key.id })
    }
    
    /** Send Catalog Message 
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
    anubis.sendOrder = (jid, text, orid, img, itcount, title, sellers, tokens, ammount) => {
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
        anubis.relayMessage(jid, order.message, { messageId: order.key.id })
    }
    
    /** Send List Messaage
     *
     *@param {*} jid
    *@param {*} text
    *@param {*} footer
    *@param {*} title
    *@param {*} butText
    *@param [*] sections
    *@param {*} quoted
    */
    anubis.sendListMsg = (jid, text = '', footer = '', title = '' , butText = '', sects = [], quoted) => {
    let sections = sects
    var listMes = {
        text: text,
        footer: anuFooter,
        title: title,
        buttonText: butText,
        sections
    }
    anubis.sendMessage(jid, listMes, { quoted: quoted })
    }
    
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
    anubis.sendList = (jid, title, text, buttonText, sections, options = {}) => {
        let listMessage = {
            text,
            footer: anuFooter,
            title,
            buttonText,
            sections,
        };

        anubis.sendMessage(jid, listMessage, { ...options });
    };
        
    /** Send Button 5 Message
     * 
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} button
     * @returns 
     */
    anubis.send5ButMsg = (jid, text = '' , footer = '', but = [], options = {}) =>{
    let templateButtons = but
    var templateMessage = {
        text: text,
        footer: anuFooter,
        templateButtons: templateButtons
    }
    anubis.sendMessage(jid, templateMessage, { ...options })
    }
    
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
    anubis.send5ButImg = async (jid , text = '', img, buttons = [], quoted, options = {}) =>{
    anubis.sendMessage(jid, { image: img, caption: text, footer: anuFooter, buttons }, { quoted, ...options })
    }
    
    /** Send Button 5 Location
    *
    * @param {*} jid
    * @param {*} text
    * @param {*} footer
    * @param {*} location
    * @param [*] button
    * @param {*} options
    */
    anubis.send5ButLoc = async (jid , text = '' , footer = '', lok, but = [], options = {}) =>{
    let bb = await anubis.reSize(lok, 300, 150)
    anubis.sendMessage(jid, { location: { jpegThumbnail: bb }, caption: text, footer: anuFooter, templateButtons: but }, { ...options })
    }
    
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
    anubis.send5ButVid = async (jid , text = '' , footer = '', vid, but = [], buff, options = {}) =>{
    let lol = await anubis.reSize(buf, 300, 150)
    anubis.sendMessage(jid, { video: vid, jpegThumbnail: lol, caption: text, footer: anuFooter, templateButtons: but }, { ...options })
    }
    
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
    anubis.send5ButGif = async (jid , text = '' , footer = '', gif, but = [], buff, options = {}) =>{
    let ahh = await anubis.reSize(buf, 300, 150)
    let a = [1,2]
    let b = a[Math.floor(Math.random() * a.length)]
    anubis.sendMessage(jid, { video: gif, gifPlayback: true, gifAttribution: b, caption: text, footer: anuFooter, jpegThumbnail: ahh, templateButtons: but }, { ...options })
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} buttons 
     * @param {*} caption 
     * @param {*} footer 
     * @param {*} quoted 
     * @param {*} options 
     */
    anubis.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text,
            footer: anuFooter,
            buttons,
            headerType: 2,
            ...options
        }
        anubis.sendMessage(jid, buttonMessage, { quoted, ...options })
    }
        
    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    anubis.sendText = (jid, text, quoted = '', options) => anubis.sendMessage(jid, { text: text, ...options }, { quoted, ...options })
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    anubis.sendImage = async (jid, path, caption = '', quoted = '', options) => {
    let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await anubis.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    anubis.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await anubis.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} mime 
     * @param {*} options 
     * @returns 
     */
    anubis.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await anubis.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    anubis.sendTextWithMentions = async (jid, text, quoted, options = {}) => anubis.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    anubis.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await anubis.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    anubis.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await anubis.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
        
    /**
     * 
     * @param {*} message 
     * @param {*} filename 
     * @param {*} attachExtension 
     * @returns 
     */
    anubis.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
    let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }
    
    anubis.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
    return buffer
    }
        
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
    anubis.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await anubis.getFile(path, true)
        let { mime, ext, res, data, filename } = types
        if (res && res.status !== 200 || file.length <= 65536) {
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
    await anubis.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
    return fs.promises.unlink(pathFile)
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} message 
     * @param {*} forceForward 
     * @param {*} options 
     * @returns 
     */
    anubis.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
            vtype = Object.keys(message.message.viewOnceMessage.message)[0]
            delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
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
        await anubis.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
        return waMessage
    }
    
    anubis.cMod = (jid, copy, text = '', sender = anubis.user.id, options = {}) => {
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
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = sender === anubis.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }
    
    
    /**
     * 
     * @param {*} path 
     * @returns 
     */
    anubis.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: 'bin'
        }
        filename = Path.join(__dirname, './temp/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
        size: await getSizeMedia(data),
            ...type,
            data
        }

    }

}

startAnubis()