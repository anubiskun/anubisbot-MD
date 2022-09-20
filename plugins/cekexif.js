module.exports = anuplug = async(m, { text, command, args, usedPrefix }) => {
    m.reply(`🌀> Packname : ${global.packname}\n🌀> Author : ${global.author}`);
}
anuplug.help = ['cekexif']
anuplug.tags = ['tools']
anuplug.command = /^(cekexif)$/i