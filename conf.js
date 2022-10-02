const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')
const opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

global.botpublic = opts['test'] ? false : true // Bot Status
global.sesName = opts['test'] ? 'anubisTest' : 'anubisAuth' // Session Folder
global.mongoUser = 'mongodb+srv://test:test123@test.onzmz8w.mongodb.net/?retryWrites=true&w=majority' //mongo uri
global.ownerNum = ['6289653909054'] // owner number
global.fla = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text='
global.thumb = fs.readFileSync('./library/intro.mp4')
global.__root = path.join(__dirname, '/')
global.__temp = path.join(__dirname, '/temp/')
global.msg = {
    err: "error ngab! coba hubungi owner",
    nUrl: "bad URL",
    nText: "Invalid param text!",
    nNumber: "Invalid number",
    nMedia: "Invalid media",
    pUrl: "Please enter param url!",
    pQuery: "Please enter param query!",
    pId: "Please enter param id!",
}
global.mess = {
    wait: "Bentar ngab!",
    success: 'Berhasil ngab! cieeee...',
}
global.anuCookie = {
    ig: '', // instagram cookies
    joox: '', // joox cookies
    soundcloud: 'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX', //soundcloud client_id
}
global.pingWeb = '' 
global.anuFooter = 'made with ❤️ by anubis' //footer text
global.packname = 'gabut banh maknya bikin stiker!' // exif sticker package name
global.author = '6289653909054 • anubis-bot' //exif sticker author
global.apirnobg = [
    "bru3EGkeVy8QnFMfyhSBjp5U",
    "Wu6eovAy7DeVFz1v2yuzYKJb",
    "1gdCEVhDVAbQHwV8LgWcrMHA",
    "CwTa6J7FhrH32JfxULgAexHc",
    "Swpj4r78BBg6WU6SEHHJ1qLg",
]