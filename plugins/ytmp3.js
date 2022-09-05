const { yta, ytIdRegex } = require('../library/y2mate')

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text.match(ytIdRegex) || !text) return m.reply(`Example : ${usedPrefix + command} https://youtube.com/watch?v=PtFMh6Tccag 128kbps`)
    m.reply(mess.wait)
    let quality = args[1] ? args[1] : "128kbps"
    let media = await yta(text, quality)
    if (media.filesize >= 100000) return m.reply("File Melebihi Batas " + util.format(media));
    anubis.sendImage(m.chat,media.thumb,`🌀 Title : ${media.title}\n🌀 Like : ${media.like}\n🌀 Dislike : ${media.dislike}\n🌀 Rating : ${media.rating}\n🌀 ViewCount : ${media.viewCount}\n🌀 File Size : ${media.filesizeF}\n🌀 Ext : MP3\n🌀 Resolusi : ${args[1] || "128kbps"}`,m);
    anubis.sendMessage(m.chat,{audio: { url: media.dl_link },mimetype: "audio/mpeg",fileName: `${media.title}.mp3`},{ quoted: m });
}
anuplug.help = ['ytmp3']
anuplug.tags = ['downloader']
anuplug.command = /^(yta|ytmp3)/i
