let {jooxSearch} = require('../library/lib')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    if (!text) return m.reply(`Example : ${usedPrefix + command} bunny girls 1nonly`);
    m.reply(mess.wait)
    try {
        let json = await jooxSearch(text)
        if (!json.status) return m.reply(global.msg.err)
        let pesane = `Result for : *${text}*\n\n*Download video by click button bellow*`;
        let rows = []
        json.anubis.splice(json.anubis.length, json.anubis.length);
        json.anubis.forEach((xres, i) => {
            rows.push({ title: xres.name, description: `Artis List: ${xres.artis_list}\nDurasi: ${xres.duration}`, rowId: `${usedPrefix}jooxdl ${xres.id}`})
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
anuplug.help = ['jooxsearch']
anuplug.tags = ['downloader']
anuplug.command = /^(jooxs|jooxsearch)$/i
