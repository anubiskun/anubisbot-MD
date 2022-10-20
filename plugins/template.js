/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

module.exports = anuplug = async (m, anubis, { text, command, args, usedPrefix }) => {
    console.log(command)
    console.log(text)
    console.log(args)
    console.log(usedPrefix)
    m.reply(command)
}
anuplug.help = ['template']
anuplug.tags = ['template']
anuplug.command = /^(template)$/i
anuplug.isAnubis = true
anuplug.disabled = true
anuplug.group = true
anuplug.botAdmin = true
anuplug.admin = true
anuplug.isPremium = true
