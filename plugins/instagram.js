const isUrl = require('is-url');
const {iggetid, igjson} = require('../library/lib')
const moment = require('moment-timezone')

module.exports = anuplug = async(m, { anubis, text, command, args, usedPrefix }) => {
    let igPreg =
    /(?:https?:\/\/)?(?:www.)?instagram.com\/?(?:[a-zA-Z0-9\.\_\-]+)?\/((?:[p]+)?(?:[reel]+)?(?:[tv]+)?(?:[stories]+)?)\/([a-zA-Z0-9\-\_\.]+)\/?([0-9]+)?/g;
if (!text) return m.reply("No Query Url!");
if (!isUrl(text)) return m.reply("coba cek lagi urlnya ngab!!!!!!!!!!");
let igreg = igPreg.exec(text);
m.reply(mess.wait);
if (igreg[1] == "s") return m.reply("link/url tidak support. Untuk info hubungi owner!")
try {
    if (igreg[1] != "stories") {
    let getid = await iggetid(igreg[2]);
    if (!getid.status) return m.reply('id media gaada ngab!, cek ulang deh urlnya ngab!')
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
    if (igreg[2] == "highlights") return m.reply("*Download ig highlights belum support bwang!*");
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
} catch (e) {
    m.reply("error bwang, coba cek urlnya!");
    return console.log(e)
}
}
anuplug.help = ['instagram']
anuplug.tags = ['downloader']
anuplug.command = /^(ig|instagram)/i

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