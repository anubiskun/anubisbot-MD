const isUrl = require('is-url');
const {tiktok, urlDirect2} = require('../library/lib')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) return m.reply("Masukkan Query Link!");
    if (!isUrl(text)) return m.reply("coba cek lagi urlnya ngab!");
    m.reply(mess.wait)
    try {
        let url = await urlDirect2(text);
        if (/tiktok/.test(url)) {
            let tt = await tiktok(url);
            if (typeof tt.nowm !== 'string') return m.reply("Video tidak di temukan, coba cek urlnya\natau akun private!");
            let teks = `「 TIKTOK DOWNLOADER 」\n\n*Username*: ${tt.name}\n*Caption*: ${tt.cap}`;
            anubis.sendMessage(
            m.chat,
            { video: { url: tt.nowm }, caption: teks },
                { quoted: m }
            );
        } else {
        return m.reply("URl  tidak valid, coba cek urlnya bwang!!!");
        }
    } catch (e) {}
}
anuplug.help = ['tiktok']
anuplug.tags = ['downloader']
anuplug.command = /^(tt|tiktok)$/i
