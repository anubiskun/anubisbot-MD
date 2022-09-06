module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    m.reply('Bot sedang di restart tunggu beberapa saat ngab!')
    process.send('reset')
}

anuplug.help = ['restart']
anuplug.tags = ['owner']
anuplug.command = /^(restart)$/i
anuplug.isAnubis = true
