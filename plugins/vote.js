const { sleep } = require("../library/lib");

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    let vote = db.data.others.vote;
    switch (command) {
        case 'vote':
            {
                if (m.chat in vote) return m.reply(`_Masih ada vote di chat ini ngab!_`)
                vote[m.chat] = [text, [], []]
                sleep(1000)
                let teks = `*[ VOTE ]*
            
            *Alasan* : ${vote[m.chat][0] ? vote[m.chat][0] : 'tanpa alasan'}
            
            *[ SETUJU ]* : ${vote[m.chat][1].length}
            ${vote[m.chat][1].map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join("\n")}
            
            *[ TIDAK ]* : ${vote[m.chat][2].length}
            ${vote[m.chat][2].map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join("\n")}`
                let buttons = [
                    { buttonId: `${usedPrefix}upvote`, buttonText: { displayText: "SETUJU" }, type: 1 },
                    { buttonId: `${usedPrefix}devote`, buttonText: { displayText: "TIDAK" }, type: 1 },
                ];
                let buttonMessage = { text: teks, footer: global.anuFooter, buttons };
                anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
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
            ${vote[m.chat][2].map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join("\n")}`
                let buttons = [
                    { buttonId: `${usedPrefix}upvote`, buttonText: { displayText: "SETUJU" }, type: 1 },
                    { buttonId: `${usedPrefix}devote`, buttonText: { displayText: "TIDAK" }, type: 1 },
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
            ${vote[m.chat][2].map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join("\n")}`
                let buttons = [
                    { buttonId: `${usedPrefix}upvote`, buttonText: { displayText: "SETUJU" }, type: 1 },
                    { buttonId: `${usedPrefix}devote`, buttonText: { displayText: "TIDAK" }, type: 1 },
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
            ${vote[m.chat][2].map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join("\n")}`
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
                delete vote[m.chat];
                m.reply("Berhasil Menghapus Sesi Vote Di Grup Ini");
            }
        break;
    }
}
anuplug.help = ['','cek','del'].map(v => v + 'vote')
anuplug.tags = ['group']
anuplug.command = /^(de|up|cek|del)?vote$/i
anuplug.group = true
