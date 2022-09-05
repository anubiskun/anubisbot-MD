module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    anubis.sendContact(m.chat, global.owner, m);
}
anuplug.help = ['owner']
anuplug.tags = ['tools']
anuplug.command = /^(owner|admin|sewa)$/i
