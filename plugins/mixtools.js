const axios = require('axios')
const isUrl = require('is-url')
const util = require('util')
const os = require('os')
const speed = require("performance-now");
const { runtime, formatp } = require('../library/lib')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    switch(command){
        case 'cekexif':
            {
                m.reply(`🌀> Packname : ${global.packname}\n🌀> Author : ${global.author}`);
            }
        break;
        case 'cl':
        case 'changelog':
        case 'changelogs':
            {
                let cap = ''
                for (let i = 0; i < 5; i++){
                cap += changelogs[i] + '\n─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n'
                }
                m.reply(cap)
            }
        break;
        case 'fetch':
            {
                if (!isUrl(text)) return m.reply('wajib url direct ngab!')
                m.reply(mess.wait)
                try {
                    let res = await axios.get(text)
                    // return console.log(res)
                    if (res.headers['content-length'] > 100 * 1024 * 1024 * 1024) {
                        delete res
                        throw `Content-Length: ${res.headers['content-length']}`
                    }
                    if (!/text|json/.test(res.headers['content-type'])) return anubis.sendMedia(m.chat, text, 'file', 'by anubis-bot', m)
                    let txt = res.data
                    try {
                        txt = util.format(JSON.parse(txt+''))
                    } catch (e) {
                        txt = txt + ''
                    } finally {
                        m.reply(txt.slice(0, 65536) + '')
                    }
                } catch (e) {
                    console.log(e)
                    return m.reply('error ngab! coba contact owner!')
                }
            }
        break;
        case 'p':
        case 'ping':
            {
                const used = process.memoryUsage();
                const cpus = os.cpus().map((cpu) => {
                  cpu.total = Object.keys(cpu.times).reduce(
                    (last, type) => last + cpu.times[type],
                    0
                  );
                  return cpu;
                });
                const cpu = cpus.reduce(
                  (last, cpu, _, { length }) => {
                    last.total += cpu.total;
                    last.speed += cpu.speed / length;
                    last.times.user += cpu.times.user;
                    last.times.nice += cpu.times.nice;
                    last.times.sys += cpu.times.sys;
                    last.times.idle += cpu.times.idle;
                    last.times.irq += cpu.times.irq;
                    return last;
                  },
                  {
                    speed: 0,
                    total: 0,
                    times: {
                      user: 0,
                      nice: 0,
                      sys: 0,
                      idle: 0,
                      irq: 0,
                    },
                  }
                );
                let timestamp = speed();
                let latensi = speed() - timestamp;
                neww = performance.now();
                oldd = performance.now();
respon = `
Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${
        oldd - neww
    } _miliseconds_\n\nRuntime : ${runtime(process.uptime())}

💻 Info Server
RAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}

_NodeJS Memory Usaage_
${Object.keys(used)
.map(
(key, _, arr) =>
`${key.padEnd(Math.max(...arr.map((v) => v.length)), " ")}: ${formatp(
    used[key]
)}`
)
.join("\n")}

${
cpus[0]
? `_Total CPU Usage_
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times)
    .map(
    (type) =>
        `- *${(type + "*").padEnd(6)}: ${(
        (100 * cpu.times[type]) /
        cpu.total
        ).toFixed(2)}%`
    )
    .join("\n")}
_CPU Core(s) Usage (${cpus.length} Core CPU)_
${cpus
.map(
(cpu, i) =>
`${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(
    cpu.times
)
    .map(
    (type) =>
        `- *${(type + "*").padEnd(6)}: ${(
        (100 * cpu.times[type]) /
        cpu.total
        ).toFixed(2)}%`
    )
    .join("\n")}`
)
.join("\n\n")}`
: ""
}
`.trim();
                m.reply(respon);
            }
        break;
        case 'rm':
        case 'readmore':
            {
                const more = String.fromCharCode(8206)
                const readMore = more.repeat(4001)
                if (!text) return m.reply(`Example: ${usedPrefix + command} depan|belakang\n${usedPrefix + command} tau gasi! su|ka-ku ke kamu tu besar banget\nHasil : tau gasi! su${readMore}ka-ku ke kamu tu besar banget`)
                let [ d, b ] = text.split('|')
                if (!d) d = ''
                if (!b) b = ''
                m.reply(d + readMore + b)
            }
        break;
        case 'owner':
        case 'admin':
        case 'sewa':
            {
                anubis.sendContact(m.chat, global.ownerNum, m);
            }
    }
}
anuplug.help = ['cekexif','changelogs','ping','readmore','owner']
anuplug.tags = ['tools']
anuplug.command = /^(cekexif|changelogs?|cl|fetch|p(ing)?|rm|readmore|owner|admin|sewa)$/i