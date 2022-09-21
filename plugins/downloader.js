const isUrl = require('is-url');
const {iggetid, igjson, urlDirect2, igstory, hagodl, tiktok, jooxDownloader, jooxSearch, soundcloud} = require('../library/lib')
const moment = require('moment-timezone');

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    switch(command){
        case 'instagram':
        case 'ig':
            {
                let igPreg = /(?:https?:\/\/)?(?:www.)?instagram.com\/?(?:[a-zA-Z0-9\.\_\-]+)?\/((?:[p]+)?(?:[reel]+)?(?:[tv]+)?(?:[stories]+)?)\/([a-zA-Z0-9\-\_\.]+)\/?([0-9]+)?/g;
                if (!text) return m.reply("No Query Url!");
                if (!isUrl(text)) return m.reply("coba cek lagi urlnya ngab!!!!!!!!!!");
                let igreg = igPreg.exec(text);
                m.reply(mess.wait);

                try {
                    if (igreg[1] != "stories" && igreg[1] !== "s") {
                        let getid = await iggetid(igreg[2]);
                        if (!getid.status) return m.reply('error ngab coba cek urlnya!')
                        let ig = await igjson(getid.id);
                        json = ig.data[Math.floor(Math.random() * ig.data.length)];
                        time = moment
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
                        teks += `\n*Type*: ${igreg[1]}`;
                        if (!json.post.caption == "")
                            teks += `\n*Caption*: ${json.post.caption}`;
                        for (let i = 0; i < json.media.length; i++) {
                            if (json.media[i].type == "mp4") {
                            anubis.sendMessage(
                                m.chat,
                                { video: { url: json.media[i].url }, caption: teks },
                                { quoted: m }
                            );
                            } else if (json.media[i].type == "jpg") {
                            anubis.sendMessage(
                                m.chat,
                                { image: { url: json.media[i].url }, caption: teks },
                                { quoted: m }
                            );
                            } else {
                            m.reply("command error, mohon lapor ke owner! ");
                            }
                        }
                    } else {
                        if (igreg[1] == 's' || igreg[2] == "highlights") {
                        let json = await igstory(text)
                        if (!json.status) return m.reply('Media error ngab! / cek urlnya!')
                        if (typeof json.anubis.url == 'undefined'){
                            if (json.user.is_verified == true) {
                                teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username} ✅\n*Full Name*: ${json.user.full_name}`;
                            } else {
                                teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username}\n*Full Name*: ${json.user.full_name}`;
                            }
                            for (let i = 0; i < json.media.length; i++) {
                                if (json.media[i].type == "mp4") {
                                anubis.sendMessage(
                                    m.chat,
                                    { video: { url: json.media[i].url }, caption: teks },
                                    { quoted: m }
                                );
                                } else if (json.media[i].type == "jpg") {
                                anubis.sendMessage(
                                    m.chat,
                                    { image: { url: json.media[i].url }, caption: teks },
                                    { quoted: m }
                                );
                                } else {
                                m.reply("command error, mohon lapor ke owner!");
                                }
                            }
                        } else {
                            time = moment
                                .unix(json.anubis.taken_at)
                                .format("DD-MM-YYYY HH:mm:ss");
                            if (json.user.is_verified == true) {
                                teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username} ✅\n*Full Name*: ${json.user.full_name}`;
                            } else {
                                teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username}\n*Full Name*: ${json.user.full_name}`;
                            }
                            teks += `\n*Upload at*: ${time}`;
                            if (!json.anubis.caption == "") {
                                teks += `\n*Caption*: ${json.anubis.caption}`;
                            }
                            if (json.anubis.type == "mp4") {
                            anubis.sendMessage(
                                m.chat,
                                { video: { url: json.anubis.url }, caption: teks },
                                { quoted: m }
                            );
                            } else if (json.anubis.type == "jpg") {
                            anubis.sendMessage(
                                m.chat,
                                { image: { url: json.anubis.url }, caption: teks },
                                { quoted: m }
                            );
                            } else {
                            m.reply("command error, mohon lapor ke owner!");
                            }
                        }
                        
                        } else {
                            let ig = await igjson(igreg[3]);
                            json = ig.data[Math.floor(Math.random() * ig.data.length)];
                            time = moment
                                .unix(json.post.taken_at)
                                .format("DD-MM-YYYY HH:mm:ss");
                                if (json.user.is_verified == true) {
                                teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username} ✅\n*Full Name*: ${json.user.full_name}`;
                            } else {
                                teks = `「 INSTAGRAM DOWNLOADER 」\n\n*Username*: ${json.user.username}\n*Full Name*: ${json.user.full_name}`;
                            }
                            teks += `\n*Upload at*: ${time}`;
                            if (!json.post.play_count == "")
                                teks += `\n*Play Count*: ${json.post.play_count}`;
                            teks += `\n*Type*: ${igreg[1]}`;
                            if (!json.post.caption == "") {
                                teks += `\n*Caption*: ${json.post.caption}`;
                            }
                            for (let i = 0; i < json.media.length; i++) {
                                if (json.media[i].type == "mp4") {
                                anubis.sendMessage(
                                    m.chat,
                                    { video: { url: json.media[i].url }, caption: teks },
                                    { quoted: m }
                                );
                                } else if (json.media[i].type == "jpg") {
                                anubis.sendMessage(
                                    m.chat,
                                    { image: { url: json.media[i].url }, caption: teks },
                                    { quoted: m }
                                );
                                } else {
                                m.reply("command error, mohon lapor ke owner!");
                                }
                            }
                        }
                    }
                } catch (e) {
                    m.reply("error bwang, coba cek urlnya!");
                    return console.log(e)
                }
            }
        break;
        case 'hago':
        case 'hg':
            {
                if (!isUrl(text)) return m.reply(`*Example* : ${usedPrefix + command} https://i-863.ihago.net/d/HtSJY1`)
                m.reply(mess.wait);
                let hago = await hagodl(text)
                if (!hago.status) return m.reply('Url Error ngab!')
                let pesen = `「 HAGO VIDEO DOWNLOADER 」\n\n*Nick* : ${hago.nick}`;
                pesen += `\n*Birth* : ${hago.birth}`;
                pesen += `\n*Tag Name* : ${hago.tag_name}`;
                pesen += `\n*Likes* : ${hago.likes}`;
                if (hago.text) pesen += `\n*Caption* : ${hago.text}`;
                if (hago.media[0].type == "mp4") {
                    anubis.sendMessage(
                        m.chat,
                        { video: { url: hago.media[0].url }, caption: pesen },
                        { quoted: m }
                    );
                } else if (hago.media[0].type == "jpg") {
                    for (let i = 0; i < hago.media[0].url.length; i++) {
                        anubis.sendMessage(
                            m.chat,
                            { image: { url: hago.media[0].url[i] }, caption: pesen },
                            { quoted: m }
                        );
                    }
                } else {
                    m.reply("url tidak mengandung media ngab!");
                }
            }
        break;
        case 'tiktok':
        case 'tt':
            {
                if (!text) return m.reply("Masukkan Query Link!");
                if (!isUrl(text)) return m.reply("coba cek lagi urlnya ngab!");
                m.reply(mess.wait)
                try {
                    let url = await urlDirect2(text);
                    if (/tiktok/.test(url)) {
                        let tt = await tiktok(url);
                        if (typeof tt.nowm !== 'string') return m.reply("Video tidak di temukan, coba cek urlnya\natau akun private!");
                        let teks = `「 TIKTOK DOWNLOADER 」\n\n*Username*: ${tt.name}\n*Caption*: ${tt.cap}`;
                        anubis.sendMessage(
                        m.chat,
                        { video: { url: tt.nowm }, caption: teks },
                            { quoted: m }
                        );
                    } else {
                        m.reply("URl  tidak valid, coba cek urlnya bwang!!!");
                    }
                } catch (e) {
                    m.reply("URl  tidak valid, coba cek urlnya bwang!!!");
                }
            }
        break;
        case 'jooxdl':
        case 'jooxdownloader':
            {
                if (!text) return m.reply(`Example : ${usedPrefix + command} anubis si paling cakep :v, ygy?!`);
                m.reply(mess.wait)
                try {
                    let json = await jooxDownloader(text)
                    if (!json.status) return m.reply(global.msg.err)
                    let media = json.anubis
                    anubis.sendImage(m.chat, media.imgSrc,`Title : ${media.msong}\nSinger : ${media.msinger}\nDurasi : ${media.duration}\nFile Size : ${media.size}\nPublic Time : ${media.public_time}\nExt : MP3\nResolusi : 128kbps`,m);
                    anubis.sendMessage(m.chat,{audio: { url: media.mp3Url },mimetype: "audio/mpeg",fileName: `${media.msong}.mp3`},{ quoted: m });
                } catch (err) {
                    console.log(err)
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
                    let json = await jooxSearch(text)
                    if (!json.status) return m.reply(global.msg.err)
                    let pesane = `Result for : *${text}*\n\n*Download video by click button bellow*`;
                    let rows = []
                    json.anubis.splice(json.anubis.length, json.anubis.length);
                    json.anubis.forEach((xres, i) => {
                        rows.push({ title: xres.name, description: `Artis List: ${xres.artis_list}\nDurasi: ${xres.duration}`, rowId: `${usedPrefix}jooxdl ${xres.id}`})
                    })
                    let secs = [
                        {
                            title: 'RESULT',
                            rows: rows
                        }
                    ]
                    anubis.sendList(m.chat, "*JOOX SEARCH*", pesane, 'RESULT', secs, {quoted: m})
                } catch (err) {
                    console.log(err)
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
                    let json = await soundcloud(text)
                    if (!json.status) return m.reply(global.msg.err)
                    let pesane = `Result for : *${text}*\n\n*Download video by click button bellow*`;
                    let rows = []
                    json.anubis.splice(json.anubis.length, json.anubis.length);
                    json.anubis.forEach((xres, i) => {
                        rows.push({ title: xres.title, description: `Full Name: ${xres.full_name}\nUsername: ${xres.username}\nLink SC: ${xres.user_url}\nGenre : ${xres.genre}\nCreated: ${xres.created_at}\nDurasi: ${xres.duration}\nComment Count: ${xres.comment_count}\nLike Count: ${xres.likes_count}\nPlay Count: ${xres.playback_count}\nRepost Count: ${xres.reposts_count}\nDescription: ${xres.description}`, rowId: `${usedPrefix}fetch ${xres.urlmp3}`})
                    })
                    let secs = [
                        {
                            title: 'RESULT',
                            rows: rows
                        }
                    ]
                    return anubis.sendList(m.chat, "*JOOX SEARCH*", pesane, 'RESULT', secs, {quoted: m})
                } catch (err) {
                    console.log(err)
                    return m.reply(global.msg.err)
                }
            }
        break;
    }
}
anuplug.help = ['instagram','hago','tiktok','jooxsearch','soundcloudsearch']
anuplug.tags = ['downloader']
anuplug.command = /^(ig|instagram|hago|hg|tiktok|tt|jooxdownloader|jooxdl|jooxsearch|jooxs|soundcloudsearch|scs)$/i

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