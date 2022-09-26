require('./conf')
const yargs = require('yargs/yargs')
const opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
const { default: WAConnection ,DisconnectReason, useMultiFileAuthState, Browsers, fetchLatestWaWebVersion, S_WHATSAPP_NET } = require('@adiwajshing/baileys')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const Path = require('path')
const _ = require('lodash')
const syntaxerror = require('syntax-error')
const pino = require('pino').default
const { Low, JSONFile }  = require('./library/lowdb')
const mongoDB = require('./library/mongoDB')
// const database = new Low((opts['test']) ? new JSONFile(`database.json`) : new mongoDB(mongoUser)) // if u use mongo unscomment this
const database = new Low(new mongoDB(`mongodb+srv://test:test123@test.onzmz8w.mongodb.net/?retryWrites=true&w=majority`)) // for testing


const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function loadDatabase() {
    await database.read()
    console.log('LOADING DATABASE...')
    await sleep(5000)
    if (database.data == null) return loadDatabase()
    if (database.READ) return new Promise((resolve) => setInterval(function () { (!database.READ ? (clearInterval(this), resolve(database.data == null ? loadDatabase() : database.data)) : null) }, 0.5 * 1000))
    if (database.data !== null) return
    database.READ = true
    await database.read()
    database.READ = false
    database.data = {
        users: {},
        chats: {},
        auth: {},
        stats: {},
        msgs: {},
        database: {},
        sticker: {},
        others: {},
        settings: {},
        ...(database.data || {})
    }
    database.chain = _.chain(database.data)
    return
}

let pluginFolder = Path.join(__dirname, 'plugins')
let pluginFilter = filename => /\.js$/.test(filename)
global.plugins = {}
for (let filename of fs.readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
        global.plugins[filename] = require(Path.join(pluginFolder, filename))
    } catch (e) {
        console.log(e)
        delete global.plugins[filename]
    }
}
console.log(Object.keys(global.plugins))

global.reload = (_event, filename) => {
    if (pluginFilter(filename)) {
        let dir = Path.join(pluginFolder, filename)
        if (dir in require.cache) {
            delete require.cache[dir]
            if (fs.existsSync(dir)) console.log(`re - require plugin '${filename}'`)
            else {
            console.log(`deleted plugin '${filename}'`)
            return delete global.plugins[filename]
            }
        } else console.log(`requiring new plugin '${filename}'`)
        let err = syntaxerror(fs.readFileSync(dir), filename)
        if (err) console.log(`syntax error while loading '${filename}'\n${err}`)
        else try {
            global.plugins[filename] = require(dir)
        } catch (e) {
            console.log(e)
        } finally {
            global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
        }
    }
}

async function reloadConnector() {
    const {version, error} = await fetchLatestWaWebVersion()
    const {state, saveCreds} = await useMultiFileAuthState(global.sesName)
    let { store, anubisFunc } = require('./library/lib')
    const anubis = WAConnection({
        version: (error) ? [ 2, 2234, 13 ] : version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: Browsers.macOS(global.author),
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 1000,
      })
    anubis.db = database
    anubis.anubiskun = S_WHATSAPP_NET
    Object.freeze(global.reload)
    fs.watch(Path.join(__dirname, 'plugins'), global.reload)
    require('./server')(anubis) // uncomment this line if u use heroku for run this bot
    const libCon = require('./library/conector')
    anubis.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'connecting') console.log('sabar ngab lagi nyoba menghubungkan!')
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session, reconnecting...`); reloadConnector(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); reloadConnector(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); reloadConnector(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); anubis.logout(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Scan Again And Run.`); anubis.logout(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); reloadConnector(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); anubis.logout(); }
            else anubis.end(`Unknown DisconnectReason: ${reason}|${connection}`)
        }
        if (update.isOnline) console.log('BOT RUNNING!')
        if (update.receivedPendingNotifications) {
            global.ownerNum.forEach((Owner) => {
                anubis.sendMessage(Owner + anubis.anubiskun, { text: 'Bot jalan ngab!' })
            })
        }
    })
    anubis.ev.on('messages.upsert', (chatupdate) => libCon.anuConector(chatupdate, anubis))
    anubis.ev.on('call', async(call) => libCon.callUpdate(call, anubisFunc(anubis)))
    anubis.ev.on('contacts.update', (contactUpdate) => libCon.contactUpdate(contactUpdate, anubisFunc(anubis)))
    store.bind(anubis.ev)
    anubis.ev.on('creds.update', saveCreds)
    return
}


setTimeout(async () => {
    await loadDatabase()
    console.log('DATABASE LOADED!')
    setInterval(async () => {
        await database.write()
    }, 1000)
    reloadConnector()
}, 1000)