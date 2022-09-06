const { ytdlr2 } = require("../library/lib");

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) return m.reply(`Example : ${usedPrefix + command} https://youtube.com/watch?v=PtFMh6Tccag`)
    m.reply(mess.wait)
    try {
        const ytdl = await ytdlr2(text)
        if (!ytdl.status) return m.reply('Coba cek urlnya ngab!')
        // return console.log(ytdl)

        let rowsmp3 = []
        ytdl.audio.splice(ytdl.audio.length, ytdl.audio.length);
        ytdl.audio.forEach((anu, i) => {
          if (anu.needConvert) {
            rowsmp3.push({title: anu.quality, description: ``, rowId: `${usedPrefix}getytdl ${anu.url}|${anu.fileSize}`})
          } else {
            rowsmp3.push({title: anu.quality, description: ``, rowId: `${usedPrefix}fetch ${anu.url}`})
          }
        });
        let secsmp3 = [
          {
            title: 'Audio Downloader',
            rows: rowsmp3
          }
        ]

        let rowsmp4 = []
        ytdl.video.splice(ytdl.video.length, ytdl.video.length);
        ytdl.video.forEach((anu, i) => {
          if (anu.needConvert) {
            rowsmp4.push({title: anu.quality, description: ``, rowId: `${usedPrefix}getytdl ${anu.url}|${anu.fileSize}`})
          } else {
            rowsmp4.push({title: anu.quality, description: ``, rowId: `${usedPrefix}fetch ${anu.url}`})
          }
        });
        let secsmp4 = [
          {
            title: 'Video Downloader',
            rows: rowsmp4
          }
        ]
        if (command == 'ytdla'){
            return anubis.sendList(m.chat, 'MENU', `[ YOUTUBE DL MP3 ]\n*Recommend pilih yang 128k*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`, 'MENU', secsmp3, {quoted: m})
        } else if (command == 'ytdlv'){
            return anubis.sendList(m.chat, 'MENU', `[ YOUTUBE DL MP4 ]\n*Recommend pilih yang 360p*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`, 'MENU', secsmp4, {quoted: m})
        } else if (command == 'ytdl') {
            anubis.sendList(m.chat, 'MENU', `[ YOUTUBE DL MP3 ]\n*Recommend pilih yang 128k*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`, 'MENU', secsmp3, {quoted: m})
            anubis.sendList(m.chat, 'MENU', `[ YOUTUBE DL MP4 ]\n*Recommend pilih yang 360p*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`, 'MENU', secsmp4, {quoted: m})
            return
        } else {
            return m.reply('mau ngapain ngab!?')
        }
    } catch (e) {
        console.log(e)
        return m.reply('error ngab! coba contact owner!')
    }
}
anuplug.help = ['ytdl']
anuplug.tags = ['downloader']
anuplug.command = /^ytdl(a|v)?/i