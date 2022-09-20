const axios = require("axios");
const isUrl = require("is-url")

function get(url) {
    return new Promise(async(resolve) => {
        const anu = await axios({
            url,
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9,id;q=0.8",
                "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://en.onlymp3.to/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "data": null,
            "method": "GET"
        });
        resolve(anu.data)
    })
}

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    const sp = text.split('|')
    if (!isUrl(sp[0])) return m.reply('Download Error ngab! Coba contact Owner!')
    m.reply(mess.wait)
    try {
        let convert = await get(sp[0])
        if (convert.error) return m.reply('Convert error ngab! coba contact Owner!')
        let getdl = await get(convert.url)
        if (getdl.error) return m.reply('Convert error ngab! coba contact Owner!')
        console.log(getdl)
        if (getdl.status == 'converting') return getdl
        if (getdl.status == 'ready') {
            if (sp[1] >= 100000)
            await anubis.sendMedia(m.chat, getdl.url, getdl.filename, '', m)
        }
    } catch (e) {
        console.log(e)
        return m.reply('Convert error ngab! coba contact Owner!')
    }
    
}
anuplug.command = /^(getytdl)$/i