/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const {sleep} = require('../library/lib')

module.exports = anuplug = async(m, anubis, { participants, text, command, args, usedPrefix }) => {
    let vote = anubis.db.data.others.vote;
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
                let user = m.mentionedJid[0]
                        ? m.mentionedJid[0]
                        : m.quoted
                        ? m.quoted.sender
                        : text.replace(/[^0-9]/g, "");
                let users = user.split("@")[0]
                let response = await anubis.groupParticipantsUpdate(m.chat, [users + anubis.anubiskun], "remove")
                if (response[0].status == 200) return m.reply('Berhasil mengeluarkan')
                else return m.reply('Gagal mengeluarkan ngab!\nNomer tidak ada di group!')
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
    }
}
anuplug.help = ['add', 'kick', 'delete','vote','delvote']
anuplug.tags = ['group']
anuplug.command = /^(add|kick|del(ete)?|(del)?vote)$/i
anuplug.group = true
anuplug.botAdmin = true
anuplug.admin = true
