module.exports = anuplug = {
    async all(m, anubis, { text, command, args, prefix }) {
        try {
            function similar(a,b) {
                let equivalency = 0
                let minLength = (a.length > b.length) ? b.length : a.length
                let maxLength = (a.length < b.length) ? b.length : a.length
                let hasil
                for(let i = 0; i < minLength; i++) {
                    if(a[i] == b[i]) {
                        equivalency++
                    }
                    let weight = equivalency / maxLength
                    let rate = (weight * 100)
                    if (rate > 39) hasil = {rate, text: b}
                }
                return (typeof hasil !== 'undefined') ? hasil : null
            }

            function initialize(a,b) {
                let cmd = []
                for (let i = 0; i < b.length; i++) {
                    let d = b[i].test(a)
                    if (d) cmd.push(d)
                }
                return cmd[0]
            }

            let helps = []
            let cmds = []
            for (let i = 0; i < Object.values(global.plugins).filter(plugin => !plugin.disabled).length; i++) {
                if (Object.values(global.plugins).filter(plugin => !plugin.disabled)[i].help !== undefined) {
                    for (let j = 0; j < Object.values(global.plugins).filter(plugin => !plugin.disabled)[i].help.length; j++) {
                        helps.push(Object.values(global.plugins).filter(plugin => !plugin.disabled)[i].help[j])
                    }
                    cmds.push(Object.values(global.plugins).filter(plugin => !plugin.disabled)[i].command)
                }
            }
            let isCmd = initialize(command, cmds)
            let pada = []
            for (let help of helps) {
                let a = similar(command, help, cmds)
                if (a !== null) pada.push(a)
            }
            if (!prefix) {
                let user = anubis.db.data.users[m.sender]
                if (m.mtype === 'conversation') {
                    if (m.chat.endsWith('broadcast') || m.fromMe || m.isGroup) return
                    if (new Date - user.cCorect < 900000) return // count 15 minutes
                    let buttons = [
                        { buttonId: `/owner`, buttonText: { displayText: "Contact Owner" }, type: 1 },
                        { buttonId: `/changelogs`, buttonText: { displayText: "Change Logs" }, type: 1 },
                        { buttonId: `/menu`, buttonText: { displayText: "Menu" }, type: 1 },
                    ];
                    anubis.sendButtonMsg(m.chat, `Hanya bisa menerima command ngab!\nKalo mau chat, complain, ngeluh tentang botnya dll\nKirim pesan ke admin ngab!\nDisini ga bakal di jawab\nKalo di jawab pun anda termasuk orang yang beruntung :v`, buttons, m)
                    user.cCorect = new Date * 1
                    return
                }
            } else {
                if (isCmd) return
                if (pada.length === 0) {
                    let buttons = [
                        { buttonId: `/owner`, buttonText: { displayText: "Contact Owner" }, type: 1 },
                        { buttonId: `/changelogs`, buttonText: { displayText: "Change Logs" }, type: 1 },
                        { buttonId: `/menu`, buttonText: { displayText: "Menu" }, type: 1 },
                    ];
                    anubis.sendButtonMsg(m.chat, `Command *${prefix + command}* tidak ditemukan ngab!\nCoba cek menu list`, buttons, m)
                } else if (pada.length === 1) {
                    if (pada[0].rate === 100) return
                    let sections = [
                        {
                        title: 'Mungkin maksud command anda',
                        rows: [{ title: pada[0].text, description: ``, rowId: `${prefix + pada[0].text} ${text}` }]
                        }
                    ]
                    return anubis.sendList(m.chat, 'Command Correction', 'Command tidak ditemukan\nMungkin maksud anda : ', 'Result', sections, m)
                } else if (pada.length > 1) {
                    let rows = []
                    for (let i = 0; i < pada.length; i++) {
                        if (pada[i].rate === 100) return
                        rows.push(
                            { title: pada[i].text, description: ``, rowId: `${prefix + pada[i].text} ${text}` }
                        )
                    }
                    let sections = [
                        {
                        title: 'Mungkin maksud command anda',
                        rows: rows
                        }
                    ]
                    return anubis.sendList(m.chat, 'Command Correction', 'Command tidak ditemukan\nMungkin maksud anda : ', 'Result', sections, m)
                } else {
                    return anubis.sendMessage(m.chat, {text: 'gila lu ngab!'}, {quoted: m})
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
}
