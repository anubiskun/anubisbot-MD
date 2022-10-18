/**
 * anubisbot-MD  https://github.com/anubiskun/anubisbot-MD
 *
 * Copyright (c) 2022 anubiskun
 * https://github.com/anubiskun
 */

const { y2mate, y2mateConvert, shortlink } = require("../library/lib");
const isUrl = require("is-url");

module.exports = anuplug = async (
  m,
  anubis,
  { text, command, args, usedPrefix }
) => {
  if (!text)
    return m.reply(
      `Example : ${
        usedPrefix + command
      } https://youtube.com/watch?v=PtFMh6Tccag`
    );
  switch (command) {
    case "ytdl":
    case "ytdla":
    case "ytdlv":
      {
        m.reply(mess.wait);
        try {
          if (!isUrl(text))
            return m.reply(
              `Example : ${
                usedPrefix + command
              } https://youtube.com/watch?v=PtFMh6Tccag`
            );
          const ytdl = await y2mate(text);
          if (!ytdl.status) return m.reply("Coba cek urlnya ngab!");

          let rowsmp3 = [];
          ytdl.audio.splice(ytdl.audio.length, ytdl.audio.length);
          ytdl.audio.forEach((anu, i) => {
            rowsmp3.push({
              title: anu.resText,
              description: `*Title*: ${anu.title}\n*Size*: ${anu.size}`,
              rowId: `${usedPrefix}getytdl ${encodeURIComponent(
                JSON.stringify(anu)
              )}`,
            });
          });
          let secsmp3 = [
            {
              title: "Audio Downloader",
              rows: rowsmp3,
            },
          ];

          let rowsmp4 = [];
          ytdl.video.splice(ytdl.video.length, ytdl.video.length);
          ytdl.video.forEach((anu, i) => {
            rowsmp4.push({
              title: anu.resText,
              description: `*Title*: ${anu.title}\n*Size*: ${anu.size}`,
              rowId: `${usedPrefix}getytdl ${encodeURIComponent(
                JSON.stringify(anu)
              )}`,
            });
          });
          let secsmp4 = [
            {
              title: "Video Downloader",
              rows: rowsmp4,
            },
          ];
          if (command == "ytdla") {
            return anubis.sendList(
              m.chat,
              "MENU",
              `[ YOUTUBE DL MP3 ]\n*Recommend pilih yang 128k*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`,
              "MENU",
              secsmp3,
              m
            );
          } else if (command == "ytdlv") {
            return anubis.sendList(
              m.chat,
              "MENU",
              `[ YOUTUBE DL MP4 ]\n*Recommend pilih yang 360p*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`,
              "MENU",
              secsmp4,
              m
            );
          } else if (command == "ytdl") {
            anubis.sendList(
              m.chat,
              "MENU",
              `[ YOUTUBE DL MP3 ]\n*Recommend pilih yang 128k*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`,
              "MENU",
              secsmp3,
              m
            );
            anubis.sendList(
              m.chat,
              "MENU",
              `[ YOUTUBE DL MP4 ]\n*Recommend pilih yang 360p*\n\nTitle: ${ytdl.title}\nDurasi: ${ytdl.duration}`,
              "MENU",
              secsmp4,
              m
            );
            return;
          } else {
            return m.reply("mau ngapain ngab!?");
          }
        } catch (err) {
          console.err(err);
          m.reply("error ngab! coba contact owner!");
        }
      }
      break;
    case "getytdl":
      {
        const media = JSON.parse(decodeURIComponent(text));
        let { url } = await y2mateConvert(
          media.id,
          media.ytid,
          media.type,
          media.quality
        );
        if (!isUrl(url))
          return m.reply("Download Error ngab! Coba contact Owner!");
        url = url.replace("https", "http");
        // m.reply(mess.wait)
        m.reply(`Mengirim media size:` + media.size);
        try {
          if (media.sizeByte >= 100000000)
            return anubis.sendImage(
              m.chat,
              media.thumb,
              `*FILE MELEBIHI BATAS SILAHKAN GUNAKAN LINK*\n\n*Title* : ${
                media.title
              }\n*File Size* : ${media.size}\n*Likes* : ${
                media.likes
              }\n*Dislike* : ${media.dislikes}\n*Rating* : ${
                media.rating
              }\n*Views* : ${media.viewCount}\n*Ext* : ${
                media.type
              }\n*Quality* : ${media.quality}\n*Link* : ${await shortlink(
                url
              )}`,
              m
            );
          if (media.type == "mp3") {
            anubis.sendImage(
              m.chat,
              media.thumb,
              `*[ YOUTUBE MP3 DOWNLOADER v2 ]*\n\n*Title* : ${media.title}\n*File Size* : ${media.size}\n*Likes* : ${media.likes}\n*Dislike* : ${media.dislikes}\n*Rating* : ${media.rating}\n*Views* : ${media.viewCount}\n*Ext* : ${media.type}\n*Quality* : ${media.quality}`,
              m
            );
            anubis.sendMessage(
              m.chat,
              {
                audio: { url: url },
                mimetype: "audio/mpeg",
                fileName: `${media.title}.mp3`,
              },
              { quoted: m }
            );
          } else {
            anubis.sendVideo(
              m.chat,
              url,
              `*[ YOUTUBE MP4 DOWNLOADER v2 ]*\n\n*Title* : ${media.title}\n*File Size* : ${media.size}\n*Likes* : ${media.likes}\n*Dislike* : ${media.dislikes}\n*Rating* : ${media.rating}\n*Views* : ${media.viewCount}\n*Ext* : ${media.type}\n*Quality* : ${media.quality}`,
              m,
              media.thumb
            );
          }
        } catch (err) {
          console.err(err);
          m.reply("command lagi error ngab!");
        }
      }
      break;
  }
};
anuplug.help = ["ytdl"];
anuplug.tags = ["downloader"];
anuplug.command = /^(ytdl(a|v)?|getytdl)$/i;
anuplug.isPremium = true;
