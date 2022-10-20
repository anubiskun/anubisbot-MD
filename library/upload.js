/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const axios = require('axios')
const BodyForm = require('form-data')
const fs = require('fs')
let cheerio = require('cheerio')

/**
 * 
 * @param {path} Path 
 * @returns 
 */
function telegraphUp(Path) {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
		try {
			const form = new BodyForm();
			form.append("file", fs.createReadStream(Path))
			const data = await axios({
				url: "https://telegra.ph/upload",
				method: "POST",
				headers: {
					...form.getHeaders()
				},
				data: form
			}).catch(err => console.err(err, 'telegraphUp'))
			// return resolve(data)
			return resolve("https://telegra.ph" + data.data[0].src)
		} catch (err) {
			return reject(new Error(String(err)))
		}
	})
}

/**
 * 
 * @param {path} path 
 * @returns 
 */
function webp2mp4File(path) {
	return new Promise((resolve, reject) => {
		const form = new BodyForm()
		form.append('new-image-url', '')
		form.append('new-image', fs.createReadStream(path))
		axios({
			method: 'post',
			url: 'https://s6.ezgif.com/webp-to-mp4',
			data: form,
			headers: {
				'Content-Type': `multipart/form-data; boundary=${form._boundary}`
			}
		}).then(({ data }) => {
			const bodyFormThen = new BodyForm()
			const $ = cheerio.load(data)
			const file = $('input[name="file"]').attr('value')
			bodyFormThen.append('file', file)
			bodyFormThen.append('convert', "Convert WebP to MP4!")
			axios({
				method: 'post',
				url: 'https://ezgif.com/webp-to-mp4/' + file,
				data: bodyFormThen,
				headers: {
					'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
				}
			}).then(({ data }) => {
				const $ = cheerio.load(data)
				const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
				resolve({
					status: true,
					message: "Created By anubiskun",
					result: result
				})
			}).catch(err => console.err(err, 'webp2mp4File'))
		}).catch(err => console.err(err, 'webp2mp4File'))
	})
}

/**
 * 
 * @param {path} input 
 * @returns 
 */
async function tmpfiles(input) {
	return new Promise(async (resolve, reject) => {
		const form = new BodyForm();
		form.append("file", fs.createReadStream(input))
		await axios({
			url: "https://tmpfiles.org/api/v1/upload",
			method: "POST",
			headers: {
				...form.getHeaders()
			},
			data: form

		}).then(({ data }) => {
			// console.log(data)
			let ew = /https?:\/\/tmpfiles.org\/(.*)/.exec(data.data.url)
			resolve('https://tmpfiles.org/dl/' + ew[1])
		}).catch(err => console.err(err, 'tmpfiles'))
	})
}

module.exports = {
	telegraphUp,
	tmpfiles,
	webp2mp4File,
}