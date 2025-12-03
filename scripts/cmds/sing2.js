const axios = require('axios');
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const { GoatWrapper } = require("fca-liane-utils");
const { performance } = require('perf_hooks');

function getVideoID(url) {
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  const match = url.match(checkurl);
  return match ? match[1] : null;
}

module.exports = {
  config: {
    name: "sing2",
    version: "1.0.2",
    author: "BaYjid",
    usePrefix: false,
    category: "🎵 Youtube Song Downloader",
    description: { en: "Play or download YouTube music by just typing song name or link." }
  },

  onStart: async ({ message, args }) => {
    try {
      if (!args || !args.length) return message.reply("❌ Please type a song name or YouTube link!");

      let videoID;
      if (args[0].includes("youtube.com") || args[0].includes("youtu.be")) {
        videoID = getVideoID(args[0]);
        if (!videoID) return message.reply("❌ Invalid YouTube link.");
      } else {
        const songName = args.join(" ");
        const search = await yts(songName);
        if (!search.videos.length) return message.reply("❌ Song not found.");
        videoID = search.videos[0].videoId;
      }

      const tempFilePath = path.join(__dirname, "temp_audio.mp3");
      const start = performance.now();

      const { data } = await axios.get(`https://www.noobs-api.top/dipto/ytDl3?link=${videoID}&format=mp3`);
      if (!data.downloadLink) return message.reply("❌ Failed to get download link.");

      const writer = fs.createWriteStream(tempFilePath);
      const audioResponse = await axios({ url: data.downloadLink, method: "GET", responseType: "stream" });
      audioResponse.data.pipe(writer);
      await new Promise((resolve, reject) => { writer.on("finish", resolve); writer.on("error", reject); });

      const timeTaken = ((performance.now() - start) / 1000).toFixed(2);

      const styledMessage = `
╔════════════════╗
      🎶 Now Playing 🎶
╚════════════════╝

🎧 Title   : ${data.title}
💽 Quality : ${data.quality}
⏱ Time    : ${timeTaken}s

By —͟͟͞͞💜َ 𝐁𝐚𝐘 𝐣𝐢𝐝-: )•⊰𝟑
`;

      await message.reply({ body: styledMessage, attachment: fs.createReadStream(tempFilePath) });
      fs.unlink(tempFilePath, () => {});
    } catch (err) {
      console.error(err);
      message.reply(`❌ Error: ${err.message}`);
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });