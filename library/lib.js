let fs = require('fs')
const { proto, delay, getContentType } = require('@adiwajshing/baileys')
const axios = require('axios').default
const moment = require('moment-timezone')
const { sizeFormatter } = require('human-readable')
const cheerio = require('cheerio')

const byteToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const size = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + size[i]
}

const formatp = sizeFormatter({
    std: 'JEDEC', //'SI' = default | 'IEC' | 'JEDEC'
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})

    const getBuffer = async(url, options) => {
        try {
            options ? options : {}
            const anu = await axios({
                url,
                method: 'GET',
                headers: {
                    'DNT': 1,
                    'Upgrade-Insecure-Request': 1
                },
                ...options,
                responseType: 'arraybuffer'
            })
            return anu.data
        } catch (err) {
            return err
        }
    }

    const fetchJson = async(url, options) => {
        try {
            options ? options : {}
            const anu = await axios({
                url,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
                },
                ...options
            })
            return anu.data
        } catch (err) {
            return err
        }
    }

    const urlDirect = async(url) => {
      try {
        return await fetchJson('https://anubis.6te.net/api/getredirect.php?url=' + url)
      } catch (err) {
        console.log(err)
      }
    }

    const getSizeMedia = async(path) => {
        return new Promise((resolve, reject) => {
            if (/http/.test(path)) {
                axios({url: path, method: 'GET'})
                .then((res) => {
                    let length = parseInt(res.headers['content-length'])
                    let size = byteToSize(length, 3)
                    if (!isNaN(length)) resolve(size)
                })
            } else if (Buffer.isBuffer(path)) {
                let length = Buffer.byteLength(path)
                let size = byteToSize(length, 3)
                if (!isNaN(length)) resolve(size)
            } else {
                reject('error ngab!')
            }
        })
    }
    /**
     * Serialize Message
     * @param {WAanubisection} anubis 
     * @param {Object} m 
     * @param {store} store 
     */
    const smsg = (anubis, m, store) => {
        if (!m) return m
        let M = proto.WebMessageInfo
        if (m.key) {
            m.id = m.key.id
            m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
            m.chat = m.key.remoteJid
            m.fromMe = m.key.fromMe
            m.isGroup = m.chat.endsWith('@g.us')
            m.sender = anubis.decodeJid(m.fromMe && anubis.user.id || m.participant || m.key.participant || m.chat || '')
            if (m.isGroup) m.participant = anubis.decodeJid(m.key.participant) || ''
        }
        if (m.message) {
            m.mtype = getContentType(m.message)
            m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
            m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
            let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
            m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
            if (m.quoted) {
                let type = Object.keys(m.quoted)[0]
                m.quoted = m.quoted[type]
                if (['productMessage'].includes(type)) {
                    type = Object.keys(m.quoted)[0]
                    m.quoted = m.quoted[type]
                }
                if (typeof m.quoted === 'string') m.quoted = {
                    text: m.quoted
                }
                m.quoted.mtype = type
                m.quoted.id = m.msg.contextInfo.stanzaId
                m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
                m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
                m.quoted.sender = anubis.decodeJid(m.msg.contextInfo.participant)
                m.quoted.fromMe = m.quoted.sender === anubis.decodeJid(anubis.user.id)
                m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
                m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
                m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false
                let q = await store.loadMessage(m.chat, m.quoted.id, anubis)
                 return exports.smsg(anubis, q, store)
                }
                let vM = m.quoted.fakeObj = M.fromObject({
                    key: {
                        remoteJid: m.quoted.chat,
                        fromMe: m.quoted.fromMe,
                        id: m.quoted.id
                    },
                    message: quoted,
                    ...(m.isGroup ? { participant: m.quoted.sender } : {})
                })
    
                /**
                 * 
                 * @returns 
                 */
                m.quoted.delete = () => anubis.sendMessage(m.quoted.chat, { delete: vM.key })
    
           /**
            * 
            * @param {*} jid 
            * @param {*} forceForward 
            * @param {*} options 
            * @returns 
           */
                m.quoted.copyNForward = (jid, forceForward = false, options = {}) => anubis.copyNForward(jid, vM, forceForward, options)
    
                /**
                  *
                  * @returns
                */
                m.quoted.download = () => anubis.downloadMediaMessage(m.quoted)
            }
        }
        if (m.msg.url) m.download = () => anubis.downloadMediaMessage(m.msg)
        m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
        /**
        * Reply to this message
        * @param {String|Object} text 
        * @param {String|false} chatId 
        * @param {Object} options 
        */
        m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? anubis.sendMedia(chatId, text, 'file', '', m, { ...options }) : anubis.sendText(chatId, text, m, { ...options })
        /**
        * Copy this message
        */
        m.copy = () => exports.smsg(anubis, M.fromObject(M.toObject(m)))
    
        /**
         * 
         * @param {*} jid 
         * @param {*} forceForward 
         * @param {*} options 
         * @returns 
         */
        m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => anubis.copyNForward(jid, m, forceForward, options)
    
        return m
    }

    const ucapan = () => {
        const time = moment.tz('Asia/Jakarta').format('HH')
        let res = "Selamat pagi, belum tidur?"
        if (time >= 4) {
          res = "Selamat pagi sayang"
        }
        if (time > 10) {
          res = "Selamat siang sayang"
        }
        if (time >= 15) {
          res = "Selamat sore sayang"
        }
        if (time >= 18) {
          res = "Selamat malam sayang"
        }
        return res
    }

    const runtime = (seconds) => {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }
    const ytDislike = (id) => {
        return new Promise(async (resolve, reject) => {
          const ax = await axios.get("https://returnyoutubedislikeapi.com/votes?videoId=" + id)
          resolve(ax.data)
        });
    }
    const getRandom = (ext) => {
        return `${Math.floor(Math.random() * 10000)}${ext}`
    } 

    const igjson = (id) => {
        return new Promise((resolve, reject) => {
          //   const regex = /(https?:\/\/)?(www.)?instagram.com\/?([a-zA-Z0-9\.\_\-]+)?\/([p]+)?([reel]+)?([tv]+)?([stories]+)?\/([a-zA-Z0-9\-\_\.]+)\/?([0-9]+)?/g;
          let hasil = [];
          let user = {};
          let post = {};
          let media = [];
          let promoses = [];
          promoses.push(
            axios
              .get(`https://i.instagram.com/api/v1/media/${id}/info/`, {
                headers: {
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
                    cookie: anuCookie.ig,
                    "x-ig-app-id": 936619743392459,
                    "x-ig-www-claim":0,
                    "x-asbd-id":198387,
                    Accept: "*/*",
                },
              })
              .then(({ data }) => {
               
                let j = data.items[0];
    
                if (j.carousel_media) {
                  for (var i = 0; i < j.carousel_media.length; i++) {
                    let jj = j.carousel_media[i];
                    if (jj.video_versions) {
                      media.push({
                        url: jj.video_versions[0].url,
                        type: "mp4",
                      });
                    } else {
                      media.push({
                        url: jj.image_versions2.candidates[0].url,
                        type: "jpg",
                      });
                    }
                  }
                } else if (j.video_versions) {
                  media.push({
                    url: j.video_versions[0].url,
                    type: "mp4",
                  });
                } else {
                  media.push({
                    url: j.image_versions2.candidates[0].url,
                    type: "jpg",
                  });
                }
                let cap;
                if (j.caption == null) {
                  cap = "";
                } else {
                  cap = j.caption.text;
                }
                user = {
                  username: j.user.username,
                  full_name: j.user.full_name,
                  is_private: j.user.is_private,
                  is_verified: j.user.is_verified,
                  profile_pic_url: j.user.profile_pic_url,
                  id: j.user.pk,
                };
    
                if (j.taken_at) {
                  post = {
                    title: j.title,
                    caption: cap,
                    taken_at: j.taken_at,
                    comment_count: j.comment_count,
                    like_count: j.like_count,
                    video_duration: j.video_duration,
                    view_count: j.view_count,
                    play_count: j.play_count,
                    has_audio: j.has_audio,
                  };
                }
    
                hasil.push({
                  user: user,
                  post: post,
                  media: media,
                });
    
                Promise.all(promoses).then(() =>
                  resolve({
                    creator: "anubis-bot",
                    status: true,
                    data: hasil,
                  })
                );
              })
              .catch(reject)
          );
        });
      }

      const iggetid = (query) => {
        return new Promise( async(resolve, reject) => {
          // const regex = /(https?:\/\/)?(www.)?instagram.com\/?([a-zA-Z0-9\.\_\-]+)?\/([p]+)?([reel]+)?([tv]+)?([stories]+)?\/([a-zA-Z0-9\-\_\.]+)\/?([0-9]+)?/g;
          let promoses = [];
          // let iglink = regex.exec(query);
          const igid = await axios(
            {
                url: `https://www.instagram.com/graphql/query/?query_hash=d4e8ae69cb68f66329dcebe82fb69f6d&variables={"shortcode":"${query}"}`,
                headers: {
                    "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
                    cookie: anuCookie.ig,
                    },
                data: null,
                method: "GET",
            }
          )
              try {
                resolve({status: true, id: igid.data.data.shortcode_media.id})
              } catch (e) {
                resolve({status: false})
              }
        });
      }

      const igstory = (query) => {
        return new Promise(async(resolve, reject) => {
          let media = [];
          let hasil = [];
          let user = {};
          let promoses = [];
          promoses.push(
            axios
              .get(
                `https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${query}`,
                {
                  headers: {
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
                    cookie: anuCookie.ig,
                    "x-ig-app-id": 936619743392459,
                    "x-ig-www-claim":0,
                    "x-asbd-id":198387,
                    Accept: "*/*",
                  },
                }
              )
              .then(({ data }) => {
                let j = data.reels_media[0];
                for (var i = 0; i < j.items.length; i++) {
                  let jj = j.items[i];
                  let cap;
                  if (jj.caption == null) {
                    cap = "";
                  } else {
                    cap = jj.caption.text;
                  }
                  if (jj.video_versions) {
                    media.push({
                      url: jj.video_versions[0].url,
                      type: "mp4",
                      caption: cap,
                      taken_at: jj.taken_at,
                    });
                  } else {
                    media.push({
                      url: jj.image_versions2.candidates[0].url,
                      type: "jpg",
                      caption: cap,
                      taken_at: jj.taken_at,
                    });
                  }
                }
                user = {
                  username: j.user.username,
                  full_name: j.user.full_name,
                  is_private: j.user.is_private,
                  is_verified: j.user.is_verified,
                  profile_pic_url: j.user.profile_pic_url,
                };
                hasil.push({
                  user: user,
                  media: media,
                });
                Promise.all(promoses).then(() =>
                  resolve({
                    creator: "anubis-bot",
                    status: true,
                    data: hasil,
                  })
                );
              })
          );
        });
      }

      const tiktok = (url) => {
        return new Promise(async(resolve, reject) => {
          const tt = await axios({
            url: "https://api.app.downtik.com/a.php",
            method: "POST",
            headers: {
              accept: "*/*",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "x-requested-with": "XMLHttpRequest",
            },
            data: `url=${url}&lang=id`,
          })
          const $ = cheerio.load(tt.data)
            resolve({
              profile: $("div > div > div:nth-child(1) > img").attr("src"),
              name: $("div > div > div:nth-child(1) > div > h3").text(),
              cap: $("div > div > div:nth-child(1) > div > p").text(),
              nowm: $("div > div > div:nth-child(2) > a:nth-child(1)").attr("href"),
            })
        })
      }

      function pinterest(querry){
        return new Promise(async(resolve,reject) => {
           axios.get('https://id.pinterest.com/search/pins/?autologin=true&q=' + querry, {
            headers: {
            "cookie" : "_auth=1; _b=\"AVna7S1p7l1C5I9u0+nR3YzijpvXOPc6d09SyCzO+DcwpersQH36SmGiYfymBKhZcGg=\"; _pinterest_sess=TWc9PSZHamJOZ0JobUFiSEpSN3Z4a2NsMk9wZ3gxL1NSc2k2NkFLaUw5bVY5cXR5alZHR0gxY2h2MVZDZlNQalNpUUJFRVR5L3NlYy9JZkthekp3bHo5bXFuaFZzVHJFMnkrR3lTbm56U3YvQXBBTW96VUgzVUhuK1Z4VURGKzczUi9hNHdDeTJ5Y2pBTmxhc2owZ2hkSGlDemtUSnYvVXh5dDNkaDN3TjZCTk8ycTdHRHVsOFg2b2NQWCtpOWxqeDNjNkk3cS85MkhhSklSb0hwTnZvZVFyZmJEUllwbG9UVnpCYVNTRzZxOXNJcmduOVc4aURtM3NtRFo3STlmWjJvSjlWTU5ITzg0VUg1NGhOTEZzME9SNFNhVWJRWjRJK3pGMFA4Q3UvcHBnWHdaYXZpa2FUNkx6Z3RNQjEzTFJEOHZoaHRvazc1c1UrYlRuUmdKcDg3ZEY4cjNtZlBLRTRBZjNYK0lPTXZJTzQ5dU8ybDdVS015bWJKT0tjTWYyRlBzclpiamdsNmtpeUZnRjlwVGJXUmdOMXdTUkFHRWloVjBMR0JlTE5YcmhxVHdoNzFHbDZ0YmFHZ1VLQXU1QnpkM1FqUTNMTnhYb3VKeDVGbnhNSkdkNXFSMXQybjRGL3pyZXRLR0ZTc0xHZ0JvbTJCNnAzQzE0cW1WTndIK0trY05HV1gxS09NRktadnFCSDR2YzBoWmRiUGZiWXFQNjcwWmZhaDZQRm1UbzNxc21pV1p5WDlabm1UWGQzanc1SGlrZXB1bDVDWXQvUis3elN2SVFDbm1DSVE5Z0d4YW1sa2hsSkZJb1h0MTFpck5BdDR0d0lZOW1Pa2RDVzNySWpXWmUwOUFhQmFSVUpaOFQ3WlhOQldNMkExeDIvMjZHeXdnNjdMYWdiQUhUSEFBUlhUVTdBMThRRmh1ekJMYWZ2YTJkNlg0cmFCdnU2WEpwcXlPOVZYcGNhNkZDd051S3lGZmo0eHV0ZE42NW8xRm5aRWpoQnNKNnNlSGFad1MzOHNkdWtER0xQTFN5Z3lmRERsZnZWWE5CZEJneVRlMDd2VmNPMjloK0g5eCswZUVJTS9CRkFweHc5RUh6K1JocGN6clc1JmZtL3JhRE1sc0NMTFlpMVErRGtPcllvTGdldz0=; _ir=0"
          }
            }).then(({ data }) => {
          const $ = cheerio.load(data)
          const result = [];
          const hasil = [];
              $('div > a').get().map(b => {
              const link = $(b).find('img').attr('src')
                  result.push(link)
          });
             result.forEach(v => {
           if(v == undefined) return
           hasil.push(v.replace(/236/g,'736'))
            })
            hasil.shift();
          resolve(hasil)
          })
        })
      }

      function hagodl(query) {
        return new Promise(async(resolve, reject) => {
          let promoses = [];
          let media = [];
          axios.get(query).then(({request}) => {
            let regx = /postId\=([0-9]*)\&/i
            let preg = regx.exec(request.res.responseUrl);
            // console.log()
            return preg[1]
          }).then((postId) => {
            return axios.get(`https://i-863.ihago.net/bbs/get_post_info?data={"post_id":"${postId}","lang":"id"}`)
          }).then(({data}) => {
            // return console.log(data)
            if (data.code !== 1) return resolve({status: false})
            if (data.data.info.video) {
            let video = [data.data.info.video]
                media.push({
                    url: video,
                    type: "mp4",
                });
            } else {
                media.push({
                    url: data.data.info.images,
                    type: "jpg",
                });
            }
            return resolve({
                status: true,
                nick: data.data.info.creator.nick,
                avatar: data.data.info.creator.avatar,
                sex: data.data.info.creator.sex,
                birth: data.data.info.creator.birth,
                post_id: data.data.info.post_id,
                tag_name: data.data.info.tag_name,
                text: data.data.info.text,
                media: media,
                likes: data.data.info.likes,
                replys: data.data.info.replys || ''
            })
            });
        });
      }

module.exports = {
  getBuffer,
  fetchJson,
  getSizeMedia,
  smsg,
  ucapan,
  runtime,
  formatp,
  byteToSize,
  ytDislike,
  getRandom,
  igjson,
  iggetid,
  igstory,
  tiktok,
  urlDirect,
  pinterest,
  hagodl,
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log("Update 'handler.js'")
  delete require.cache[file]
  if (global.reloadHandler) console.log(global.reloadHandler())
})