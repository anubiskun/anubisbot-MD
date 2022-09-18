module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    let a = await m.reply('Bot sedang di restart tunggu beberapa saat ngab!')
    if (a.status = 1) process.send('reset')
}

anuplug.help = ['restart']
anuplug.tags = ['owner']
anuplug.command = /^(restart)$/i
anuplug.isAnubis = true
