const { ytv, ytIdRegex } = require('../library/y2mate')

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text.match(ytIdRegex) || !text) return m.reply(`Example : ${usedPrefix + command} https://youtube.com/watch?v=PtFMh6Tccag%27 360p`)
    m.reply(mess.wait)
    let quality = args[1] ? args[1] : "360p"
    try {
      let media = await ytv(text, quality)
      if (media.filesize >= 100000) return m.reply("File Melebihi Batas " + util.format(media))
      anubis.sendMessage(
          m.chat,
          {
            video: { url: media.dl_link },
            mimetype: "video/mp4",
            fileName: `${media.title}.mp4`,
            caption: `🌀 Title : ${media.title}\n🌀 Like : ${media.likes}\n🌀 Dislike : ${media.dislikes}\n🌀 Rating : ${media.rating}\n🌀 ViewCount : ${media.viewCount}\n🌀 File Size : ${media.filesizeF}\n🌀 Ext : MP3\n🌀 Resolusi : ${args[1] || "360p"}`
          },
          { quoted: m }
      )
    } catch (e) {
      let buttons = [{ buttonId: `${usedPrefix + command} ${text}`, buttonText: { displayText: "YT Downloader" }, type: 1 }];
      return anubis.sendButtonText(jid, buttons, 'command lagi error ngab!\ncoba pake YTDL v2!', m)
  }
}
anuplug.help = ['ytmp4']
anuplug.tags = ['downloader']
anuplug.command = /^(ytv|ytmp4)$/i
