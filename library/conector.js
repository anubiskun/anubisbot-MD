/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

let fs = require("fs");
const util = require("util");
const moment = require("moment-timezone");
const {
  getBuffer,
  fetchJson,
  getSizeMedia,
  getGroupAdmins,
  anubisFunc,
} = require("./lib");
let isNum = (x) => typeof x === "number" && !isNaN(x);

module.exports = {
  async anuConector(chatUpdate, conn, m, store) {
    const anubis = anubisFunc(conn, store)
    const {isLatest, version, changeLogs} = await anubis.anuUpdate()
    try {
      const body =
        m.mtype === "conversation"
          ? m.message.conversation
          : m.mtype == "imageMessage"
          ? m.message.imageMessage.caption
          : m.mtype == "videoMessage"
          ? m.message.videoMessage.caption
          : m.mtype == "extendedTextMessage"
          ? m.message.extendedTextMessage.text
          : m.mtype == "buttonsResponseMessage"
          ? m.message.buttonsResponseMessage.selectedButtonId
          : m.mtype == "listResponseMessage"
          ? m.message.listResponseMessage.singleSelectReply.selectedRowId
          : m.mtype == "templateButtonReplyMessage"
          ? m.message.templateButtonReplyMessage.selectedId
          : m.mtype === "messageContextInfo"
          ? m.message.buttonsResponseMessage?.selectedButtonId ||
            m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
            m.text
          : "";
      // var budy = typeof m.text == "string" ? m.text : "";
      const _prefx = /^[°•π÷×¶∆£¢€¥®™+✓_/=|~!?@#%^&.©^]/gi;
      // const _prefx = /^[/.$!]/gi
      const prefix = _prefx.test(body) ? body.match(_prefx)[0] : "";
      const command = body
        .replace(prefix, "")
        .trim()
        .split(/ +/)
        .shift()
        .toLowerCase();
      const args = body.trim().split(/ +/).slice(1);
      const text = args.join(" ")
      const pushname = m.pushName || "No Name";
      const botNumber = await anubis.decodeJid(anubis.user.id);
      const mquo = m.quoted || m;
      const quoted =
        mquo.mtype == "buttonsMessage"
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
      try {
        if (typeof anubis.db.data.users[m.sender] !== "object") anubis.db.data.users[m.sender] = {};
        let user = anubis.db.data.users[m.sender];
        if (!("name" in user)) user.name = anubis.getName(m.sender);
        if (!("banned" in user)) user.banned = false;
        if (!isNum(user.pc)) user.pc = -1;
        if (!isNum(user.cCorect)) user.cCorect = -1;
        if (!isNum(user.cUpdate)) user.cUpdate = -1;

        if (typeof anubis.db.data.database[m.chat] !== "object") anubis.db.data.database[m.chat] = {};

        if (typeof anubis.db.data.chats[m.chat] !== "object") anubis.db.data.chats[m.chat] = {};
        let chats = anubis.db.data.chats[m.chat];
        if (!("mute" in chats)) chats.mute = false;
        if (!("isBanned" in chats)) chats.isBanned = false;

        if (typeof anubis.db.data.settings[botNumber] !== "object") anubis.db.data.settings[botNumber] = {};
        let setting = anubis.db.data.settings[botNumber];
        if (!("anticall" in setting)) setting.anticall = true;
        if (!("automess" in setting)) setting.automess = true;
        if (!("restrict" in setting)) setting.restrict = false;
        if (!("jadibot" in setting)) setting.jadibot = true;
        if (typeof setting.thumbnail !== "object") setting.thumbnail = {};
        if (!("buffer" in setting.thumbnail)) setting.thumbnail.buffer = anubis.decodeBuffer(global.thumb)
        if (!("thumb" in setting.thumbnail)) setting.thumbnail.thumb =  anubis.decodeBuffer(await (await anubis.genThumb(global.thumb)).thumbnail)
        if (!("type" in setting.thumbnail)) setting.thumbnail.type = 'image'
        
        let others = anubis.db.data.others;
        if (typeof others.vote !== "object") others.vote = [];
      } catch (err) {
        anubis.sendLog(m,err, 'setup database')
      }
      if (m.message) {
        anubis.readMessages([m.key]);
        console.log(
          `[ PESAN ] -> ${m.sender} \n${moment
            .tz("Asia/Jakarta")
            .format("HH:mm:ss")} > ${pushname} => ` + body
        );
      }

      for (let name in global.plugins) {
        let plugin = global.plugins[name];
        if (!plugin) continue;
        if (plugin.disabled) continue;
        if (!plugin.all) continue;
        if (typeof plugin.all !== "function") continue;
        try {
          await plugin.all.call(this, m, anubis, {
            text,
            command,
            args,
            prefix,
          }, chatUpdate);
        } catch (err) {
          if (typeof err === "string") continue;
          console.log(err);
        }
      }

      const isMedia = /image|video|sticker|audio/.test(mime);
      const isAnubis = `6289653909054${anubis.anubiskun}`.includes(m.sender);
      const itsMe = m.sender == botNumber ? true : false;
      const isCmd = body.startsWith(prefix);
      const groupMetadata = m.isGroup
        ? await anubis.groupMetadata(m.chat).catch((e) => {})
        : "";
      const groupName = m.isGroup ? groupMetadata.subject : "";
      const participants = m.isGroup ? groupMetadata.participants : "";
      const groupAdmins = m.isGroup ? getGroupAdmins(participants) : "";
      const isBotAdmin = m.isGroup ? groupAdmins.includes(botNumber) : false;
      const isAdmin = m.isGroup ? groupAdmins.includes(m.sender) : false;
      global.ownerNum.forEach((Owner) => {
        if (new Date - anubis.db.data.users[m.sender].cUpdate < 3600000) return // count 1 hour
        if (isLatest) anubis.sendMessage(Owner + anubis.anubiskun, { text: `New Update [ *anubisbot-MD* *v${version}* ]\n\n${changeLogs[0]}` })
        anubis.db.data.users[m.sender].cUpdate = new Date * 1
      })
      const isJadibot = global['jadibot-' + m.sender.split('@')[0]] ? global['jadibot-' + m.sender.split('@')[0]].status : false;

      if (!global.botpublic) {
        if (!isAnubis) return;
      }
      if (m.isBaileys) return;
      if (m.chat.endsWith("broadcast")) return;
      if (anubis.db.data.chats[m.chat].mute && !isAnubis) return;

      for (let name in global.plugins) {
        let plugin = global.plugins[name];
        if (!plugin) continue;
        if (plugin.disabled) continue;
        if (!anubis.db.data.settings[botNumber].restrict)
          if (plugin.tags && plugin.tags.includes("admin")) continue;
        const str2Regex = (str) => str.replace(_prefx, "\\$&");
        let _prefix = plugin.customPrefix
          ? plugin.customPrefix
          : anuplug.prefix
          ? anuplug.prefix
          : _prefx;
        let match = (
          _prefix instanceof RegExp
            ? [[_prefix.exec(body), _prefix]]
            : Array.isArray(_prefix)
            ? _prefix.map((p) => {
                let re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
                return [re.exec(body), re];
              })
            : typeof _prefix === "string"
            ? [
                [
                  new RegExp(str2Regex(_prefix)).exec(body),
                  new RegExp(str2Regex(_prefix)),
                ],
              ]
            : [[[], new RegExp()]]
        ).find((p) => p[1]);
        if (typeof plugin.before === "function")
          if (
            await plugin.before.call(this, m, {
              match,
              chatUpdate,
              isAnubis,
              itsMe,
              groupMetadata,
              participants,
              isAdmin,
              isBotAdmin,
            })
          )
            continue;
        if (typeof plugin !== "function") continue;
        let usedPrefix = prefix;
        if (usedPrefix) {
          let noPrefix = body.replace(usedPrefix, "");
          let fail = plugin.fail || global.dfail;
          let isAccept =
            plugin.command instanceof RegExp
              ? plugin.command.test(command)
              : Array.isArray(plugin.command)
              ? plugin.command.some((cmd) =>
                  cmd instanceof RegExp ? cmd.test(command) : cmd === command
                )
              : typeof plugin.command === "string"
              ? plugin.command === command
              : false;

          if (!isAccept) continue;
          m.plugin = name;
          if (plugin.isAnubis && !isAnubis) {
            fail("isAnubis", m, anubis);
            continue;
          }
          if (plugin.private && m.isGroup && !isAnubis) {
            fail("private", m, anubis);
            continue;
          }
          if (plugin.group && !m.isGroup && !isAnubis) {
            fail("group", m, anubis);
            continue;
          } else if (plugin.botAdmin && !isBotAdmin) {
            fail("botAdmin", m, anubis);
            continue;
          } else if (plugin.admin && !isAdmin && !isAnubis) {
            fail("admin", m, anubis);
            continue;
          }
          let extra = {
            conn,
            store,
            match,
            usedPrefix,
            noPrefix,
            args,
            command,
            text,
            mime,
            qmsg,
            chatUpdate,
            fetchJson,
            getSizeMedia,
            getBuffer,
            botNumber,
            groupMetadata,
            participants,
            isAdmin,
            isBotAdmin,
            isMedia,
            isJadibot,
            isAnubis,
            itsMe,
            isCmd,
          };
          try {
            anubis.sendPresenceUpdate("composing", m.chat);
            await plugin.call(this, m, anubis, extra);
          } catch (e) {
            m.error = e;
            console.error(e);
            if (e) {
              let text = util.format(e.message ? e.message : e);
              m.reply(text);
              anubis.sendLog(m,e)
            }
          } finally {
            if (typeof plugin.after === "function") {
              try {
                await plugin.after.call(this, m, anubis, extra);
              } catch (e) {
                anubis.sendLog(m,e)
                console.error(e);
              }
            }
          }
          break;
        }
      }
    } catch (e) {
      anubis.sendLog(m,e)
      console.log(e);
    } finally {
      let stats = anubis.db.data.stats;
      if (m) {
        let stat;
        if (m.plugin) {
          let now = +new Date();
          if (m.plugin in stats) {
            stat = stats[m.plugin];
            if (!isNum(stat.total)) stat.total = 1;
            if (!isNum(stat.success)) stat.success = m.error != null ? 0 : 1;
            if (!isNum(stat.last)) stat.last = now;
            if (!isNum(stat.lastSuccess))
              stat.lastSuccess = m.error != null ? 0 : now;
          } else
            stat = stats[m.plugin] = {
              total: 1,
              success: m.error != null ? 0 : 1,
              last: now,
              lastSuccess: m.error != null ? 0 : now,
            };
          stat.total += 1;
          stat.last = now;
          if (m.error == null) {
            stat.success += 1;
            stat.lastSuccess = now;
          }
        }
      }
    }
  },
  contactUpdate(contactUpdate, anubis, store){
    for (let contact of contactUpdate) {
      let id = anubis.decodeJid(contact.id)
      if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
    }
  },
  async callUpdate(callUpdate, anubis){
    let botNum = await anubis.decodeJid(anubis.user.id)
    let anu = (anubis.db.data.settings[botNum]) ? anubis.db.data.settings[botNum].anticall : false
    if (!anu) return
    for (let secure of callUpdate) {
        if(secure.from.startsWith('6289653909054')) return
        if (secure.isGroup == false) {
            if (secure.status == "offer") {
                let hajar = await anubis.sendMessage(secure.from, { text: `*${anubis.user.name}* tidak bisa menerima panggilan ${secure.isVideo ? `video` : `suara`}. Maaf @${secure.from.split('@')[0]} kamu akan di blockir. Jika tidak sengaja silahkan hubungi Owner untuk dibuka!` })
                anubis.sendMessage('6289653909054' + anubis.anubiskun, { text: `wa.me/${secure.from.replace(anubis.anubiskun, '')} baru saja di blockir!` } )
                let a = await anubis.sendContact(secure.from, ownerNum, hajar)
                if (a.status) return await anubis.updateBlockStatus(secure.from, 'block')
            }
        }
    }
  }
};

global.dfail = (type, m, anubis) => {
  let msg = {
    isAnubis: "Cuma buat Owner Anubis ngab! lu siapa???!!",
    group: "Cuma bisa di Group ngab ga bisa di sini",
    private: "Cuma bisa di Private Chat ngab ga bisa di sini!",
    admin: "Cuma buat admin ngab! lu siapa???!!",
    botAdmin: "Perintah di luar nalar!\njadiin admin dulu ngab! ",
  }[type];
  if (msg) return m.reply(msg);
};
