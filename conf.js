const fs = require('fs')
const path = require('path')

global.botpublic = true
global.sesName = 'session.json' //session name
global.mongoUser = '' //mongo uri
global.ownerNum = ['6289653909054'] // owner number
global.fla = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text='
global.thumb = fs.readFileSync('./library/anubis.jpg')
global.__root = path.join(__dirname)
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
global.pingWeb = 'anuwapay.herokuapp.com'
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
global.changelogs = [
    '[ V 1.6.6 ]\n- Added add & kick command in group\n- Added vote command in group\n- Marge any command\n- Fixing sticker command to improve performance\n- Fixing Tiktok command\n- Fix ytdl v2\n- Added shortlink command',
    '[ V 1.6.5 ]\n- Added notes for group\n- Added tagall and hidetag for group\n- Added Joox Search and DL command\n- Added SoundCloud Search and DL command\n- Bug Fix',
    '[ V 1.6.4 ]\n- Fix any command error',
    '[ V 1.6.3 ]\n- Support Download highlights url Instagram',
    '[ V 1.6.2 ]\n- Fix YT Downloader and Added new YT Downloader v2\n- Added any command support',
    '[ V 1.6.1 ]\n- Bug Fix Menu can`t display in any whatsapp version',
    '[ V 1.6.0 ]\n- Bug Fix\n- Benerin command google & gimage\n- Added command gimgrev -> for search similar image use reply image',
    '[ V 1.5.0 ]\n- Bug Fix\n- Many added commands',
    '[ V 1.4.0 ]\n- Bug Fix\n- Added FistChat\n- Added Public change',
    '[ V 1.3.0 ]\n- Release Whatsapp anubis-bot beta',
    '[ V 1.2.0 ]\n- Bug Fix\n- Added api',
    '[ V 1.1.0 ]\n- Bug Fix',
    '[ V 1.0.0 ]\n- Uploaded',
]