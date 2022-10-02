/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

 const fs = require('fs')
 const axios = require('axios').default
 const google = require('googlethis')
 const remobg = require("remove.bg");
 const isUrl = require('is-url')
 const util = require('util')
 const os = require('os')
 const { tmpfiles, telegraphUp} = require('../library/upload');
 const speed = require("performance-now");
 const { performance } = require("perf_hooks");
 const { runtime, formatp, shortlink, getRandom, byteToSize } = require('../library/lib')
 const { toAudio, toPTT} = require('../library/converter')
 const FileType = require('file-type');
 const googleIt = require('google-it');
 const { toBuffer } = require('@adiwajshing/baileys');
 
 module.exports = anuplug = async(m, anubis, { text, command, args, usedPrefix }) => {
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
         case 'cekexif':
             {
                 m.reply(`🌀> Packname : ${global.packname}\n🌀> Author : ${global.author}`);
             }
         break;
         case 'cl':
         case 'changelogs':
             {
                 let cap = ''
                 for (let i = 0; i < 5; i++){
                 cap += require(__root + 'package.json').changeLogs[i] + '\n─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n'
                 }
                 m.reply(cap)
             }
         break;
         case 'fetch':
             {
                 if (!isUrl(text)) return m.reply('wajib url direct ngab!')
                 const url = new URL(text)
                 m.reply(mess.wait)
                 try {
                     const res = await axios({url: url.href, method: "GET", responseType: "arraybuffer"})
                     if (res.statusText !== 'OK') return m.reply('wajib url direct ngab!')
                     if (res.headers['content-length'] > 100000000) {
                         delete res
                         throw `File size terlalu besar ngab!: ${byteToSize(res.headers['content-length'])}`
                     }
                     if (!/text|json/.test(res.headers['content-type'])) {
                         const type = await FileType.fromBuffer(res.data)
                         const ext = (res.headers['content-type'] == 'application/vnd.android.package-archive') ? '.apk' : '.' + type.ext
                         const fileName = getRandom(ext)
                         const caption = `*${fileName}*\nSize: *${byteToSize(res.headers['content-length'])}*`
                         if (/gif/.test(res.headers['content-type'])) {
                             return anubis.sendMessage(m.chat, { video: res.data, fileName, caption, gifPlayback: true }, { quoted: m })
                           }
                           if (/application/.test(res.headers['content-type'])) {
                             return anubis.sendMessage(m.chat, { document: res.data, mimetype: res.headers['content-type'], fileName, caption }, { quoted: m })
                           }
                           if (/image/.test(res.headers['content-type'])) {
                             return anubis.sendMessage(m.chat, { image: res.data, fileName, caption }, { quoted: m })
                           }
                           if (/video/.test(res.headers['content-type'])) {
                             return anubis.sendMessage(m.chat, { video: res.data, fileName, caption, mimetype: 'video/mp4' }, { quoted: m })
                           }
                           if (/audio/.test(res.headers['content-type'])) {
                             return anubis.sendMessage(m.chat, { audio: res.data, fileName, caption, mimetype: 'audio/mpeg' }, { quoted: m })
                           }
                     }
                     let txt = res.data
                     try {
                         txt = util.format(JSON.parse(txt+''))
                     } catch (e) {
                         txt = txt + ''
                     } finally {
                         m.reply(txt.slice(0, 65536) + '')
                     }
                 } catch (err) {
                     anubis.sendLog(m,err)
                     return m.reply('error ngab! coba contact owner!')
                 }
             }
         break;
         case 'p':
         case 'ping':
             {
                 const used = process.memoryUsage();
                 const cpus = os.cpus().map((cpu) => {
                   cpu.total = Object.keys(cpu.times).reduce(
                     (last, type) => last + cpu.times[type],
                     0
                   );
                   return cpu;
                 });
                 const cpu = cpus.reduce(
                   (last, cpu, _, { length }) => {
                     last.total += cpu.total;
                     last.speed += cpu.speed / length;
                     last.times.user += cpu.times.user;
                     last.times.nice += cpu.times.nice;
                     last.times.sys += cpu.times.sys;
                     last.times.idle += cpu.times.idle;
                     last.times.irq += cpu.times.irq;
                     return last;
                   },
                   {
                     speed: 0,
                     total: 0,
                     times: {
                       user: 0,
                       nice: 0,
                       sys: 0,
                       idle: 0,
                       irq: 0,
                     },
                   }
                 );
                 let timestamp = speed();
                 let latensi = speed() - timestamp;
                 neww = performance.now();
                 oldd = performance.now();
 respon = `
 Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${
         oldd - neww
     } _miliseconds_\n\nRuntime : ${runtime(process.uptime())}
 
 💻 Info Server
 RAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}
 
 _NodeJS Memory Usaage_
 ${Object.keys(used)
 .map(
 (key, _, arr) =>
 `${key.padEnd(Math.max(...arr.map((v) => v.length)), " ")}: ${formatp(
     used[key]
 )}`
 )
 .join("\n")}
 
 ${
 cpus[0]
 ? `_Total CPU Usage_
 ${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times)
     .map(
     (type) =>
         `- *${(type + "*").padEnd(6)}: ${(
         (100 * cpu.times[type]) /
         cpu.total
         ).toFixed(2)}%`
     )
     .join("\n")}
 _CPU Core(s) Usage (${cpus.length} Core CPU)_
 ${cpus
 .map(
 (cpu, i) =>
 `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(
     cpu.times
 )
     .map(
     (type) =>
         `- *${(type + "*").padEnd(6)}: ${(
         (100 * cpu.times[type]) /
         cpu.total
         ).toFixed(2)}%`
     )
     .join("\n")}`
 )
 .join("\n\n")}`
 : ""
 }
 `.trim();
                 m.reply(respon);
             }
         break;
         case 'rm':
         case 'readmore':
             {
                 const more = String.fromCharCode(8206)
                 const readMore = more.repeat(4001)
                 if (!text) return m.reply(`Example: ${usedPrefix + command} depan|belakang\n${usedPrefix + command} tau gasi! su|ka-ku ke kamu tu besar banget\nHasil : tau gasi! su${readMore}ka-ku ke kamu tu besar banget`)
                 let [ d, b ] = text.split('|')
                 if (!d) d = ''
                 if (!b) b = ''
                 m.reply(d + readMore + b)
             }
         break;
         case 'owner':
         case 'admin':
         case 'sewa':
             {
                 anubis.sendContact(m.chat, global.ownerNum, m);
             }
         break;
         case 'shortlink':
             {
                 if (!isUrl(text)) return m.reply(`*Example* : ${usedPrefix + command} https://google.com`)
                 if (/tinyurl.com/.test(text)) return m.reply('gila gila lu ngab! link nya dah pendek!!!\nLu mau gimana lagi si?!')
                 try {
                     m.reply(await shortlink(text))
                 } catch(err) {
                     anubis.sendLog(m,err)
                 }
             }
         break;
         case 'google':
             {
                 return m.reply(`command *${command}* lagi error ngab!`)
                 if (!text) throw `Example : ${usedPrefix + command} apakah bumi itu bulat?`
                 m.reply(mess.wait)
                 const options = {
                     page: 0, 
                     safe: false,
                     additional_params: { 
                       hl: 'en' 
                     }
                 }
                 try {
                     
                     const google = await googleIt({query: text})
                     console.log(google)
                     // const {results} = await google.search(text)
                     // console.log(results)
                     // let teks = `Google Search From : ${text}\n\n`
                     // for (let g of results) {
                     //     teks += `⭔ *Title* : ${g.title}\n`
                     //     teks += `⭔ *Description* : ${g.description}\n`
                     //     teks += `⭔ *Link* : ${g.url}\n\n────────────────────────\n\n`
                     // }
                     // anubis.sendMessage(m.chat, {text: teks}, { quoted: m });
                 } catch (err) {
                     anubis.sendLog(m,err)
                     return m.reply(`command *${command}* lagi error ngab!`)
                 }
             }
         break;
         case 'gimage':
             {
                 return m.reply(`command *${command}* lagi error ngab!`)
                 if (!text) throw `Example : ${usedPrefix + command} gojo satoru`
                 m.reply(mess.wait)
                 try {
                     const n = await google.image(text, { safe: false }).catch(err => {})
                     images = n[Math.floor(Math.random() * n.length)]
                     let buttons = [
                         {
                             buttonId: `${usedPrefix + command} ${text}`,
                             buttonText: { displayText: "Next Image" },
                             type: 1,
                         },
                     ];
                     let buttonMessage = {
                         image: { url: images.url },
                         caption: `*-------「 GIMAGE SEARCH 」-------*
                         🤠 *Query* : ${text}
                         🔗 *Media Url* : ${await shortlink(images.url)}
                         ⬛ *Size* : ${images.width}x${images.height}`,
                         footer: anuFooter,
                         buttons: buttons,
                         headerType: 4,
                     };
                     anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
                 } catch (err) {
                     anubis.sendLog(m,err)
                     return m.reply(`command *${command}* lagi error ngab!`)
                 }
             }
         break;
         case 'gimgrev':
             {
                 return m.reply(`command *${command}* lagi error ngab!`)
                 let qstring
                 if (!/image/.test(mime) && !isUrl(text)) return m.reply(`Reply gambar yang mau di cari di google ngab!`)
                 if (isUrl(text)) qstring = text
                 if (/image/.test(mime)) {
                     let media = await anubis.downloadAndSaveMediaMessage(qmsg);
                     let {url} = await UploadFileUgu(media)
                     await fs.unlinkSync(media);
                     qstring = url
                 }
                 m.reply(mess.wait)
                 try {
                     const {results} = await google.search(qstring, { ris: true });
                     let teks = `Result from Google search by Image :\n\n`
                     if (!results) return m.reply('Gambar Tidak di temukan kecocokan ngab!') 
                     for (let g of results) {
                         teks += `⭔ *Title* : ${g.title}\n`
                         teks += `⭔ *Description* : ${g.description}\n`
                         teks += `⭔ *Link* : ${g.url}\n\n────────────────────────\n\n`
                     }
                     anubis.sendMessage(m.chat, {text: teks}, { quoted: m });
                 } catch (err) {
                     anubis.sendLog(m,err)
                     return m.reply(`command *${command}* lagi error ngab!`)
                 }
             }
         break;
         case 'rmbg':
         case 'removebg':
             {
                 if (/!(webp|image)/.test(mime)) m.reply(`Kirim/Reply Image/video Dengan Caption ${usedPrefix + command}`)
                 try {
                     let apinobg = apirnobg[Math.floor(Math.random() * apirnobg.length)]
                     let localFile = await anubis.downloadAndSaveMediaMessage(qmsg);
                     let outputFile = __temp + getRandom('.png');
                     m.reply(mess.wait)
                     remobg.removeBackgroundFromImageFile({
                         path: localFile,
                         apiKey: apinobg,
                         size: "regular",
                         type: "auto",
                         scale: "100%",
                         outputFile,
                     }).then(async() => {
                         if (text = 's') {
                             const a = await anubis.sendAsSticker(m.chat, outputFile, m, {packname: global.packname, author: global.author})
                             await fs.unlinkSync(a);
                         } else {
                             anubis.sendMessage(m.chat,{ image: fs.readFileSync(outputFile), caption: mess.success },{ quoted: m });
                         }
                         await fs.unlinkSync(localFile);
                         await fs.unlinkSync(outputFile);
                     });
                 } catch (err) {
                     anubis.sendLog(m,err)
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
                 anubis.sendLog(m,err)
                   m.reply('error ngab! cba wa ownernya!')
                   console.log(err)
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
                 anubis.sendLog(m,err)
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
                 anubis.sendLog(m,err)
                 m.reply('error ngab! cba wa ownernya!')
                 console.log(err)
             }
         }
         break;
     }
 }
 anuplug.help = ['cekexif','changelogs','ping','readmore','owner','shortlink','google (trouble)','gimage (trouble)','gimgrev (trouble)','removebg','tomp3','tourl','tovn']
 anuplug.tags = ['tools']
 anuplug.command = /^(cekexif|changelogs|cl|fetch|p(ing)?|rm|readmore|owner|admin|sewa|shortlink|google|gimage|gimgrev|rmbg|removebg|to(mp3|url|vn))$/i