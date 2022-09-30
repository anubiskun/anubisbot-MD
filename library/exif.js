/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

 const fs = require('fs')
 const Crypto = require("crypto")
 const webp = require("node-webpmux")
 const path = require("path");
 const { imageToWebp, videoToWebp, WebpToWebp } = require('./converter');
 
 async function writeExifImg (media, metadata) {
     let wMedia = await imageToWebp(media)
     const tmpFileIn = path.join(__temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
     const tmpFileOut = path.join(__temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
     fs.writeFileSync(tmpFileIn, wMedia)
 
     if (metadata.packname || metadata.author) {
         const img = new webp.Image()
         const json = { "sticker-pack-id": `https://github.com/anubiskun`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : ["😂","🤩","😍","😘","🥰","😋","😎","😁","😶","😪","😯"] }
         const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
         const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
         const exif = Buffer.concat([exifAttr, jsonBuff])
         exif.writeUIntLE(jsonBuff.length, 14, 4)
         await img.load(tmpFileIn)
         fs.unlinkSync(tmpFileIn)
         img.exif = exif
         await img.save(tmpFileOut)
         return tmpFileOut
     }
 }
 
 async function writeExifVid (media, metadata) {
     let wMedia = await videoToWebp(media)
     const tmpFileIn = path.join(__temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
     const tmpFileOut = path.join(__temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
     fs.writeFileSync(tmpFileIn, wMedia)
 
     if (metadata.packname || metadata.author) {
         const img = new webp.Image()
         const json = { "sticker-pack-id": `https://github.com/anubiskun`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : ["😂","🤩","😍","😘","🥰","😋","😎","😁","😶","😪","😯"] }
         const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
         const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
         const exif = Buffer.concat([exifAttr, jsonBuff])
         exif.writeUIntLE(jsonBuff.length, 14, 4)
         await img.load(tmpFileIn)
         fs.unlinkSync(tmpFileIn)
         img.exif = exif
         await img.save(tmpFileOut)
         return tmpFileOut
     }
 }
 
 async function writeExif (file, metadata) {
     let media = await WebpToWebp(file)
     const tmpFileOut = path.join(__temp, `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
     
     if (metadata.packname || metadata.author) {
         const img = new webp.Image()
         const json = { "sticker-pack-id": `https://github.com/anubiskun`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : ["😂","🤩","😍","😘","🥰","😋","😎","😁","😶","😪","😯"] }
         const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
         const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
         const exif = Buffer.concat([exifAttr, jsonBuff])
         exif.writeUIntLE(jsonBuff.length, 14, 4)
         try {
             await img.load(media)
         } catch (err) {
             let media = videoToWebp(file)
             await img.load(media)
         }
         img.exif = exif
         await img.save(tmpFileOut)
         return tmpFileOut
     }
 }
 
 module.exports = { writeExifImg, writeExifVid, writeExif }
 