let cp = require('child_process')
let { promisify } = require('util')
let exec = promisify(cp.exec).bind(cp)
module.exports = anuplug = async (m, { anubis, text }) => {
    if (!text) return
  if (!anubis.user.id) return
  let o
  try {
    o = await exec(text)
  } catch (e) {
    o = e
  } finally {
    let { stdout, stderr } = o
    if (stdout.trim()) m.reply(stdout)
    if (stderr.trim()) m.reply(stderr)
  }
}
anuplug.help = ['exec']
anuplug.tags = ['owner']
anuplug.command = /^[$]/
anuplug.isAnubis = true