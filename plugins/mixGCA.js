/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

 const {sleep} = require('../library/lib')

 module.exports = anuplug = async(m, anubis, { participants, text, command, args, usedPrefix }) => {
     let dbChats = anubis.db.data.chats[m.chat]
     let vote = anubis.db.data.others.vote;
     let user = m.mentionedJid[0]
        ? m.mentionedJid[0]
        
        : m.quoted
        ? m.quoted.sender
        : text.replace(/[^0-9]/g, "");
    let users = user.split("@")[0]
     switch(command){
         case 'add':
             {
                 let user = m.quoted
                         ? m.quoted.sender
                         : text.replace(/[^0-9]/g, "");
                 let users = user.split("@")[0]
                 let response = await anubis.groupParticipantsUpdate(m.chat, [users + anubis.anubiskun], "add")
                 if (response[0].status == 200) {
                     return m.reply('Berhasil menambahkan')
                 } else if (response[0].status == 409) {
                     return m.reply('Gagal menambahkan ngab!\nNomer sudah ada di group!')
                 } else if (response[0].status == 403) {
                     return m.reply('Gagal menambahkan ngab!\nSilahkan kirim link ke nomer tsb!')
                 }
             }
         break;
         case 'kick':
             {
                 let response = await anubis.groupParticipantsUpdate(m.chat, [users + anubis.anubiskun], "remove")
                 if (response[0].status == 200) return m.reply('Berhasil mengeluarkan')
                 else return m.reply('Gagal mengeluarkan ngab!\nNomer tidak ada di group!')
             }
         break;
        case 'promote':
            {
                let response = await anubis.groupParticipantsUpdate(m.chat, [users + anubis.anubiskun], "promote")
                if (response[0].status == 200) return m.reply('Berhasil promote admin')
                else m.reply('Gagal mengeluarkan ngab!\nNomer tidak ada di group!')
            }
        break;
        case 'demote':
            {
                let response = await anubis.groupParticipantsUpdate(m.chat, [users + anubis.anubiskun], "demote")
                if (response[0].status == 200) return m.reply('Berhasil demote admin')
                else m.reply('Gagal mengeluarkan ngab!\nNomer tidak ada di group!')
            }
        break;
        case 'setname':
            {
                if (!text) return m.reply(`example : ${usedPrefix + command} KannaBOT Official`)
                await anubis.groupUpdateSubject(m.chat, text).then((res) => m.reply('Berhasil mengubah nama grup')).catch((err) => m.reply('Gagal mengubah nama grup'))
            }
        break;
        case 'setdesk': case 'setdeskripsi':
            {
                if (!text) return m.reply(`example : ${usedPrefix + command} Rules`)
                await anubis.groupUpdateDescription(m.chat, text).then((res) => m.reply('Berhasil mengubah deskripsi grup')).catch((err) => m.reply('Gagal mengubah deskripsi grup'))
            }
        break;
        case 'setppgroup': case 'setppgc': case 'setppgrup':
            {
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
                if (!/(webp|image)/.test(mime)) return m.reply(`Kirim/reply image dengan caption ${usedPrefix + command}`)
                let media = await anubis.downloadAndSaveMediaMessage(qmsg);
                await anubis.updateProfilePicture(m.chat, { url: media }).catch((err) => fs.unlinkSync(media))
                m.reply('Berhasil mengubah poto profile grup')
            }
        break;
         case 'del':
         case 'delete':
             {
                 if (!m.quoted) return m.reply('reply pesan yang mau di delete')
                 let a = await anubis.sendMessage(m.chat, {
                     delete: {
                       remoteJid: m.chat,
                       id: m.quoted.id,
                       participant: m.quoted.sender,
                     },
                 })
                 if (a.status == 1) return m.reply('shaaap! ngab!')
             }
         break;
         case 'vote':
             {
                 if (m.chat in vote) return m.reply(`_Masih ada vote di chat ini ngab!_`)
                 vote[m.chat] = [text, [], []]
                 await sleep(1000)
                 let teks = `*[ VOTE ]*
 
*Alasan* : ${vote[m.chat][0] ? vote[m.chat][0] : 'tanpa alasan'}

*[ SETUJU ]* : ${vote[m.chat][1].length}
${vote[m.chat][1].map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join("\n")}

*[ TIDAK ]* : ${vote[m.chat][2].length}
${vote[m.chat][2].map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join("\n")}
 `
                 let buttons = [
                     { buttonId: `${usedPrefix}upvote`, buttonText: { displayText: "SETUJU" }, type: 1 },
                     { buttonId: `${usedPrefix}devote`, buttonText: { displayText: "TIDAK" }, type: 1 },
                 ];
                 let buttonMessage = { text: teks, footer: global.anuFooter, buttons };
                 anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
             }
         break;
         case 'delvote':
             {
                 if (!(m.chat in vote)) return m.reply(`_*gak ada vote di group ini ngab!*_\n\n*${usedPrefix}vote* - untuk memulai vote ngab!`)
                 let teks = `*[ HASIL VOTE ]*
 
*Alasan* : ${vote[m.chat][0] ? vote[m.chat][0] : 'tanpa alasan'}

*[ SETUJU ]* : ${vote[m.chat][1].length}
${vote[m.chat][1].map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join("\n")}

*[ TIDAK ]* : ${vote[m.chat][2].length}
${vote[m.chat][2].map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join("\n")}
 `
                 const a = await anubis.sendMessage(m.chat, {text: teks}, {quoted: m})
                 if (a.status) {
                     delete vote[m.chat];
                     m.reply("Berhasil Menghapus Sesi Vote Di Grup Ini");
                 }
             }
         break;
         case 'antilinkadd': {
             if (!text) return m.reply(`Example: \n${usedPrefix + command} google.com\n${usedPrefix + command} google.com,youtube.com,...`);
             if (!/\./.test(text)) return m.reply(`Example: ${usedPrefix + command} google.com`);
             let dom = text.split(',')
             let old = dbChats.banUrl.length
             for (let dm of dom){
                 const isSame = dbChats.banUrl.filter((v) => v === dm)
                 if (!isSame[0]) dbChats.banUrl.push(dm)
             }
             console.log(dbChats.banUrl)
             if (dbChats.banUrl.length === old){
                 m.reply(`Domain ${text} sudah ada di lists banned di group ini!`) 
             } else {
                 m.reply(`Domain ${text} berhasil di tambahkan di lists banned di group ini!`) 
             }
         }
         break;
         case 'antilinkdel': {
             if (!text) return m.reply(`Example: \n${usedPrefix + command} google.com\n${usedPrefix + command} google.com,youtube.com,...`);
             if (!/\./.test(text)) return m.reply(`Example: ${usedPrefix + command} google.com`);
             let dom = text.split(',')
             let old = dbChats.banUrl.length
             for (let dm of dom){
                 const isSame = dbChats.banUrl.find((v)=> v === dm)
                 if (isSame) dbChats.banUrl.splice(dbChats.banUrl.indexOf(isSame), 1);
             }
             if (dbChats.banUrl.length === old){
                 m.reply(`Domain ${text} tidak ada di lists banned global domain!`) 
             } else {
                 m.reply(`Domain ${text} berhasil di hapus dari lists banned global domain!`) 
             }
         }
         break;
         case 'antilinklist': {
             let banUrl = dbChats.banUrl.sort((a, b) => a.localeCompare(b));
             let pes = `*[ DOMAIN ANTILINK BANNED LIST ]*
             
${banUrl.map((v, i) => `${i+1}. ${v}`).join('\n')}`
             m.reply(pes)
         }
         break;
         case 'setting': {
             if (!text){
                 let seting = [
                     {name: 'antiviewonce', text: 'If on auto forwards oncetimeview media in this group', text2: 'If off disable auto forwards oncetimeview media in this group'},
                     {name: 'antilink', text: 'If on auto warn member if detected send link with banned domain in this group', text2: 'If off disable auto warn member if detected send link with banned domain in this group'},
                     {name: 'welcomer', text: 'If on auto send Welcomer to new member or leave member in this group', text2: 'If off disable auto send welcomer to new member or leave member in this group'},
                 ]
                 let secs = []
                 seting.forEach((v) => {
                     secs.push({
                         rows: [
                             { title: "on", description: `${v.text}`, rowId: `${usedPrefix + command} ${v.name} on` },
                             { title: "off", description: `${v.text2}`, rowId: `${usedPrefix + command} ${v.name} off` },
                         ],
                         title: v.name + ` ${(dbChats[v.name]) ? 'on' : 'off'}`,
                     })
                 })
                 let pesane = '*Choose one of the following options* :\n'
                 await anubis.sendList(m.chat, "*[ SETTINGS GROUP ]*", pesane, 'RESULT', secs, m);
             } else {
                 let [sName, value] = args
                 switch (sName){
                     case 'antiviewonce': {
                         if (value === 'on'){
                             dbChats[sName] = true
                         } else if (value === 'off'){
                             dbChats[sName] = true
                         }
                         m.reply((dbChats[sName]) ? `${sName} Dinyalakan!` : `${sName} Dimatikan!`)
                     }
                     break;
                     case 'antilink': {
                         if (value === 'on'){
                             dbChats[sName] = true
                         } else if (value === 'off'){
                             dbChats[sName] = true
                         }
                         m.reply((dbChats[sName]) ? `${sName} Dinyalakan!` : `${sName} Dimatikan!`)
                     }
                     break;
                     case 'welcomer': {
                         if (value === 'on'){
                             dbChats[sName] = true
                         } else if (value === 'off'){
                             dbChats[sName] = true
                         }
                         m.reply((dbChats[sName]) ? `${sName} Dinyalakan!` : `${sName} Dimatikan!`)
                     }
                     break;
                 }
             }
         }
         break;
     }
 }
 anuplug.help = ['add','kick','promote','demote','setname','setdesk','setppgroup','delete','vote','delvote','antilinkadd','antilinkdel','antilinklist','setting']
 anuplug.tags = ['group']
 anuplug.command = /^(add|kick|(pro|de)mote|set(desk(ripsi)?|name|pp(gc|group|grup))|del(ete|vote)?|antilink(add|del|list)|setting)$/i
 anuplug.group = true
 anuplug.botAdmin = true
 anuplug.admin = true
 
