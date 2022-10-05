/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */
let regGc = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
module.exports = anuplug = {
    async before(m, anubis, { botNumber, isAdmin, isBotAdmin }) {
        if (m.isBaileys || m.fromMe || m.isAnubis || !m.isGroup || isAdmin) return true
        if (!isBotAdmin) return dfail('isBotAdmin', m)
        const user = anubis.db.data.users[m.sender]
        const setting = anubis.db.data.settings[botNumber]
        if (regGc.test(m.text) && setting.antilink) {
            user.warn = user.warn + 1
            const pes = `[ Antilink ]\n\nPesan mengandung link!\nHai, @${m.sender.split('@')[0]} warning bertambah 1, max 3 warning\nJika Melebihi 3 maka akan di keluarkan dari group *${await anubis.getName(m.chat, true)}*\nTotal Warning anda : ${user.warn}`;
            const pWarn = await anubis.sendMessage(m.chat, {text: pes, mentions: [m.sender]}, {quoted: m})
            if (pWarn.status && user.warn > 3) {
                m.reply('hayoo mau keluar sendiri atau di keluarin?')
                setTimeout(() => {
                    m.gcParUp(m.sender, 'remove')
                    user.isBanned = true
                }, 5000)
            }
        }
    }
}