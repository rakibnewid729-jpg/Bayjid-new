const { GoatWrapper } = require("fca-liane-utils");
const { config } = global.GoatBot;
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sing",
    version: "1.2.0",
    author: "BaYjid",
    usePrefix: false,
    category: "🎵 Youtube Song Downloader",
    description: {
      en: "Search and download short YouTube songs (under 10 mins)"
    }
  },

  onStart: async ({ event, api, args, message }) => {
    try {
      const query = args.join(" ");
      if (!query) return message.reply("❌ Please provide a song name or keyword!");

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // 🔍 Search videos
      const searchUrl = `https://www.noobs-api.top/dipto/ytFullSearch?songName=${encodeURIComponent(query)}`;
      const searchResponse = await axios.get(searchUrl);

      // ⏱ Parse time
      const parseDuration = (timestamp) => {
        const parts = timestamp.split(":").map((x) => parseInt(x));
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return 0;
      };

      // 🎵 Filter short videos
      const filtered = searchResponse.data.filter((video) => {
        try {
          return parseDuration(video.time) < 600;
        } catch {
          return false;
        }
      });

      if (!filtered.length) return message.reply("⭕ No short videos found (under 10 minutes)!");

      const video = filtered[0];
      const tempPath = path.join(__dirname, "temp_audio.mp3");

      // 🎧 Download audio using fixed API
      const apiResponse = await axios.get(
        `https://www.noobs-api.top/dipto/ytDl3?link=${video.id}&format=mp3`
      );

      if (!apiResponse.data.downloadLink)
        throw new Error("⚠️ No audio URL found in response");

      const audioStream = await axios({
        url: apiResponse.data.downloadLink,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(tempPath);
      audioStream.data.pipe(writer);

      await new Promise((res, rej) => {
        writer.on("finish", res);
        writer.on("error", rej);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const styledMessage = `
╔════════════════╗
      🎶 Now Playing 🎶
╚════════════════╝

🎧 Title   : ${video.title}
⏱ Duration : ${video.time}
📺 Channel : ${video.channel?.name || "Unknown"}

By —͟͟͞͞💜َ 𝐁𝐚𝐘 𝐣𝐢𝐝-: )•⊰𝟑
`;

      await message.reply({
        body: styledMessage,
        attachment: fs.createReadStream(tempPath)
      });

      fs.unlink(tempPath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    } catch (err) {
      console.error(err);
      message.reply(`❌ Error: ${err.message}`);
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });