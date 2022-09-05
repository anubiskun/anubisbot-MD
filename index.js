const fs = require("fs");
let { spawn } = require('child_process')
let path = require('path')
var isRunning = false

 function start(file) {
  if (isRunning) return
  isRunning = true
  let args = [path.join(__dirname, file), ...process.argv.slice(2)]
  let p = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })
  p.on('message', data => {
    console.log('[RECEIVED]', data)
    switch (data) {
      case 'reset':
        p.kill()
        start.apply(this, arguments)
        break
      case 'uptime':
        p.send(process.uptime())
        break
      case 'stop':
        p.kill();
        process.exit(1);
        break
    }
  })
  p.on('exit', code => {
    isRunning = false
    if (code == 0) return
    console.error('Exited with code:', code)
    fs.unwatchFile(args[0])
    start(file)
  })
}

start('./anubis.js')