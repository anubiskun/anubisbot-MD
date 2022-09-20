module.exports = anuplug = async(m, { text, command, args, usedPrefix }) => {
    if (!text) return m.reply(`Example : ${usedPrefix + command} stiker by light`);
    global.packname = text;
    //   global.author = text.split("|")[1];
    m.reply(
        `Exif berhasil diubah menjadi\n\n🌀> Packname : ${global.packname}\n🌀> Author : ${global.author}`
    );
}
anuplug.help = ['setexif']
anuplug.tags = ['owner']
anuplug.command = /^(setexif)$/i
anuplug.isAnubis = true
