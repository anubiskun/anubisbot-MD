/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 *
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

module.exports = anuplug = {
  async before(m, anubis, { store, botNumber, isAdmin, isBotAdmin }) {
    if (m.isBaileys || m.fromMe || m.isAnubis || !m.isGroup || m.isOwner)
      return true;
    if (!isBotAdmin) return global.dfail("isBotAdmin", m, anubis);
    const user = anubis.db.data.users[m.sender];
    const chat = anubis.db.data.chats[m.chat];
    const database = anubis.db.data.database;
    const setting = anubis.db.data.settings[botNumber];
    let dbregx = database.banUrl.map(
      (v) =>
        new RegExp(
          `(?:(?:https?|ftp)\:(?:[A-Za-z0-9\/]+)?\.?)?${v}(?:[A-Za-z0-9\/\-?=%.]+)?`,
          "g"
        )
    );
    let gcregx = chat.banUrl.map(
      (v) =>
        new RegExp(
          `(?:(?:https?|ftp)\:(?:[A-Za-z0-9\/]+)?\.?)?${v}(?:[A-Za-z0-9\/\-?=%.]+)?`,
          "g"
        )
    );
    let regx = [...dbregx, ...gcregx];
    let isLink = false;
    let link = new RegExp();
    for (link of regx) {
      if (!link) break;
      if (!chat.antilink) break;
      isLink = link.test(m.text);
      if (isLink) break;
    }
    if (isLink && chat.antilink) {
      user.warn = user.warn + 1;
      const pes = `[ Antilink ]\n\nPesan mengandung link!\nHai, @${
        m.sender.split("@")[0]
      } warning bertambah 1, max 3 warning\nJika Melebihi 3 maka akan di keluarkan dari group *${await anubis.getName(
        m.chat,
        true
      )}*\nTotal Warning anda : ${user.warn}`;
      const pWarn = await anubis.sendMessage(
        m.chat,
        { text: pes, mentions: [m.sender] },
        { quoted: m }
      );
      if (pWarn.status && user.warn > 3) {
        let a = await anubis.sendImage(
          m.chat,
          "https://i.pinimg.com/736x/c5/32/aa/c532aafc70f9b4e586e38bb7e0c71c7b.jpg",
          "hayoo mau keluar di dalem atau di luar?",
          m
        );
        if (a.status) {
          setTimeout(() => {
            if (isAdmin) {
              anubis.sendImage(
                m.chat,
                "https://64.media.tumblr.com/9fd00065505abbfcf5e54da7c195ea95/6e338d93859f114e-11/s640x960/824694309443f685756f445bc87ebab7f52331d8.png",
                "Eee? gome onii-chan! 🤢",
                m
              );
              user.warn = 0;
            } else {
              m.gcParUp(m.sender, "remove");
            }
          }, 3000);
        }
      }
    }
    if (chat.antiviewonce && !isAdmin) {
      if (m.mtype == "viewOnceMessage") {
        await anubis.copyNForward(
          m.chat,
          await store.loadMessage(m.chat, m.id),
          false,
          { quoted: m, readViewOnce: true }
        );
      }
    }
  },
};
