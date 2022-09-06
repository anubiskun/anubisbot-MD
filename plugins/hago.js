const isUrl = require("is-url")
const { hagodl } = require("../library/lib")

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!isUrl(text)) return m.reply(`*Example* : ${usedPrefix + command} https://i-863.ihago.net/d/HtSJY1`)
    m.reply(mess.wait);
    let hago = await hagodl(text)
    if (!hago.status) return m.reply('Url Error ngab!')
    let pesen = `「 HAGO VIDEO DOWNLOADER 」\n\n*Nick* : ${hago.nick}`;
    pesen += `\n*Birth* : ${hago.birth}`;
    pesen += `\n*Tag Name* : ${hago.tag_name}`;
    pesen += `\n*Likes* : ${hago.likes}`;
    if (hago.text) pesen += `\n*Caption* : ${hago.text}`;
    if (hago.media[0].type == "mp4") {
        anubis.sendMessage(
        m.chat,
        { video: { url: hago.media[0].url }, caption: pesen },
        { quoted: m }
        );
    } else if (hago.media[0].type == "jpg") {
        for (let i = 0; i < hago.media[0].url.length; i++) {
        anubis.sendMessage(
            m.chat,
            { image: { url: hago.media[0].url[i] }, caption: pesen },
            { quoted: m }
        );
        }
    } else {
        m.reply("url tidak mengandung media ngab!");
    }
}
anuplug.help = ['hago']
anuplug.tags = ['downloader']
anuplug.command = /^(hago|hg)/i
