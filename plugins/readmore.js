module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    const more = String.fromCharCode(8206)
    const readMore = more.repeat(4001)
    if (!text) return m.reply(`Example: ${usedPrefix + command} depan|belakang\n${usedPrefix + command} tau gasi! su|ka-ku ke kamu tu besar banget\nHasil : tau gasi! su${readMore}ka-ku ke kamu tu besar banget`)
    let [ d, b ] = text.split('|')
    if (!d) d = ''
    if (!b) b = ''
    m.reply(d + readMore + b)
}
anuplug.help = ['readmore']
anuplug.tags = ['tools']
anuplug.command = /^(rm|readmore)$/i
