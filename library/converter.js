/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

 const fs = require('fs')
 const axios = require('axios')
 const Path = require('path')
 const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
 const { spawn } = require('child_process')
 const isUrl = require('is-url')
 
 /**
  * 
  * @param {Buffer} buffer Buffer
  * @param {command} args 
  * @param {String} ext ex: jpg/mp4/mp3/...
  * @param {String} ext2 ex: jpg/png/mp4/...
  * @returns Buffer
  */
 function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
   return new Promise(async (resolve, reject) => {
     try {
       var file
       if (isUrl(buffer)) {
         const a = await axios.get(buffer, { responseType: 'arraybuffer' })
         file = a.data
       } else {
         file = buffer
       }
       let tmp = Path.join(__temp, + new Date + '.' + ext)
       let out = tmp + '.' + ext2
       await fs.promises.writeFile(tmp, file)
       spawn(ffmpegPath, [
         '-y',
         '-i', tmp,
         ...args,
         out
       ])
         .on('error', reject)
         .on('close', async (code) => {
           try {
             await fs.promises.unlink(tmp)
             // if (code !== 0) return false
             resolve(await fs.promises.readFile(out))
             await fs.promises.unlink(out)
           } catch (e) {
             reject(e)
           }
         })
     } catch (e) {
       reject(e)
     }
   })
 }
 
 /**
  * Convert Audio to Playable WhatsApp Audio
  * @param {Buffer} buffer Audio Buffer/url
  * @param {String} ext File Extension 
  */
 async function toAudio(buffer, ext) {
   var file
   if (isUrl(buffer)) {
     const a = await axios.get(buffer, { responseType: 'arraybuffer' })
     file = a.data
   } else {
     file = buffer
   }
   return ffmpeg(file, [
     '-vn',
     '-ac', '2',
     '-b:a', '128k',
     '-ar', '44100',
     '-f', 'mp3'
   ], ext, 'mp3')
 }
 
 /**
  * 
  * @param {Buffer} buffer Webp Buffer/url
  * @param {String} ext File Extension 
  */
 async function webpTopng(buffer, ext = 'webp') {
   var file
   if (isUrl(buffer)) {
     const a = await axios.get(buffer, { responseType: 'arraybuffer' })
     file = a.data
   } else {
     file = buffer
   }
   return ffmpeg(file, [], ext, 'png')
 }
 
 /**
  * Convert Audio to Playable WhatsApp PTT
  * @param {Buffer} buffer Audio Buffer/url
  * @param {String} ext File Extension 
  */
 async function toPTT(buffer, ext) {
   if (isUrl(buffer)) {
     const a = await axios.get(buffer, { responseType: 'arraybuffer' })
     file = a.data
   } else {
     file = buffer
   }
   return ffmpeg(file, [
     '-vn',
     '-c:a', 'libopus',
     '-b:a', '128k',
     '-vbr', 'on',
     '-compression_level', '10'
   ], ext, 'opus')
 }
 
 /**
  * Convert Audio to Playable WhatsApp Video
  * @param {Buffer} buffer Video Buffer
  * @param {String} ext File Extension 
  */
 async function toVideo(buffer, ext) {
   if (isUrl(buffer)) {
     const a = await axios.get(buffer, { responseType: 'arraybuffer' })
     file = a.data
   } else {
     file = buffer
   }
   return ffmpeg(file, [
     '-c:v', 'libx264',
     '-c:a', 'aac',
     '-ab', '128k',
     '-ar', '44100',
     '-crf', '32',
     '-preset', 'slow'
   ], ext, 'mp4')
 }
 
 async function imageToWebp(buffer) {
   if (isUrl(buffer)) {
     const a = await axios.get(buffer, { responseType: 'arraybuffer' })
     file = a.data
   } else {
     file = buffer
   }
   return ffmpeg(file, [
     "-vcodec",
     "libwebp",
     "-vf",
     "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
   ], 'jpg', 'webp')
 }
 
 async function WebpToWebp(buffer) {
   if (isUrl(buffer)) {
     const a = await axios.get(buffer, { responseType: 'arraybuffer' })
     file = a.data
   } else {
     file = buffer
   }
   return ffmpeg(file, [
     "-vcodec", "libwebp",
     "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
     "-lossless", "1",
     "-compression_level", "6",
     "-loop", "0",
     "-preset", "default",
     "-an",
     "-vsync",
     "0"
   ], 'webp', 'webp')
 }
 
 async function videoToWebp(buffer) {
   if (isUrl(buffer)) {
     const a = await axios.get(buffer, { responseType: 'arraybuffer' })
     file = a.data
   } else {
     file = buffer
   }
   return ffmpeg(file, [
     "-vcodec",
     "libwebp",
     "-vf",
     "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
     "-loop",
     "0",
     "-ss",
     "00:00:00",
     "-t",
     "00:00:10",
     "-preset",
     "default",
     "-an",
     "-vsync",
     "0"
   ], 'mp4', 'webp')
 }
 
 /**
  * 
  * @param {Buffer} buffer video mp4 file
  * @returns Buffer
  */
 async function videoToThumb(buffer) {
   if (isUrl(buffer)) {
     const a = await axios.get(buffer, { responseType: 'arraybuffer' })
     file = a.data
   } else {
     file = buffer
   }
   return ffmpeg(file, [
     '-ss', '00:00:00',
     '-vf', 'scale=32:-1',
     '-vframes', '1',
     '-f', 'image2',
   ], 'mp4', 'jpg')
 }
 
 /**
  * 
  * @param {Buffer} buffer image jpg/png file
  * @returns Buffer
  */
 async function imageToThumb(buffer) {
   if (isUrl(buffer)) {
     const a = await axios.get(buffer, { responseType: 'arraybuffer' })
     file = a.data
   } else {
     file = buffer
   }
   return ffmpeg(file, [
     '-vf', 'scale=32:-1',
     '-f', 'image2',
   ], 'jpg', 'jpg')
 }
 
 module.exports = {
   toAudio,
   toPTT,
   toVideo,
   ffmpeg,
   webpTopng,
   imageToWebp,
   videoToWebp,
   WebpToWebp,
   videoToThumb,
   imageToThumb,
 }
 