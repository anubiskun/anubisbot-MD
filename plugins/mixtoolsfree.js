/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const isUrl = require('is-url')
const os = require('os')
const speed = require("performance-now");
const { performance } = require("perf_hooks");
const { runtime, formatp, shortlink } = require('../library/lib')

module.exports = anuplug = async (m, anubis, { text, command, args, usedPrefix }) => {
    const mquo = m.quoted || m;
    const quoted = mquo.mtype == "buttonsMessage"
        ? mquo[Object.keys(mquo)[1]]
        : mquo.mtype == "templateMessage"
            ? mquo.hydratedTemplate[Object.keys(mquo.hydratedTemplate)[1]]
            : mquo.mtype == "product"
                ? mquo[Object.keys(mquo)[0]]
                : m.quoted
                    ? m.quoted
                    : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const qmsg = quoted.msg || quoted;
    const isMedia = /image|video|sticker|audio/.test(mime);
    switch (command) {
        case 'cekexif':
            {
                m.reply(`🌀> Packname : ${global.packname}\n🌀> Author : ${global.author}`);
            }
            break;
        case 'cl':
        case 'changelogs':
            {
                let cap = ''
                for (let i = 0; i < 5; i++) {
                    cap += require(__root + 'package.json').changeLogs[i] + '\n─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n'
                }
                m.reply(cap)
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
 Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${oldd - neww
                    } _miliseconds_\n\nRuntime : ${runtime(process.uptime())}
 
 💻 Info Server
 RAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}
 
 _NodeJS Memory Usaage_
 ${Object.keys(used).map((key, _, arr) =>
                        `${key.padEnd(Math.max(...arr.map((v) => v.length)), " ")}: ${formatp(
                            used[key]
                        )}`
                    )
                        .join("\n")}
 
 ${cpus[0]
                        ? `_Total CPU Usage_
 ${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times)
                            .map((type) =>
                                `- *${(type + "*").padEnd(6)}: ${(
                                    (100 * cpu.times[type]) /
                                    cpu.total
                                ).toFixed(2)}%`
                            )
                            .join("\n")}
 _CPU Core(s) Usage (${cpus.length} Core CPU)_
 ${cpus
                            .map((cpu, i) =>
                                `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(
                                    cpu.times
                                )
                                    .map((type) =>
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
                let [d, b] = text.split('|')
                if (!d) d = ''
                if (!b) b = ''
                m.reply(d + readMore + b)
            }
            break;
        case 'owner':
        case 'admin':
        case 'sewa':
        case 'donate':
            {
                let pes = '[ SUPPORT anubisbot-MD with DONATE ]\n\n'
                pes += '> ovo = 6289653909054\n'
                pes += '> dana = 6289653909054\n'
                pes += '> gopay = 6289653909054\n'
                pes += '> shoppe pay = 6289653909054\n'
                pes += '> paypal = (coming soon)\n'
                pes += '> saweria = https://saweria.co/anubiskun\n\n'
                pes += 'Contact me :'
                let a = await m.reply(pes)
                if (a.status) anubis.sendContact(m.chat, global.ownerNum, m);
            }
            break;
        case 'limit': {
            m.reply((m.isPremium) ? 'anda user premium kami, tidak perlu limit' : `sisa limit anda ${m.limit}`)
        }
            break;
        case 'shortlink':
            {
                if (!isUrl(text)) return m.reply(`*Example* : ${usedPrefix + command} https://google.com`)
                if (/tinyurl.com/.test(text)) return m.reply('gila gila lu ngab! link nya dah pendek!!!\nLu mau gimana lagi si?!')
                try {
                    const sl = await shortlink(text).catch(console.err)
                    m.reply(sl)
                } catch (err) {
                    console.err(err)
                }
            }
            break;
    }
}
anuplug.help = ['cekexif', 'changelogs', 'ping', 'readmore', 'owner', 'donate', 'limit', 'shortlink']
anuplug.tags = ['tools']
anuplug.command = /^(cekexif|changelogs|cl|p(ing)?|rm|readmore|owner|admin|sewa|donate|limit|shortlink)$/i