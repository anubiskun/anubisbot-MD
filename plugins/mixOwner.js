/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

 let cp = require('child_process')
 let { promisify } = require('util')
 let exec = promisify(cp.exec).bind(cp)
 
 module.exports = anuplug = async(m, anubis, { text, command, args, usedPrefix }) => {
     switch(command){
         case 'addnote':
         case 'an':
             {
                 if (!m.quoted) return m.reply('Reply pesan/media yang mau di save ke notes!')
                 if (!text) return m.reply(`Example: ${usedPrefix + command} note name`)
                 const [nama, priv] = text.split('|')
                 let lock
                 if (!priv) {
                     lock = false
                 } else {
                     lock = true
                 }
                 let msgs = anubis.db.data.database[m.chat]
                 let pesan = JSON.stringify(m.quoted.fakeObj)
                 pesan = JSON.parse(pesan)
                 if (nama.toLowerCase() in msgs) return m.reply(`nama '${nama}' sudah ada ngab!`)
                 msgs[nama.toLowerCase()] = {
                     lock,
                     pesan
                 }
                 m.reply('note berhasil di simpan ngab!')
             }
         break;
         case 'delnote':
         case 'dn':
             {
                 if (!text) return m.reply(`Example: ${usedPrefix + command} note name`)
                 let msgs = anubis.db.data.database[m.chat]
                 if (!(text.toLowerCase() in msgs)) return m.reply('Gaada ngab!')
                 delete msgs[text.toLowerCase()];
                 m.reply('berhasil ngab!')
             }
         break;
         case 'rennote':
         case 'rn':
             {
                 if (!text) return m.reply(`Example: ${usedPrefix + command} namalama|namabaru`)
                 const [nama, ganti] = text.split('|')
                 if (!nama) return m.reply('lu mau ganti nama note yang mana ngab!')
                 if (!ganti) return m.reply('mau di ganti nama apa ngab! masukin dong!')
                 let msgs = anubis.db.data.database[m.chat]
                 if (!(nama.toLowerCase() in msgs)) return m.reply('Gaada ngab!')
                 msgs[ganti.toLowerCase()] = msgs[nama.toLowerCase()]
                 delete msgs[nama.toLowerCase()];
                 m.reply('berhasil ngab!')
             }
         break;
         case 'public':
             {
                 let public = botpublic
                 let pubMes
                 if (public) pubMes = 'public nyala ngab!'
                 if (!public) pubMes = 'public mati ngab!'
                 let buttons = [
                     { buttonId: `${usedPrefix}public on`, buttonText: { displayText: "ON" }, type: 1 },
                     { buttonId: `${usedPrefix}public off`, buttonText: { displayText: "OFF" }, type: 1 },
                 ];
                 let buttonMessage = { text: 'Pilih untuk switch mode bot\n\n' + pubMes, footer: global.anuFooter, buttons };
                 if (!text) return anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
                 if (text == 'on') {
                     botpublic = true
                     anubis.sendMessage(m.chat, {text: 'Bot sekarang bisa merespons semua orang!'}, {quoted: m})
                 } else if (text == 'off') {
                     botpublic = false
                     anubis.sendMessage(m.chat, {text: 'Bot sekarang hanya merespons owner/admin!'}, {quoted: m})
                 } else {
                     anubis.sendMessage(m.chat, {text: 'Mau lu apa bangsad??!!'}, {quoted: m})
                 }
             }
         break;
         case 'setexif':
             {
                 if (!text) return m.reply(`Example : ${usedPrefix + command} stiker by anubiskun`);
                 global.packname = text;
                 m.reply(`Exif berhasil diubah menjadi\n\n🌀> Packname : ${global.packname}\n🌀> Author : ${global.author}`);
             }
         break;
         case 'restart':
             {
                 const a = await anubis.sendMessage(m.chat, {text: 'Bot sedang di restart tunggu beberapa saat ngab!'}, {quoted: m})
                 if (a.status) {
                     process.send('restart')
                 }
             }
         break;
         case '$':
             {
                 if (!text) return
                 if (!anubis.user.id) return
                 let o
                 try {
                   o = await exec(text)
                 } catch (e) {
                   o = e
                 } finally {
                   let { stdout, stderr } = o
                   if (stdout.trim()) m.reply(stdout)
                   if (stderr.trim()) m.reply(stderr)
                 }
             }
         break;
         case 'cthumb':
            {
              if (!/(webp|image|video)/.test(mime)) return m.reply('reply/send image ngab!')
              const thumb = anubis.db.data.settings[botNumber].thumbnail
              const thm = await anubis.downloadMediaMessage(qmsg)
              const th = await anubis.genThumb(thm)
              thumb.buffer =  anubis.decodeBuffer(thm)
              thumb.type = th.type
              thumb.thumb =  anubis.decodeBuffer(th.thumbnail)
              await anubis.db.write()
              if (th.type === 'image') {
                anubis.sendMessage(m.chat, {image: anubis.encodeBuffer(thumb.buffer), caption: 'Berhasil mengganti Thumb Menu ngab!'}, {quoted: m})
              } else {
                anubis.sendMessage(m.chat, { video:  anubis.encodeBuffer(thumb.buffer), jpegThumbnail: anubis.encodeBuffer(thumb.thumb), gifPlayback: true, caption: 'Berhasil mengganti Thumb Menu ngab!'}, { quoted: m })
              }
            }
          break;
     }
 }
 anuplug.help = ['addnote','delnote','rennote','public','setexif','restart','$','cthumb']
 anuplug.tags = ['owner']
 anuplug.command = /^(addnote|an|delnote|dn|rennote|rn|public|setexif|restart|[$]|cthumb)$/i
 anuplug.isAnubis = true