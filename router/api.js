/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const isUrl = require('is-url')
const {anubisFunc} = require('../library/lib')

function rout(conn, store) {
    const anubis = anubisFunc(conn, store)

    const mediaDownloader = async(uri) => {
        const down = await axios.get(uri, { responseType: 'arraybuffer' })
        return down.data
    }
    
    router.post('/sendmessage/:number', async(req, res) => {
        let text = req.body.text || req.query.text
        let number = req.params.number + anubis.anubiskun
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
        let number = req.params.number + anubis.anubiskun
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
        
        let text = req.body.text || req.query.text || ''
        let media = req.body.media
        let number = req.params.number + anubis.anubiskun
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

    return router
}
    
    module.exports = rout