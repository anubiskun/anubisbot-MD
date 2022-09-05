const os = require('os')
const speed = require("performance-now");
const { runtime, formatp } = require('../library/lib')
module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
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
anuplug.help = ['ping']
anuplug.tags = ['tools']
anuplug.command = /^p(ing)?$/i
