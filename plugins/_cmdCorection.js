/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 *
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

module.exports = anuplug = {
  async before(m, anubis, { text, command, args, prefix, pushname, ucapan }) {
    try {
      let user = anubis.db.data.users[m.sender];
      let msgs = anubis.db.data.database.note[m.chat];
      let buttons = [
        {
          buttonId: `/owner`,
          buttonText: { displayText: "Contact Owner" },
          type: 1,
        },
        {
          buttonId: `/changelogs`,
          buttonText: { displayText: "Change Logs" },
          type: 1,
        },
        { buttonId: `/menu`, buttonText: { displayText: "Menu" }, type: 1 },
      ];

      function similar(teks, tekss) {
        let equivalency = 0;
        let minLength = teks.length > tekss.length ? tekss.length : teks.length;
        let maxLength = teks.length < tekss.length ? tekss.length : teks.length;
        let hasil;
        for (let i = 0; i < minLength; i++) {
          if (teks[i] == tekss[i]) {
            equivalency++;
          }
          let weight = equivalency / maxLength;
          let rate = weight * 100;
          if (rate > 39) hasil = { rate, text: tekss };
        }
        return typeof hasil !== "undefined" ? hasil : null;
      }

      function initialize(teks, arr) {
        let cmd = [];
        for (let i = 0; i < arr.length; i++) {
          let d = arr[i].test(teks);
          if (d) cmd.push(d);
        }
        return cmd[0];
      }

      let helps = [];
      let cmds = [];
      for (
        let i = 0;
        i <
        Object.values(global.plugins).filter((plugin) => !plugin.disabled)
          .length;
        i++
      ) {
        if (
          Object.values(global.plugins).filter((plugin) => !plugin.disabled)[i]
            .help !== undefined
        ) {
          for (
            let j = 0;
            j <
            Object.values(global.plugins).filter((plugin) => !plugin.disabled)[
              i
            ].help.length;
            j++
          ) {
            helps.push(
              Object.values(global.plugins).filter(
                (plugin) => !plugin.disabled
              )[i].help[j]
            );
          }
          cmds.push(
            Object.values(global.plugins).filter((plugin) => !plugin.disabled)[
              i
            ].command
          );
        }
      }
      let isCmd = initialize(command, cmds);
      let pada = [];
      for (let help of helps) {
        let a = similar(command, help);
        if (a !== null) pada.push(a);
      }
      if (!prefix) {
        if (m.isGroup && m.text.toLowerCase() in msgs) {
          // to get notes in group without command get
          if (msgs[m.text.toLowerCase()].lock) return;
          return await anubis.copyNForward(
            m.chat,
            msgs[m.text.toLowerCase()].pesan,
            true
          );
        }
        if (m.mtype === "conversation") {
          if (m.chat.endsWith("broadcast") || m.fromMe || m.isGroup) return;
          if (new Date() - user.cCorect < 300 * 1000) return; // 5 minutes ago
          anubis.sendButtonMsg(
            m.chat,
            `Hanya bisa menerima command ngab!\nKalo mau chat, complain, ngeluh tentang botnya dll\nKirim pesan ke admin ngab!\nDisini ga bakal di jawab\nKalo di jawab pun anda termasuk orang yang beruntung :v`.trim(),
            buttons,
            m
          );
          user.cCorect = new Date() * 1;
          return;
        }
      } else {
        if (isCmd) return;
        if (pada.length === 0) {
          anubis.sendButtonMsg(
            m.chat,
            `Command *${prefix + command
            }* tidak ditemukan ngab!\nCoba cek menu list`,
            buttons,
            m
          );
        } else if (pada.length === 1) {
          if (pada[0].rate === 100) return;
          let sections = [
            {
              title: "Mungkin maksud command anda",
              rows: [
                {
                  title: pada[0].text,
                  description: ``,
                  rowId: `${prefix + pada[0].text} ${text}`,
                },
              ],
            },
          ];
          return anubis.sendList(
            m.chat,
            "Command Correction",
            "Command tidak ditemukan\nMungkin maksud anda : ",
            "Result",
            sections,
            m
          );
        } else if (pada.length > 1) {
          let rows = [];
          for (let i = 0; i < pada.length; i++) {
            if (pada[i].rate === 100) return;
            rows.push({
              title: pada[i].text,
              description: ``,
              rowId: `${prefix + pada[i].text} ${text}`,
            });
          }
          let sections = [{ title: "Mungkin maksud command anda", rows: rows }];
          return anubis.sendList(
            m.chat,
            "Command Correction",
            "Command tidak ditemukan\nMungkin maksud anda : ",
            "Result",
            sections,
            m
          );
        } else {
          return anubis.sendMessage(
            m.chat,
            { text: "gila lu ngab!" },
            { quoted: m }
          );
        }
      }
    } catch (err) {
      console.err(err);
    }
  },
};
