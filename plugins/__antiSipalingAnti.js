module.exports = anuplug = {
  async before(m, anubis, { store, botNumber, isAdmin, isBotAdmin }) {
    const user = anubis.db.data.users[m.sender]
    const chat = anubis.db.data.chats[m.chat]
    const database = anubis.db.data.database
    const setting = anubis.db.data.settings[botNumber]
    if (m.isBaileys || m.fromMe || m.isAnubis || m.isOwner || !m.isGroup) return
    if (chat.antilink) {
      let banUrls = [
        ...database.banUrl,
        ...chat.banUrl
      ]
      let regx = new RegExp(`(?:(?:https?|ftp)\\:(?:[A-Za-z0-9\\/]+)?\\.?)?(${banUrls.map((v) => v).join('|')})(?:[A-Za-z0-9\\/\\-?=%.]+)?`, 'gi')
      let isLink = m.text.match(regx)
      if (!isBotAdmin) return global.dfail('isBotAdmin', m, anubis)
      if (isLink) {
        user.warn = user.warn + 1
        const pes = `[ Antilink ]\n\nPesan mengandung link!\n${isLink.map((v) => '> ' + v).join('\n')}\nHai, @${m.sender.split('@')[0]} warning bertambah 1, max 3 warning\nJika Melebihi 3 maka akan di keluarkan dari group *${await anubis.getName(m.chat, true)}*\nTotal Warning anda : ${user.warn}`;
        const pWarn = await anubis.sendMessage(m.chat, { text: pes, mentions: [m.sender] }, { quoted: m })
        if (pWarn.status && user.warn > 3) {
          let a = await anubis.sendImage(m.chat, 'https://i.pinimg.com/736x/c5/32/aa/c532aafc70f9b4e586e38bb7e0c71c7b.jpg', 'hayoo mau keluar di dalem atau di luar?', m)
          if (a.status) {
            setTimeout(() => {
              if (isAdmin) {
                anubis.sendImage(m.chat, 'https://64.media.tumblr.com/9fd00065505abbfcf5e54da7c195ea95/6e338d93859f114e-11/s640x960/824694309443f685756f445bc87ebab7f52331d8.png', 'Eee? gome onii-chan! 🤢', m)
                user.warn = 0
              } else {
                m.gcParUp(m.sender, 'remove')
                user.warn = 0
              }
            }, 3000)
          }
        }
      }
    }
    if (chat.antiviewonce) {
      if (!isAdmin) {
        if (m.mtype == 'viewOnceMessage') {
          await anubis.copyNForward(m.chat, await store.loadMessage(m.chat, m.id), false, { quoted: m, readViewOnce: true })
        }
      }
    }
    if (chat.antibadword) {
      let words = database.banWords.map((v) => v).join('|')
      let regex = RegExp(`\\b(${words})\\b`, 'gi')
      let isBan = m.text.match(regex)
      console.log(isBan)
      if (isBan && !isAdmin) {
        let a = await m.reply(`kata kasar *${isBan.map((v) => v).join(',')}* detected!`)
        if (a.status) {
          await anubis.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              id: m.id,
              participant: m.sender,
            }
          })
        }
      }
    }
  }
}