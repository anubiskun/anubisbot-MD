const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const isUrl = require('is-url')

const mediaDownloader = async(uri) => {
    const down = await axios.get(uri, { responseType: 'arraybuffer' })
    return down.data
}

router.post('/sendmessage/:number', async(req, res) => {
    let text = req.body.text || req.query.text
    let number = req.params.number + '@s.whatsapp.net'
    if (number.startsWith('+')) return res.send({status: false, msg: 'error'})
    if (number.startsWith('0')) return res.send({status: false, msg: 'error'})
    if (!number == undefined) {
        res.send({status: false, msg: msg.nNumber})
    } else if (text == undefined) {
        res.send({status: false, msg: 'missing text!'})
    } else {
        try {
            anubis.sendMessage(number, {text})
            res.send({status: true, msg: 'Pesan Terkirim'})
        }catch(e){
            res.send({status: false, msg: msg.nUrl})
            console.log(e)
        }
    }
})

router.get('/sendmessage/:number', async(req, res) => {
    let text = req.body.text || req.query.text
    let number = req.params.number + '@s.whatsapp.net'
    if (number.startsWith('+')) return res.send({status: false, msg: 'error'})
    if (number.startsWith('0')) return res.send({status: false, msg: 'error'})
    if (!number == undefined) {
        res.send({status: false, msg: msg.nNumber})
    } else if (text == undefined) {
        res.send({status: false, msg: 'missing text!'})
    } else {
        try {
            anubis.sendMessage(number, {text})
            res.send({status: true, msg: 'Pesan Terkirim'})
        }catch(e){
            res.send({status: false, msg: msg.nUrl})
            console.log(e)
        }
    }
})

router.post('/sendmedia/:number', async(req, res) => {
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    let text = req.body.caption || req.query.caption || ''
    let media = req.body.media
    // return console.log(req.body)
    let number = req.params.number + '@s.whatsapp.net'
    if (number.startsWith('+')) return res.send({status: false, msg: 'error'})
    if (number.startsWith('0')) return res.send({status: false, msg: 'error'})
    if (!number == undefined) {
        res.send({status: false, msg: msg.nNumber})
    } else {
        try {
            // if (isUrl(media)) return
            const aku = await anubis.sendMedia(number, media, "", text)
            console.log(aku)
            res.send({status: true, msg: 'succes'})
        } catch(e) {
            res.send({status: false, msg: 'media/url error'})
        }
    }
})


module.exports = router