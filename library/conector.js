/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 *
 *
 *
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

let fs = require("fs");
const util = require("util");
const moment = require("moment-timezone");
const opts = new Object(
  require("yargs/yargs")(process.argv.slice(2)).exitProcess(false).parse()
);
const {
  getBuffer,
  fetchJson,
  getSizeMedia,
  getGroupAdmins,
  anubisFunc,
  ucapan,
  isNum,
} = require("./lib");

module.exports = {
  async anuConector(chatUpdate, conn, m, store) {
    const anubis = anubisFunc(conn, store);
    const { isLatest, version, changeLogs } = await anubis.anuUpdate();
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
      // const _prefx = /^[/.!#]/gi
      const prefix = _prefx.test(body) ? body.match(_prefx)[0] : "";
      const command = body
        .replace(prefix, "")
        .trim()
        .split(/ +/)
        .shift()
        .toLowerCase();
      const args = body.trim().split(/ +/).slice(1);
      const text = args.join(" ");
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
        if (typeof anubis.db.data.users !== "object") anubis.db.data.users = {};
        if (typeof anubis.db.data.users[m.sender] !== "object")
          anubis.db.data.users[m.sender] = {};
        let user = anubis.db.data.users[m.sender];
        if (!("name" in user)) user.name = anubis.getName(m.sender);
        if (user.name !== anubis.getName(m.sender))
          user.name = anubis.getName(m.sender); // update name
        if (!("isBanned" in user)) user.isBanned = false;
        if (!("isPremium" in user)) user.isPremium = false;
        if (!isNum(user.premTime)) user.premTime = -1;
        if (!isNum(user.limit)) user.limit = 50;
        if (!("isMute" in user)) user.isMute = false;
        if (!isNum(user.pc)) user.pc = -1;
        if (!isNum(user.cCorect)) user.cCorect = -1;
        if (!isNum(user.cUpdate)) user.cUpdate = -1;
        if (!isNum(user.warn)) user.warn = 0;

        let database = anubis.db.data.database;
        if (typeof database.note !== "object") database.note = {};
        if (!("lastRestart" in database)) database.lastRestart = false;
        if (!("banUrl" in database)) database.banUrl = ["chat.whatsapp.com"];

        if (m.isGroup) {
          if (typeof database.note[m.chat] !== "object")
            database.note[m.chat] = {};
          if (typeof anubis.db.data.chats[m.chat] !== "object")
            anubis.db.data.chats[m.chat] = {};
          let chats = anubis.db.data.chats[m.chat];
          const gcmeta = await anubis.groupMetadata(m.chat);
          if (!("name" in chats)) chats.name = gcmeta.subject;
          if (chats.name !== gcmeta.subject) chats.name = gcmeta.subject; // update gc name
          if (!("ismute" in chats)) chats.ismute = false;
          if (!("isBanned" in chats)) chats.isBanned = false;
          if (!("antiviewonce" in chats)) chats.antiviewonce = false;
          if (!("antibadword" in chats)) chats.antibadword = false;
          if (!("antilink" in chats)) chats.antilink = false;
          if (!("welcomer" in chats)) chats.welcomer = false;
          if (!("banUrl" in chats)) chats.banUrl = [];
        }

        if (typeof anubis.db.data.settings[botNumber] !== "object")
          anubis.db.data.settings[botNumber] = {};
        let setting = anubis.db.data.settings[botNumber];
        if (!("anticall" in setting)) setting.anticall = true;
        if (!("antilink" in setting)) setting.antilink = false;
        if (!("antibadword" in setting)) setting.antibadword = false;
        if (!("automess" in setting)) setting.automess = true;
        if (!("restrict" in setting)) setting.restrict = false;
        if (!("igCookie" in setting)) setting.igCookie = global.anuCookie.ig;
        if (!("cPlayerId" in setting)) setting.cPlayerId = "#999";
        if (typeof setting.thumbnail !== "object") setting.thumbnail = {};
        if (!("buffer" in setting.thumbnail))
          setting.thumbnail.buffer = anubis.decodeBuffer(global.thumb);
        if (!("thumb" in setting.thumbnail)) setting.thumbnail.thumb = false;
        if (!("type" in setting.thumbnail)) setting.thumbnail.type = "image";

        let others = anubis.db.data.others;
        if (typeof others.vote !== "object") others.vote = [];
      } catch (err) {
        m.err(err, "setup database");
      }
      global.anuCookie.ig = anubis.db.data.settings[botNumber].igCookie;
      if (m.message) {
        anubis.readMessages([m.key]);
        console.log(
          `[ PESAN ] -> ${m.sender} \n${moment
            .tz("Asia/Jakarta")
            .format("HH:mm:ss")} > ${pushname} => ` + body
        );
      }
      if (00 >= moment.tz("Asia/Jakarta").format("HH")) {
        // reset limit after 00:00 UTC + 07:00 Jakarta
        if (00 <= moment.tz("Asia/Jakarta").format("mm")) {
          let limit = Object.entries(anubis.db.data.users).map(
            ([key, value]) => {
              return { ...value, jid: key };
            }
          );
          limit.map((v) => {
            if (v.limit < 10) {
              anubis.db.data.users[v.jid].limit = 10;
            }
          });
        }
      }

      const isMedia = /image|video|sticker|audio/.test(mime);
      const isAnubis = `6289653909054${anubis.anubiskun}`.includes(m.sender);
      const itsMe = m.sender == botNumber ? true : false;
      const isCmd = body.startsWith(prefix);
      const groupMetadata = m.isGroup
        ? await anubis.groupMetadata(m.chat).catch((e) => {
            m.err(e);
          })
        : "";
      const groupName = m.isGroup ? groupMetadata.subject : "";
      const participants = m.isGroup ? groupMetadata.participants : "";
      const groupAdmins = m.isGroup ? getGroupAdmins(participants) : "";
      const isBotAdmin = m.isGroup ? groupAdmins.includes(botNumber) : false;
      const isOwner = m.isGroup
        ? groupMetadata.owner.includes(m.sender)
        : false;
      const isAdmin = m.isGroup ? groupAdmins.includes(m.sender) : false;
      m.isAdmin = isAdmin;
      m.isOwner = isOwner;
      m.isPremium = anubis.db.data.users[m.sender].isPremium;
      m.limit = m.isPremium ? 1 : anubis.db.data.users[m.sender].limit;
      global.ownerNum.forEach((Owner) => {
        if (new Date() - anubis.db.data.users[m.sender].cUpdate < 3600000)
          return; // count 1 hour
        if (isLatest)
          anubis.sendMessage(Owner + anubis.anubiskun, {
            text: `New Update [ *anubisbot-MD* *v${version}* ]\n\n${changeLogs[0]}`,
          });
        anubis.db.data.users[m.sender].cUpdate = new Date() * 1;
      });

      for (let name in global.plugins) {
        let plugin = global.plugins[name];
        if (!plugin) continue;
        if (plugin.disabled) continue;
        if (!plugin.all) continue;
        if (typeof plugin.all !== "function") continue;
        try {
          await plugin.all.call(
            this,
            m,
            anubis,
            {
              conn,
              store,
              text,
              command,
              args,
              prefix,
              pushname,
              opts,
            },
            chatUpdate
          );
        } catch (err) {
          if (typeof err === "string") continue;
          console.log(err);
        }
      }

      if (!global.botpublic) {
        if (!isAnubis) return;
      }
      if (m.isBaileys) return;
      if (m.chat.endsWith("broadcast")) return;

      // user
      if (anubis.db.data.users[m.sender].isMute) return;
      if (anubis.db.data.users[m.sender].isBanned) return;
      // group
      if (m.isGroup) {
        if (anubis.db.data.chats[m.chat].ismute) return;
      }

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
            await plugin.before.call(this, m, anubis, {
              conn,
              store,
              text,
              command,
              args,
              prefix,
              pushname,
              ucapan,
              botNumber,
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
          if (plugin.isPremium && !isAnubis) {
            // for use limit ,Recommended!, separate commands in each file
            anubis.db.data.users[m.sender].limit =
              m.limit === 0 ? m.limit : m.limit - 1;
            if (m.limit < 1) {
              anubis.sendContact(m.chat, global.ownerNum, m);
              fail("isPremium", m, anubis);
              continue;
            }
          }
          if (plugin.premium && !isAnubis) {
            // premium only
            fail("Premium", m, anubis);
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
            body,
            mime,
            qmsg,
            chatUpdate,
            fetchJson,
            getSizeMedia,
            getBuffer,
            pushname,
            botNumber,
            groupName,
            groupMetadata,
            participants,
            isOwner,
            isAdmin,
            isBotAdmin,
            isMedia,
            isAnubis,
            itsMe,
            isCmd,
          };
          try {
            anubis.sendPresenceUpdate("composing", m.chat);
            await plugin.call(this, m, anubis, extra);
          } catch (err) {
            m.error = err;
            m.err(err);
          } finally {
            if (typeof plugin.after === "function") {
              try {
                await plugin.after.call(this, m, anubis, extra);
              } catch (err) {
                m.err(err);
                console.log(err);
              }
            }
          }
          break;
        }
      }
    } catch (err) {
      m.err(err, "core error");
      m.error = err;
      console.log(err);
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
  contactUpdate(contactUpdate, anubis, store) {
    for (let contact of contactUpdate) {
      let id = anubis.decodeJid(contact.id);
      if (store && store.contacts)
        store.contacts[id] = { id, name: contact.notify };
    }
  },
  async callUpdate(callUpdate, anubis) {
    let botNum = await anubis.decodeJid(anubis.user.id);
    let anu = anubis.db.data.settings[botNum]
      ? anubis.db.data.settings[botNum].anticall
      : false;
    if (!anu) return;
    for (let secure of callUpdate) {
      if (secure.from.startsWith("6289653909054")) return;
      if (secure.isGroup == false) {
        if (secure.status == "offer") {
          let hajar = await anubis.sendMessage(secure.from, {
            text: `*${anubis.user.name}* tidak bisa menerima panggilan ${
              secure.isVideo ? `video` : `suara`
            }. Maaf @${
              secure.from.split("@")[0]
            } kamu akan di blockir. Jika tidak sengaja silahkan hubungi Owner untuk dibuka!`,
          });
          anubis.sendMessage("6289653909054" + anubis.anubiskun, {
            text: `wa.me/${secure.from.replace(
              anubis.anubiskun,
              ""
            )} baru saja di blockir!`,
          });
          let a = await anubis.sendContact(secure.from, ownerNum, hajar);
          if (a.status)
            return await anubis.updateBlockStatus(secure.from, "block");
        }
      }
    }
  },
  async gcParticipantUpdate(gcUpdate, anubis) {
    try {
      let metadata = await anubis.groupMetadata(gcUpdate.id);
      let participants = gcUpdate.participants;
      let pUser, pGroup;
      for (let num of participants) {
        try {
          pUser = await anubis.profilePictureUrl(num, "image");
        } catch (e) {
          pUser = "https://tinyurl.com/yx93l6dan";
        }
        try {
          pGroup = await anubis.profilePictureUrl(gcUpdate.id, "image");
        } catch (e) {
          pGroup = "https://tinyurl.com/yx93l6dan";
        }

        if (gcUpdate.action == "add") {
          anubis.sendMessage(gcUpdate.id, {
            image: { url: pUser },
            mentions: [num],
            caption: `Welcome To ${metadata.subject} @${num.split("@")[0]}`,
          });
        } else if (gcUpdate.action == "remove") {
          anubis.sendMessage(gcUpdate.id, {
            image: { url: pUser },
            mentions: [num],
            caption: `@${num.split("@")[0]} Leaving To ${metadata.subject}`,
          });
        } else if (gcUpdate.action == "promote") {
          anubis.sendMessage(gcUpdate.id, {
            image: { url: pUser },
            mentions: [num],
            caption: `@${num.split("@")[0]} Promote From ${metadata.subject}`,
          });
        } else if (gcUpdate.action == "demote") {
          anubis.sendMessage(gcUpdate.id, {
            image: { url: pUser },
            mentions: [num],
            caption: `@${num.split("@")[0]} Demote From ${metadata.subject}`,
          });
        }
      }
    } catch (err) {
      console.err(err);
    }
  },
  async gcUpdate(gcUp, anubis) {
    try {
      for (let noir of gcUp) {
        let pGroup;
        try {
          pGroup = await anubis.profilePictureUrl(noir.id, "image");
        } catch (e) {
          pGroup = "https://tinyurl.com/yx93l6dan";
        }

        if (noir.announce == true) {
          anubis.sendMessage(gcUpdate.id, {
            image: { url: pGroup },
            caption: `「 Group Settings Change 」\n\nGroup telah ditutup oleh admin, Sekarang hanya admin yang dapat mengirim pesan !`,
          });
        } else if (noir.announce == false) {
          anubis.sendMessage(gcUpdate.id, {
            image: { url: pGroup },
            caption: `「 Group Settings Change 」\n\nGroup telah dibuka oleh admin, Sekarang peserta dapat mengirim pesan !`,
          });
        } else if (noir.restrict == true) {
          anubis.sendMessage(gcUpdate.id, {
            image: { url: pGroup },
            caption: `「 Group Settings Change 」\n\nInfo group telah dibatasi, Sekarang hanya admin yang dapat mengedit info group !`,
          });
        } else if (noir.restrict == false) {
          anubis.sendMessage(gcUpdate.id, {
            image: { url: pGroup },
            caption: `「 Group Settings Change 」\n\nInfo group telah dibuka, Sekarang peserta dapat mengedit info group !`,
          });
        } else {
          anubis.sendMessage(gcUpdate.id, {
            image: { url: pGroup },
            caption: `「 Group Settings Change 」\n\nGroup Subject telah diganti menjadi *${noir.subject}*`,
          });
        }
      }
    } catch (err) {
      console.err(err);
    }
  },
};

global.dfail = (type, m, anubis) => {
  let msg = {
    isAnubis: "Cuma buat Owner Anubis ngab! lu siapa???!!",
    isPremium: "Limit habis!,\nBeli limit kelipatan 200/10k! ke owner",
    Premium: "Cuma buat member premium ngab!, yo beli title Premium ke owner",
    group: "Cuma bisa di Group ngab ga bisa di sini",
    private: "Cuma bisa di Private Chat ngab ga bisa di sini!",
    admin: "Cuma buat admin ngab! lu siapa???!!",
    botAdmin: "Perintah di luar nalar!\njadiin admin dulu ngab! ",
  }[type];
  if (msg) return m.reply(msg);
};
