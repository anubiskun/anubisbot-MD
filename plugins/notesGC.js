/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 *
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const { getContentType } = require("@adiwajshing/baileys");

module.exports = anuplug = async (
  m,
  anubis,
  { text, body, command, args, usedPrefix, isAnubis }
) => {
  switch (command) {
    case "get":
      {
        if (!text) return m.reply(`Example: ${usedPrefix + command} note name`);
        let msgs = anubis.db.data.database.note[m.chat];
        if (!(text.toLowerCase() in msgs))
          return m.reply(`lawak bener lu ngab! '${text}' gak ada ngab!`);
        if (msgs[text.toLowerCase()].lock && !isAnubis)
          return m.reply("ga liat itu di lock!");
        anubis.copyNForward(m.chat, msgs[text.toLowerCase()].pesan, true);
      }
      break;
    case "notes":
    case "note":
      {
        let seplit = Object.entries(anubis.db.data.database.note[m.chat])
          .map(([nama, isi]) => {
            return { nama, ...isi };
          })
          .sort(function (a, b) {
            let nama1 = a.nama.toUpperCase();
            let nama2 = b.nama.toUpperCase();
            if (nama1 < nama2) return -1;
            if (nama1 > nama2) return 1;
            return 0;
          });
        let teks = "───〔 NOTE LIST 〕───\n";
        for (let i of seplit) {
          let kunci;
          if (i.lock) {
            kunci = "🔒";
          } else {
            kunci = "";
          }
          teks += `> ${i.nama} (${getContentType(i.pesan.message).replace(
            /Message/i,
            ""
          )}) ${kunci}\n`;
        }
        teks += `───〔 NOTE LIST 〕───\n\nGunakan command ${usedPrefix}get namanotenya\nEx: ${usedPrefix}get test`;
        m.reply(teks);
      }
      break;
  }
};
anuplug.help = ["get", "notes", "note"];
anuplug.tags = ["group"];
anuplug.command = /^(get|notes|note)$/i;
anuplug.group = true;
