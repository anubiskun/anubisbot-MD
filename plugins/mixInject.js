/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

 const { subFinder } = require("../library/lib")

 module.exports = anuplug = async(m, anubis, { text, command, args, usedPrefix }) => {
     if (!text) return m.reply(`*Example* : ${usedPrefix + command} google.com`)
     if (!/\./.test(text)) return m.reply(`*Example* : ${usedPrefix + command} google.com`)
     if (/https?/.test(text)) text = text.replace(/https?\:\/\//, '')
     m.reply(mess.wait)
     try {
         const {status, data} = await subFinder(text)
         if (!status) return m.reply('ga ada subdomain ngab!')
         let pesan = `[ SUBDOMAIN FINDER ] \n`
         for (let i = 0; i < data.length; i++) {
             pesan += '\nSubdomain : ' + data[i].subdomain
             pesan += '\nIp address : ' + data[i].ip
             if (data[i].cloudflare) { pesan += '\nCloudFlare : ✅' } else { pesan += '\nCloudFlare : ❌' }
             pesan += '\nCountry : ' + data[i].country
             pesan += '\nISP : ' + data[i].isp
             pesan += '\n--------------------------------'
         }
         m.reply(pesan)
     } catch (err) {
         anubis.sendLog(m,err)
         m.reply('sory ngab lagi error!')
         console.log(err)
     }
 }
 anuplug.help = ['subfinder']
 anuplug.tags = ['inject']
 anuplug.command = /^(subfind|subfinder)$/i
 