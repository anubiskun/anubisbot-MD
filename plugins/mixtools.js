/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const fs = require('fs')
const axios = require('axios').default
const remobg = require("remove.bg");
const isUrl = require('is-url')
const util = require('util')
const { tmpfiles, telegraphUp } = require('../library/upload');
const { shortlink, getRandom, byteToSize, fetchJson } = require('../library/lib')
const { toAudio, toPTT } = require('../library/converter')
const FileType = require('file-type');
const ggleit = 'google-it';
const googleIt = require(ggleit)

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
    const isMedia = /image|video|sticker|audio/.test(mime);
    switch (command) {
        case 'fetch':
            {
                if (!isUrl(text)) return m.reply('wajib url direct ngab!')
                const url = new URL(text)
                m.reply(mess.wait)
                try {
                    const res = await axios({ url: url.href, method: "GET", responseType: "arraybuffer" })
                    if (res.statusText !== 'OK') return m.reply('wajib url direct ngab!')
                    if (res.headers['content-length'] > 100000000) {
                        delete res
                        return m.reply(`File size terlalu besar ngab!: ${byteToSize(res.headers['content-length'])}`)
                    }
                    if (!/text|json/.test(res.headers['content-type'])) {
                        const type = await FileType.fromBuffer(res.data)
                        const ext = (res.headers['content-type'] == 'application/vnd.android.package-archive') ? '.apk' : '.' + type.ext
                        const fileName = getRandom(ext)
                        const caption = `*${fileName}*\n${(res.headers['content-length']) ? `Size : *${byteToSize(res.headers['content-length'])}*` : ''}`
                        if (/(png|jpg)/.test(ext)) {
                            return anubis.sendImage(m.chat, res.data, caption, m)
                        } else if (/mp4/.test(ext)) {
                            return anubis.sendVideo(m.chat, res.data, caption, m)
                        } else if (/mp3/.test(ext)) {
                            return anubis.sendMessage(m.chat, { audio: res.data, fileName, caption, mimetype: 'audio/mpeg' }, { quoted: m })
                        } else if (/gif/.test(ext)) {
                            return anubis.sendMessage(m.chat, { video: res.data, fileName, caption, gifPlayback: true }, { quoted: m })
                        } else if (/application/.test(res.headers['content-type'])) {
                            return anubis.sendMessage(m.chat, { document: res.data, mimetype: res.headers['content-type'], fileName, caption }, { quoted: m })
                        }
                    }
                    let txt = res.data
                    try {
                        txt = util.format(JSON.parse(txt + ''))
                    } catch (e) {
                        txt = txt + ''
                    } finally {
                        m.reply(txt.slice(0, 65536) + '')
                    }
                } catch (err) {
                    console.err(err)
                    return m.reply('error ngab! coba contact owner!')
                }
            }
            break;
        case 'google':
            {
                if (!text) throw `Example : ${usedPrefix + command} apakah bumi itu bulat?`
                m.reply(mess.wait)
                try {
                    const google = await googleIt({ query: text })
                    let teks = `Google Search From : ${text}\n\n`
                    for (let g of google) {
                        teks += `⭔ *Title* : ${g.title}\n`
                        teks += `⭔ *Description* : ${g.snippet}\n`
                        teks += `⭔ *Link* : ${g.link}\n\n────────────────────────\n\n`
                    }
                    anubis.sendMessage(m.chat, { text: teks }, { quoted: m });
                } catch (err) {
                    console.err(err)
                    return m.reply(`command *${command}* lagi error ngab!`)
                }
            }
            break;
        case 'rmbg':
        case 'removebg':
            {
                if (!/(image)/.test(mime)) m.reply(`Kirim/Reply Image Dengan Caption ${usedPrefix + command}`)
                if (/(webp)/.test(mime)) m.reply(`Kirim/Reply Image Dengan Caption ${usedPrefix + command}`)
                try {
                    let apinobg = apirnobg[Math.floor(Math.random() * apirnobg.length)]
                    let localFile = await anubis.downloadAndSaveMediaMessage(qmsg);
                    let outputFile = __temp + getRandom('.png');
                    m.reply(mess.wait)
                    remobg.removeBackgroundFromImageFile({
                        path: localFile,
                        apiKey: apinobg,
                        size: "full",
                        type: "auto",
                        scale: "100%",
                        outputFile,
                    }).then(async () => {
                        if (text === 's') {
                            const a = await anubis.sendAsSticker(m.chat, outputFile, m, { packname: global.packname, author: global.author })
                            fs.unlinkSync(a);
                        } else {
                            anubis.sendMessage(m.chat, { image: fs.readFileSync(outputFile), caption: mess.success }, { quoted: m });
                        }
                        fs.unlinkSync(localFile);
                        fs.unlinkSync(outputFile);
                    }).catch(console.err)
                } catch (err) {
                    console.err(err)
                    m.reply(`command error ngab!`)
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
                    console.err(err)
                    m.reply('error ngab! cba wa ownernya!')
                }
            }
            break;
        case 'tourl':
            {
                if (!isMedia) return m.reply(`Reply media dengan caption *${usedPrefix + command}*`)
                try {
                    let media = await anubis.downloadAndSaveMediaMessage(qmsg);
                    if (/image/.test(mime)) {
                        let anu = await telegraphUp(media);
                        m.reply(util.format(anu));
                    } else if (!/image/.test(mime)) {
                        let anu = await tmpfiles(media);
                        m.reply(util.format(anu));
                    }
                    await fs.unlinkSync(media);
                } catch (err) {
                    console.err(err)
                    m.reply('error ngab! cba wa ownernya!')
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
                    console.err(err)
                    m.reply('error ngab! cba wa ownernya!')
                }
            }
            break;
        case 'emix2': {
            if (!text) return m.reply(`Example: ${usedPrefix + command} 😍 😪\nExample: ${usedPrefix + command} 😍`)
            if (/\|/.test(text)) {
                args = []
                args.push(text.split('|')[0], text.split('|')[1])
            }
            let [emo1, emo2] = args
            if (!emo1) return m.reply(`Example: ${usedPrefix + command} 😍 😪\nExample: ${usedPrefix + command} 😍`)
            if (!emo2) emo2 = emo1
            const anu = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emo1)}_${encodeURIComponent(emo2)}`)
            anubis.sendImage(m.chat, anu.results[0].url, await shortlink(anu.results[0].url), m)
        }
            break;
    }
}
anuplug.help = ['fetch', 'google', 'removebg', 'tomp3', 'tourl', 'tovn', 'emix2']
anuplug.tags = ['tools']
anuplug.command = /^(fetch|google|rmbg|removebg|to(mp3|url|vn)|emix2)$/i
anuplug.isPremium = true