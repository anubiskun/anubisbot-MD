let {soundcloud} = require('../library/lib')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) return m.reply(`Example : ${usedPrefix + command} bunny girls 1nonly`);
    m.reply(mess.wait)
    try {
        let json = await soundcloud(text)
        if (!json.status) return m.reply(global.msg.err)
        let pesane = `Result for : *${text}*\n\n*Download video by click button bellow*`;
        let rows = []
        json.anubis.splice(json.anubis.length, json.anubis.length);
        json.anubis.forEach((xres, i) => {
            rows.push({ title: xres.title, description: `Full Name: ${xres.full_name}\nUsername: ${xres.username}\nLink SC: ${xres.user_url}\nGenre : ${xres.genre}\nCreated: ${xres.created_at}\nDurasi: ${xres.duration}\nComment Count: ${xres.comment_count}\nLike Count: ${xres.likes_count}\nPlay Count: ${xres.playback_count}\nRepost Count: ${xres.reposts_count}\nDescription: ${xres.description}`, rowId: `${usedPrefix}fetch ${xres.urlmp3}`})
        })
        let secs = [
            {
                title: 'RESULT',
                rows: rows
            }
        ]
        return anubis.sendList(m.chat, "*JOOX SEARCH*", pesane, 'RESULT', secs, {quoted: m})
    } catch (err) {
        console.log(err)
        return m.reply(global.msg.err)
    }
}
anuplug.help = ['soundcloudsearch']
anuplug.tags = ['downloader']
anuplug.command = /^(scs|soundcloudsearch)$/i
