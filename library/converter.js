const fs = require('fs')
const axios = require('axios')
const path = require('path')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { spawn } = require('child_process')
const isUrl = require('is-url')
const {UploadFileUgu} = require('./upload')

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
      let tmp = path.join(__dirname, '../temp', + new Date + '.' + ext)
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
            if (code !== 0) return reject(code)
            const upl = await UploadFileUgu(out)
            resolve({buffer: await fs.promises.readFile(out), url: upl.url})
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

module.exports = {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
  webpTopng
}
