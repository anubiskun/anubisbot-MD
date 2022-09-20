const axios = require('axios')
const isUrl = require('is-url')
const util = require('util')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!isUrl(text)) return m.reply('wajib url direct ngab!')
    m.reply(mess.wait)
    try {
        let res = await axios.get(text)
        // return console.log(res)
        if (res.headers['content-length'] > 100 * 1024 * 1024 * 1024) {
            delete res
            throw `Content-Length: ${res.headers['content-length']}`
        }
        if (!/text|json/.test(res.headers['content-type'])) return anubis.sendMedia(m.chat, text, 'file', 'by anubis-bot', m)
        let txt = res.data
        try {
            txt = util.format(JSON.parse(txt+''))
        } catch (e) {
            txt = txt + ''
        } finally {
            m.reply(txt.slice(0, 65536) + '')
        }
    } catch (e) {
        console.log(e)
        return m.reply('error ngab! coba contact owner!')
    }
    
}
anuplug.command = /^(fetch)$/i
