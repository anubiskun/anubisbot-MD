let fs = require('fs')
const util = require('util')
const moment = require('moment-timezone')
const {getBuffer, fetchJson, getSizeMedia} = require('./lib')
let isNum = (x) => typeof x === "number" && !isNaN(x)

module.exports = {
    async anuConector(chatUpdate, m, anubis, store) {
      // return console.log(presUpdate)

      const body = m.mtype === "conversation" ? m.message.conversation : m.mtype == "imageMessage" ? m.message.imageMessage.caption : m.mtype == "videoMessage" ? m.message.videoMessage.caption : m.mtype == "extendedTextMessage" ? m.message.extendedTextMessage.text : m.mtype == "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId : m.mtype == "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId : m.mtype == "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId : m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : "";
      const _prefx = /^[°•π÷×¶∆£¢€¥®™+✓_/=|~!?@#%^&.©^]/gi
      // const _prefx = /^[/.$!]/gi
      const prefix = _prefx.test(body) ? body.match(_prefx)[0] : ""
      const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
      const args = body.trim().split(/ +/).slice(1);
      const text = (args.join(" "));

      const pushname = m.pushName || "No Name";
      const botNumber = await anubis.decodeJid(anubis.user.id);
      const mquo = m.quoted || m;
      const quoted = mquo.mtype == "buttonsMessage"
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
      const isMedia = /image|video|sticker|audio/.test(mime);
      
      try {

        try {

            let user = db.data.users[m.sender]
            if (typeof user !== "object") db.data.users[m.sender] = {}
            if (user) {
                if (!('name' in user)) user.name = anubis.getName(m.sender)
                if (!isNum(user.pc)) user.pc = -1
                if (!('banned' in user)) user.banned = false
            } else global.db.data.users[m.sender] = {
                name: anubis.getName(m.sender),
                pc: -1,
                banned: false
            }

            let chats = db.data.chats[m.chat]
            if (typeof chats !== "object") db.data.chats[m.chat] = {}
            if (chats) {
                if (!('mute' in chats)) chats.mute = false
                if (!('isBanned' in chats)) chats.isBanned = false
            } else global.db.data.chats[m.chat] = {
                mute: false,
                isBanned: false,
            }

            let setting = db.data.settings[botNumber]
            if (typeof setting !== "object") db.data.settings[botNumber] = {}
            if (setting) {
                if (!('anticall' in setting)) setting.anticall = true
                if (!('automess' in setting)) setting.automess = true
                if (!('restrict' in setting)) setting.restrict = false
            } else global.db.data.settings[botNumber] = {
                anticall: true,
                automess: true,
                restrict: false
            }
        } catch (err) {
            console.log(err)
        }

        if (m.message) {
          anubis.readMessages([m.key])
          console.log(`[ PESAN ] -> ${m.sender} \n${moment.tz("Asia/Jakarta").format("HH:mm:ss")} > ${pushname} => `+ body)
        }

        // console.log(global.plugins)
        for (let name in global.plugins) {
          let plugin = global.plugins[name]
          if (!plugin) continue
          if (plugin.disabled) continue
          if (!plugin.all) continue
          if (typeof plugin.all !== 'function') continue
          try {
            await plugin.all.call(this, m, chatUpdate)
          } catch (e) {
            if (typeof e === 'string') continue
            console.log(e)
          }
        }
        
        const isAnubis = "6289653909054@s.whatsapp.net".includes(m.sender);
        const itsMe = m.sender == botNumber ? true : false;
        const isCmd = body.startsWith(prefix);

        if (!global.botpublic) {
          if (!isAnubis) return
        }
        if (m.isBaileys) return
        if (m.chat.endsWith('broadcast')) return
        if (db.data.chats[m.chat].mute && !isAnubis) return

        for (let name in global.plugins) {
          let plugin = global.plugins[name]
          if (!plugin) continue
          if (plugin.disabled) continue
          if (!global.db.data.settings[botNumber].restrict) if (plugin.tags && plugin.tags.includes('admin')) continue
          const str2Regex = str => str.replace(_prefx, '\\$&')
          let _prefix = plugin.customPrefix ? plugin.customPrefix : anuplug.prefix ? anuplug.prefix : _prefx
          let match = (_prefix instanceof RegExp ?
          [[_prefix.exec(body), _prefix]] :
          Array.isArray(_prefix) ?
          _prefix.map(p => {
            let re = p instanceof RegExp ?
            p :
            new RegExp(str2Regex(p))
            return [re.exec(body), re]
          }) :
          typeof _prefix === 'string' ?
          [[new RegExp(str2Regex(_prefix)).exec(body), new RegExp(str2Regex(_prefix))]] :
          [[[], new RegExp]]
          ).find(p => p[1])
          if (typeof plugin.before === 'function') if (await plugin.before.call(this, m, {
            match,
            anubis: this,
            isAnubis,
            itsMe,
            chatUpdate,
          })) continue
          if (typeof plugin !== 'function') continue
          let usedPrefix = prefix
          if (usedPrefix) {
            let noPrefix = body.replace(usedPrefix, '')
            let fail = plugin.fail || global.dfail
            let isAccept = plugin.command instanceof RegExp ?
              plugin.command.test(command) :
              Array.isArray(plugin.command) ?
                plugin.command.some(cmd => cmd instanceof RegExp ?
                  cmd.test(command) :
                  cmd === command
                ) :
                typeof plugin.command === 'string' ?
                  plugin.command === command :
                  false

            if (!isAccept) continue
            m.plugin = name
            if (plugin.isAnubis && !isAnubis) {
              fail('isAnubis', m, this)
              continue
            }
            if (plugin.private && m.isGroup) {
              fail('private', m, this)
              continue
            }
            let extra = {
              match,
              usedPrefix,
              noPrefix,
              args,
              command,
              text,
              anubis,
              isAnubis,
              itsMe,
              chatUpdate,
              fetchJson,
              getSizeMedia,
              getBuffer,
              botNumber,
            }
            try {
              anubis.sendPresenceUpdate('composing', m.chat)
              await plugin.call(this, m, extra)
            } catch (e) {
              m.error = e
              console.error(e)
              let text = util.format(e.message ? e.message : e)
              m.reply(text)
            } finally {
              if (typeof plugin.after === 'function') {
                try {
                  await plugin.after.call(this, m, extra)
                } catch (e) {
                  console.error(e)
                }
              }
            }
            break
          }
        }

      }catch(e){
        console.log(e)
      } finally {
        let stats = global.db.data.stats
        if (m) {
          let stat
          if (m.plugin) {
            let now = + new Date
            if (m.plugin in stats) {
              stat = stats[m.plugin]
              if (!isNum(stat.total)) stat.total = 1
              if (!isNum(stat.success)) stat.success = m.error != null ? 0 : 1
              if (!isNum(stat.last)) stat.last = now
              if (!isNum(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
            } else stat = stats[m.plugin] = {
              total: 1,
              success: m.error != null ? 0 : 1,
              last: now,
              lastSuccess: m.error != null ? 0 : now
            }
            stat.total += 1
            stat.last = now
            if (m.error == null) {
              stat.success += 1
              stat.lastSuccess = now
            }
          }
        }
      }

    }
}

global.dfail = (type, m, conn) => {
  let msg = {
    isAnubis: 'Cuma buat Owner Anubis ngab! lu siapa???!!',
    botAdmin: 'Jadikan bot sebagai *Admin* untuk menggunakan perintah ini!',
  }[type]
  if (msg) return m.reply(msg)
}