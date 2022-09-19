let youtube = require("youtube-search-api")
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) return m.reply(`Example : ${usedPrefix + command} bunny girls 1nonly`);
    m.reply(mess.wait)
    let json = await youtube.GetListByKeyword(text, false, 25)
    let ytjson = []
    for(var i=0; i< json.items.length; i++){
        if (json.items[i].type=="video") {
            ytjson.push({
            url: "https://m.youtube.com/watch?v="+ json.items[i].id,
            title: json.items[i].title,
            chname: json.items[i].channelTitle,
            shortBylineText: json.items[i].shortBylineText,
            })
        }
    }
    let pesane = `Result for : *${text}*\n\n*Download video by click button bellow*`;
    secs = [];
    ytjson.splice(ytjson.length, ytjson.length);
    ytjson.forEach((xres, i) => {
        secs.push({
        rows: [
            {
            title: "MP3",
            description:
                `${xres.title}` +
                `\n\n*Channel Name*: ${xres.chname}`,
            rowId: `${usedPrefix}ytmp3 ${xres.url}`,
            },
            {
            title: "MP4",
            description:
                `${xres.title}` +
                `\n\n*Channel Name*: ${xres.chname}`,
            rowId: `${usedPrefix}ytmp4 ${xres.url}`,
            },
        ],
        title: i + 1,
        });
    });
    anubis.sendList(m.chat, "*YOUTUBE SEARCH*", pesane, 'RESULT', secs, {quoted: m});
}
anuplug.help = ['ytsearch']
anuplug.tags = ['downloader']
anuplug.command = /^(yts|ytsearch)$/i
