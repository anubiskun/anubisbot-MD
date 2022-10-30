/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 * 
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const isUrl = require('is-url');
const { fetchJson, durasiConverter, anureq } = require('../library/lib')
const moment = require('moment-timezone');
const { yta, ytv, ytIdRegex } = require('../library/y2mate')
let youtube = require("youtube-search-api")

module.exports = anuplug = async (m, anubis, { text, command, args, usedPrefix, mime, qmsg }) => {
    switch (command) {
        case 'instagram':
        case 'ig':
            {
                if (!text) return m.reply(`*Example* : ${usedPrefix + command} https://www.instagram.com/p/Cisd6jEvFKp/?igshid=YmMyMTA2M2Y=`)
                if (!isUrl(text)) return m.reply("coba cek lagi urlnya ngab!!!!!!!!!!");
                if (!/instagram/.test(text)) return m.reply("coba cek lagi urlnya ngab!!!!!!!!!!");
                m.reply(mess.wait);
                try {
                    const { data: json, status } = await anureq('https://api-anubiskun.herokuapp.com/api/ig?url=' + encodeURIComponent(text))
                    if (!status) return m.reply('command sementara lagi error ngab!\ncoba contact owner untuk di perbaiki')
                    if (!json.status) return m.reply('command sementara lagi error ngab!\ncoba contact owner untuk di perbaiki')
                    if (json.isHighlighted) {
                        if (json.user.is_verified == true) {
                            teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username} ✅\n*Full Name*: ${json.user.full_name}`;
                        } else {
                            teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username}\n*Full Name*: ${json.user.full_name}`;
                        }
                        if (json.selectedByStoryId) {
                            if (json.selectedByStoryId.type == "mp4") {
                                anubis.sendVideo(m.chat, json.selectedByStoryId.url, teks, m, json.selectedByStoryId.thumb)
                            } else if (json.selectedByStoryId.type == "jpg") {
                                anubis.sendImage(m.chat, json.selectedByStoryId.url, teks, m)
                            } else {
                                m.reply("command error, mohon lapor ke owner!");
                            }
                        } else {
                            for (let i = 0; i < json.media.length; i++) {
                                if (json.media[i].type == "mp4") {
                                    anubis.sendVideo(m.chat, json.media[i].url, teks, m, json.media[i].thumb)
                                } else if (json.media[i].type == "jpg") {
                                    anubis.sendImage(m.chat, json.media[i].url, teks, m)
                                } else {
                                    m.reply("command error, mohon lapor ke owner!");
                                }
                            }
                        }
                    } else {
                        const time = moment
                            .unix(json.post.taken_at)
                            .format("DD-MM-YYYY HH:mm:ss");
                        if (json.user.is_verified == true) {
                            teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username} ✅\n*Full Name*: ${json.user.full_name}`;
                        } else {
                            teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username}\n*Full Name*: ${json.user.full_name}`;
                        }
                        if (!json.post.title == "")
                            teks += `\n*Title*: ${json.post.title}`;
                        teks += `\n*Like*: ${json.post.like_count}`;
                        teks += `\n*Comment*: ${json.post.comment_count}`;
                        teks += `\n*Upload at*: ${time}`;
                        if (!json.post.play_count == "")
                            teks += `\n*Play Count*: ${json.post.play_count}`;
                        if (!json.post.view_count == "")
                            teks += `\n*View Count*: ${json.post.view_count}`;
                        if (!json.post.video_duration == "")
                            teks += `\n*Video Durasi*: ${ses(json.post.video_duration)}`;
                        if (!json.post.caption == "")
                            teks += `\n*Caption*: ${json.post.caption}`;
                        for (let i = 0; i < json.media.length; i++) {
                            if (json.media[i].type == "mp4") {
                                anubis.sendVideo(m.chat, json.media[i].url, teks, m, json.media[i].thumb)
                            } else if (json.media[i].type == "jpg") {
                                anubis.sendImage(m.chat, json.media[i].url, teks, m)
                            } else {
                                m.reply("command error, mohon lapor ke owner! ");
                            }
                        }

                    }
                } catch (err) {
                    console.err(err)
                    m.reply("error bwang, coba cek urlnya!");
                    return
                }
            }
            break;
        case 'hago':
        case 'hg':
            {
                if (!isUrl(text)) return m.reply(`*Example* : ${usedPrefix + command} https://i-863.ihago.net/d/HtSJY1`)
                m.reply(mess.wait);
                try {
                    let { data: hago, status } = await anureq('https://api-anubiskun.herokuapp.com/api/hago?url=' + text)
                    if (!status) return m.reply('Url Error ngab!')
                    if (!hago.status) return m.reply('Url Error ngab!')
                    let pesen = `「 HAGO VIDEO DOWNLOADER 」\n\n*Nick* : ${hago.nick}`;
                    pesen += `\n*Birth* : ${hago.birth}`;
                    pesen += `\n*Tag Name* : ${hago.tag_name}`;
                    pesen += `\n*Likes* : ${hago.likes}`;
                    if (hago.text) pesen += `\n*Caption* : ${hago.text}`;
                    if (hago.media[0].type == "mp4") {
                        anubis.sendVideo(m.chat, hago.media[0].url, pesen, m)
                    } else if (hago.media[0].type == "jpg") {
                        for (let i = 0; i < hago.media[0].url.length; i++) {
                            anubis.sendImage(m.chat, hago.media[0].url[i], pesen, m)
                        }
                    } else {
                        m.reply("url tidak mengandung media ngab!");
                    }
                } catch (err) {
                    console.err(err)
                }
            }
            break;
        case 'tiktok':
        case 'tt':
            {
                if (!text) return m.reply(`Example : ${usedPrefix + command} https://vt.tiktok.com/ZSR4m5Uym/`);
                if (!isUrl(text)) return m.reply("coba cek lagi urlnya ngab!");
                let uri = new URL(text)
                m.reply(mess.wait)
                try {
                    if (/tiktok/.test(uri.href)) {
                        let tiktok = await fetchJson('https://api-anubiskun.herokuapp.com/api/tiktok?url=' + encodeURIComponent(uri.href))
                        anubis.sendVideo(m.chat, tiktok.nowm[1].url, `「 TIKTOK DOWNLOADER 」\n*USERNAME* : ${tiktok.username}\n*Name* : ${tiktok.name}\n*CAPTION* : ${tiktok.caption}`, m)
                    } else {
                        m.reply('cek urlnya ngab!\nitu beneran link tiktok?')
                    }
                } catch (err) {
                    console.err(err)
                    m.reply('Command error ngab!\nLapor ke Owner!')
                }
            }
            break;
        case 'jooxdl':
        case 'jooxdownloader':
            {
                if (!text) return m.reply(`Example : ${usedPrefix + command} l6ZHajU7vS2zej0+x9KvMw==`);
                if (isUrl(text)) return m.reply(`Example : ${usedPrefix + command} l6ZHajU7vS2zej0+x9KvMw==`);
                m.reply(mess.wait)
                try {
                    let json = await fetchJson('https://api-anubiskun.herokuapp.com/api/jooxdownload?id=' + encodeURIComponent(text))
                    if (!json.status) return m.reply(global.msg.err)
                    let media = json.anubis
                    anubis.sendImage(m.chat, media.imgSrc, `Title : ${media.msong}\nSinger : ${media.msinger}\nDurasi : ${media.duration}\nFile Size : ${media.size}\nPublic Time : ${media.public_time}\nExt : MP3\nResolusi : 128kbps`, m);
                    await anubis.sendMessage(m.chat, { audio: { url: media.mp3Url }, mimetype: "audio/mpeg", fileName: `${media.msong}.mp3` }, { quoted: m });
                } catch (err) {
                    console.err(err)
                    m.reply(global.msg.err)
                }
            }
            break;
        case 'jooxsearch':
        case 'jooxs':
            {
                if (!text) return m.reply(`Example : ${usedPrefix + command} bunny girls 1nonly`);
                m.reply(mess.wait)
                try {
                    let json = await fetchJson('https://api-anubiskun.herokuapp.com/api/jooxsearch?q=' + encodeURIComponent(text))
                    if (!json.status) return m.reply(global.msg.err)
                    let pesane = `Result for : *${text}*\n\n*Download video by click button bellow*`;
                    let rows = []
                    json.anubis.splice(json.anubis.length, json.anubis.length);
                    json.anubis.forEach((xres, i) => {
                        rows.push({ title: xres.name, description: `Artis List: ${xres.artis_list}\nDurasi: ${xres.duration}`, rowId: `${usedPrefix}jooxdl ${xres.id}` })
                    })
                    let secs = [
                        {
                            title: 'RESULT',
                            rows: rows
                        }
                    ]
                    anubis.sendList(m.chat, "*[ JOOX SEARCH ]*", pesane, 'RESULT', secs, m)
                } catch (err) {
                    console.err(err)
                    m.reply(global.msg.err)
                }
            }
            break;
        case 'soundcloudsearch':
        case 'scs':
            {
                if (!text) return m.reply(`Example : ${usedPrefix + command} bunny girls 1nonly`);
                m.reply(mess.wait)
                try {
                    let json = await fetchJson('https://api-anubiskun.herokuapp.com/api/soundcloud?q=' + encodeURIComponent(text))
                    if (!json.status) return m.reply(global.msg.err)
                    let pesane = `Result for : *${text}*\n\n*Download video by click button bellow*`;
                    let rows = []
                    json.anubis.splice(json.anubis.length, json.anubis.length);
                    json.anubis.forEach((xres, i) => {
                        rows.push({ title: xres.title, description: `Full Name: ${xres.full_name}\nUsername: ${xres.username}\nLink SC: ${xres.user_url}\nGenre : ${xres.genre}\nCreated: ${xres.created_at}\nDurasi: ${xres.duration}\nComment Count: ${xres.comment_count}\nLike Count: ${xres.likes_count}\nPlay Count: ${xres.playback_count}\nRepost Count: ${xres.reposts_count}\nDescription: ${xres.description}`, rowId: `${usedPrefix}fetch ${xres.urlmp3}` })
                    })
                    let secs = [
                        {
                            title: 'RESULT',
                            rows: rows
                        }
                    ]
                    anubis.sendList(m.chat, "*[ SOUNDCLOUD SEARCH ]*", pesane, 'RESULT', secs, m)
                } catch (err) {
                    console.err(err)
                    m.reply(global.msg.err)
                }
            }
            break;
        case 'ytmp3':
        case 'yta':
            {
                if (!text.match(ytIdRegex) || !text) return m.reply(`Example : ${usedPrefix + command} https://youtube.com/watch?v=PtFMh6Tccag 128kbps`)
                m.reply(mess.wait)
                let quality = args[1] ? args[1] : "128kbps"
                try {
                    let media = await yta(text, quality)
                    if (media.filesize >= 100000) return anubis.sendImage(m.chat, media.thumb, `*FILE MELEBIHI BATAS SILAHKAN GUNAKAN LINK*\n\n🌀 Title : ${media.title}\n🌀 Like : ${media.likes}\n🌀 Dislike : ${media.dislikes}\n🌀 Rating : ${media.rating}\n🌀 ViewCount : ${media.viewCount}\n🌀 File Size : ${media.filesizeF}\n🌀 Ext : MP3\n🌀 Resolusi : ${args[1] || "128kbps"}\n*Link* : ${await shortlink(media.dl_link)}`, m);
                    anubis.sendImage(m.chat, media.thumb, `🌀 Title : ${media.title}\n🌀 Like : ${media.likes}\n🌀 Dislike : ${media.dislikes}\n🌀 Rating : ${media.rating}\n🌀 ViewCount : ${media.viewCount}\n🌀 File Size : ${media.filesizeF}\n🌀 Ext : MP3\n🌀 Resolusi : ${args[1] || "128kbps"}`, m);
                    await anubis.sendMessage(m.chat, { audio: { url: media.dl_link }, mimetype: "audio/mpeg", fileName: `${media.title}.mp3` }, { quoted: m });
                } catch (err) {
                    console.err(err)
                    let buttons = [{ buttonId: `${usedPrefix}ytdla ${text}`, buttonText: { displayText: "YT Downloader" }, type: 1 }];
                    anubis.sendButtonText(m.chat, buttons, 'command lagi error ngab!\ncoba pake YTDL v2!', m)
                }
            }
            break;
        case 'ytmp4':
        case 'ytv':
            {
                if (!text.match(ytIdRegex) || !text) return m.reply(`Example : ${usedPrefix + command} https://youtube.com/watch?v=PtFMh6Tccag%27 360p`)
                m.reply(mess.wait)
                let quality = args[1] ? args[1] : "360p"
                try {
                    let media = await ytv(text, quality)

                    if (media.filesize >= 100000) return anubis.sendImage(m.chat, media.thumb, `*FILE MELEBIHI BATAS SILAHKAN GUNAKAN LINK*\n\n🌀 Title : ${media.title}\n🌀 Like : ${media.likes}\n🌀 Dislike : ${media.dislikes}\n🌀 Rating : ${media.rating}\n🌀 ViewCount : ${media.viewCount}\n🌀 File Size : ${media.filesizeF}\n🌀 Ext : MP4\n🌀 Resolusi : ${args[1] || "360p"}\n*Link* : ${await shortlink(media.dl_link)}`, m);
                    await anubis.sendVideo(m.chat, media.dl_link, `🌀 Title : ${media.title}\n🌀 Like : ${media.likes}\n🌀 Dislike : ${media.dislikes}\n🌀 Rating : ${media.rating}\n🌀 ViewCount : ${media.viewCount}\n🌀 File Size : ${media.filesizeF}\n🌀 Ext : MP4\n🌀 Resolusi : ${args[1] || "360p"}`, m, media.thumb)
                } catch (err) {
                    console.err(err)
                    let buttons = [{ buttonId: `${usedPrefix}ytdlv ${text}`, buttonText: { displayText: "YT Downloader" }, type: 1 }];
                    anubis.sendButtonText(m.chat, buttons, 'command lagi error ngab!\ncoba pake YTDL v2!', m)
                }
            }
            break;
        case 'yts':
        case 'ytsearch':
            {
                if (!text) return m.reply(`Example : ${usedPrefix + command} bunny girls 1nonly`);
                m.reply(mess.wait)
                let json = await youtube.GetListByKeyword(text, false, 25)
                let ytjson = []
                for (var i = 0; i < json.items.length; i++) {
                    if (json.items[i].type == "video") {
                        ytjson.push({
                            url: "https://m.youtube.com/watch?v=" + json.items[i].id,
                            title: json.items[i].title,
                            chname: json.items[i].channelTitle,
                            shortBylineText: json.items[i].shortBylineText,
                        })
                    }
                }
                let pesane = `Result for : *${text}*\n\n*Download video by click button bellow*`;
                secs = [];
                ytjson.splice(ytjson.length, ytjson.length);
                ytjson.forEach((xres, i) => {
                    secs.push({
                        rows: [
                            {
                                title: "MP3",
                                description:
                                    `${xres.title}` +
                                    `\n\n*Channel Name*: ${xres.chname}`,
                                rowId: `${usedPrefix}yta ${xres.url}`,
                            },
                            {
                                title: "MP4",
                                description:
                                    `${xres.title}` +
                                    `\n\n*Channel Name*: ${xres.chname}`,
                                rowId: `${usedPrefix}ytv ${xres.url}`,
                            },
                        ],
                        title: i + 1,
                    });
                });
                anubis.sendList(m.chat, "*[ YOUTUBE SEARCH ]*", pesane, 'RESULT', secs, m);
            }
            break;
    }
}
anuplug.help = ['instagram', 'hago', 'tiktok', 'jooxsearch', 'soundcloudsearch', 'ytsearch', 'ytmp3', 'ytmp4',]
anuplug.tags = ['downloader']
anuplug.command = /^(ig|instagram|hago|hg|tiktok|tt|jooxdownloader|jooxdl|jooxsearch|jooxs|soundcloudsearch|scs|yta|ytmp3|ytv|ytmp4|yts|ytsearch)$/i
anuplug.isPremium = true

function ses(secs) {
    let sec_num = parseInt(secs, 10);
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor(sec_num / 60) % 60;
    let seconds = sec_num % 60;

    return [hours, minutes, seconds]
        .map((v) => (v < 10 ? "0" + v : v))
        .filter((v, i) => v !== "00" || i > 0)
        .join(":");
}