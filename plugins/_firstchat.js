/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const moment = require('moment-timezone')
module.exports = anuplug = {
  async all(m, anubis) {
      let user = anubis.db.data.users[m.sender]
      let public = global.botpublic
      if (m.chat.endsWith('broadcast') || m.fromMe || m.isGroup) return
      if (new Date - user.pc < 10800 * 1000) return // count 3 hours
      let buttons = [
        { buttonId: `.owner`, buttonText: { displayText: "Contact Owner" }, type: 1 },
        { buttonId: `.changelogs`, buttonText: { displayText: "Change Logs" }, type: 1 },
        { buttonId: `.menu`, buttonText: { displayText: "Menu" }, type: 1 },
      ];
      let buttonMessage = { text: `${ucapan()} *${anubis.getName(m.chat)}*\n${!public ? 'bot sedang ingin menyendiri,\n lagi maintenance sama ayang anubis, bot sementara ga bisa jawab >_< \nGomen nasai  *(⁄ʘ⁄⁄ω⁄⁄ʘ⁄)🙏🏻*' : user.banned ? "kamu dibanned _-'" : `\nAda yang bisa ${anubis.user.name} bantu?\n\nBTW sekrang command wajib pake prefix!\nPrefixnya ./!\nContoh: .sticker atau /menu\n\nKalu ga tau /atau ada error hubungi owner thxs!!`}\n*Source code* : \nhttps://github.com/anubiskun/anubisbot-MD\n\n*Change Log* :\n${require(__root + 'package.json').changeLogs[0]}\n`.trim(), footer: global.anuFooter, buttons };
      anubis.sendMessage(m.chat, buttonMessage, { quoted: m });
      user.pc = new Date * 1
  }
}

function ucapan() {
    const time = moment.tz("Asia/Jakarta").format("HH");
    res = "Selamat dinihari";
    if (time >= 4) {
      res = "Selamat pagi";
    }
    if (time > 10) {
      res = "Selamat siang";
    }
    if (time >= 15) {
      res = "Selamat sore";
    }
    if (time >= 18) {
      res = "Selamat malam";
    }
    return res;
  }