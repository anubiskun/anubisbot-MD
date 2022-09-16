module.exports = anuplug = async(m) => {
    let cap = ''
    for (let i = 0; i < 5; i++){
       cap += changelogs[i] + '\n─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n'
    }
m.reply(cap)
}
anuplug.help = ['changelog']
anuplug.tags = ['tools']
anuplug.command = /^(changelog|cl)$/i
