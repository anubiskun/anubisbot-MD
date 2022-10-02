/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

 module.exports = anuplug = async(m, anubis, { text, command, args, usedPrefix, participants }) => {
    let vote = anubis.db.data.others.vote;
    switch(command){
        case 'tagall':
            {
                let teks = `        [ TAGALL ] 
Pesan : ${text ? text : 'kosong'}\n\n`
                         for (let mem of participants) {
                           teks += `> @${mem.id.split("@")[0]}\n`;
                         }
                anubis.sendMessage(
                    m.chat,
                    { text: teks, mentions: participants.map((a) => a.id) },
                    { quoted: m }
                );
            }
        break;
        case 'hidetag':
        case 'ht':
            {
                anubis.sendMessage(m.chat,{ text: text ? text : "", mentions: participants.map((a) => a.id) },{ quoted: m }
                  );
            }
        break;
        case 'devote':
            {
                if (!(m.chat in vote)) return m.reply(`_*gak ada vote di group ini ngab!*_\n\n*${usedPrefix}vote* - untuk memulai vote ngab!`)
                let isVote = vote[m.chat][1].concat(vote[m.chat][2]);
                let wasVote = isVote.includes(m.sender);
                if (wasVote) return m.reply("Kamu Sudah Vote");
                vote[m.chat][2].push(m.sender);
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
                    { buttonId: `${usedPrefix}cekvote`, buttonText: { displayText: "CHECK VOTE" }, type: 1 },
                ];
                let buttonMessage = { text: teks, footer: global.anuFooter, buttons };
                anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
            }
        break;
        case 'upvote':
            {
                if (!(m.chat in vote)) return m.reply(`_*gak ada vote di group ini ngab!*_\n\n*${usedPrefix}vote* - untuk memulai vote ngab!`)
                let isVote = vote[m.chat][1].concat(vote[m.chat][2]);
                let wasVote = isVote.includes(m.sender);
                if (wasVote) return m.reply("Kamu Sudah Vote");
                vote[m.chat][1].push(m.sender);
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
                    { buttonId: `${usedPrefix}cekvote`, buttonText: { displayText: "CHECK VOTE" }, type: 1 },
                ];
                let buttonMessage = { text: teks, footer: global.anuFooter, buttons };
                anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
            }
        break;
        case 'cekvote':
            {
                if (!(m.chat in vote)) return m.reply(`_*gak ada vote di group ini ngab!*_\n\n*${usedPrefix}vote* - untuk memulai vote ngab!`)
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
                    { buttonId: `${usedPrefix}delvote`, buttonText: { displayText: "TUTUP VOTE" }, type: 1 },
                ];
                let buttonMessage = { text: teks, footer: global.anuFooter, buttons };
                anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
            }
        break;
        
    }
}
anuplug.help = ['tagall', 'hidetag','cekvote']
anuplug.tags = ['group']
anuplug.command = /^(tagall|ht|hidetag|(de|up|cek)vote)$/i
anuplug.group = true
