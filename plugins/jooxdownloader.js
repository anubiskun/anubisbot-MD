let {jooxDownloader} = require('../library/lib')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) return m.reply(`Example : ${usedPrefix + command} anubis si paling cakep :v, ygy?!`);
    m.reply(mess.wait)
    try {
        let json = await jooxDownloader(text)
        if (!json.status) return m.reply(global.msg.err)
        let media = json.anubis
        anubis.sendImage(m.chat, media.imgSrc,`Title : ${media.msong}\nSinger : ${media.msinger}\nDurasi : ${media.duration}\nFile Size : ${media.size}\nPublic Time : ${media.public_time}\nExt : MP3\nResolusi : 128kbps`,m);
        anubis.sendMessage(m.chat,{audio: { url: media.mp3Url },mimetype: "audio/mpeg",fileName: `${media.msong}.mp3`},{ quoted: m });
    } catch (err) {
        console.log(err)
        return m.reply(global.msg.err)
    }
}
// anuplug.help = ['jooxdownloader']
// anuplug.tags = ['downloader']
anuplug.command = /^(jooxdl|jooxdownloader)$/i
