const { ytdlr2, sleep } = require("../library/lib");
const axios = require("axios");
const isUrl = require("is-url")

function getLink(url, etag) {
  return new Promise(async(resolve) => {
    let headers
    if (etag) {
      headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        "sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://en.y2mate.is/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "If-None-Match": etag,
      }
    } else {
      headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        "sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://en.y2mate.is/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    }
    const res = await axios.get(url, {
      headers,
    });
    if (res.data.status == 'converting') getLink(url, res.headers.etag)
    if (res.data.status == 'ready') resolve(res)
  })
}

function getConvert(url) {
  return new Promise(async(resolve) => {
    const res = await axios({
      url,
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        "sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://en.y2mate.is/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      data: null,
      method: "GET"
    });
    let result = await getLink(res.data.url)
    if (result.data.status == 'ready') return resolve(result.data)
  })
}

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
  if (!text) return m.reply(`Example : ${usedPrefix + command} https://youtube.com/watch?v=PtFMh6Tccag`)
  // return m.reply('ytdl v2 masi error ngab!')
  switch(command){
    case 'ytdl':
    case 'ytdla':
    case 'ytdlv':
      {
        m.reply(mess.wait)
        try {
          const ytdl = await ytdlr2(text)
          if (!ytdl.status) return m.reply('Coba cek urlnya ngab!')
          // return console.log(ytdl)
          
          let rowsmp3 = []
          ytdl.audio.splice(ytdl.audio.length, ytdl.audio.length);
          ytdl.audio.forEach((anu, i) => {
            if (anu.needConvert) {
              rowsmp3.push({title: anu.quality + ' (CONVERT)', description: ``, rowId: `${usedPrefix}getytdl ${anu.url}|${anu.fileSize}`})
            } else {
              rowsmp3.push({title: anu.quality + ' (DOWNLOAD)', description: ``, rowId: `${usedPrefix}fetch ${anu.url}`})
            }
          });
          let secsmp3 = [
            {
              title: 'Audio Downloader',
              rows: rowsmp3
            }
          ]
          
          let rowsmp4 = []
          ytdl.video.splice(ytdl.video.length, ytdl.video.length);
          ytdl.video.forEach((anu, i) => {
            if (anu.needConvert) {
              rowsmp4.push({title: anu.quality + ' (CONVERT)', description: ``, rowId: `${usedPrefix}getytdl ${anu.url}|${anu.fileSize}`})
            } else {
              rowsmp4.push({title: anu.quality + ' (DOWNLOAD)', description: ``, rowId: `${usedPrefix}fetch ${anu.url}`})
            }
          });
          let secsmp4 = [
            {
              title: 'Video Downloader',
              rows: rowsmp4
            }
          ]
          if (command == 'ytdla'){
            return anubis.sendList(m.chat, 'MENU', `[ YOUTUBE DL MP3 ]\n*Recommend pilih yang 128k*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`, 'MENU', secsmp3, {quoted: m})
          } else if (command == 'ytdlv'){
            return anubis.sendList(m.chat, 'MENU', `[ YOUTUBE DL MP4 ]\n*Recommend pilih yang 360p*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`, 'MENU', secsmp4, {quoted: m})
          } else if (command == 'ytdl') {
            anubis.sendList(m.chat, 'MENU', `[ YOUTUBE DL MP3 ]\n*Recommend pilih yang 128k*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`, 'MENU', secsmp3, {quoted: m})
            anubis.sendList(m.chat, 'MENU', `[ YOUTUBE DL MP4 ]\n*Recommend pilih yang 360p*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`, 'MENU', secsmp4, {quoted: m})
            return
          } else {
            return m.reply('mau ngapain ngab!?')
          }
        } catch (e) {
          console.log(e)
          m.reply('error ngab! coba contact owner!')
        }
      }
    break;
    case 'getytdl':
      {
        const sp = text.split('|')
        if (!isUrl(sp[0])) return m.reply('Download Error ngab! Coba contact Owner!')
        m.reply(mess.wait)
        try {
            let getdl = await getConvert(sp[0])
            if (getdl.error) return m.reply('Convert error ngab! coba contact Owner!')
            if (getdl.status == 'ready') {
                if (sp[1] >= 100000000) return m.reply(`*FILE MELEBIHI BATAS SILAHKAN GUNAKAN LINK*\n\n*Link* :  ${getdl.url}`);
                else await anubis.sendMedia(m.chat, getdl.url, getdl.filename, '', m)
            }
        } catch (e) {
            console.log(e)
            return m.reply('Convert error ngab! coba contact Owner!')
        }
      }
  }
}
anuplug.help = ['ytdl']
anuplug.tags = ['downloader']
anuplug.command = /^(ytdl(a|v)?|getytdl)$/i