const axios = require("axios");

module.exports = {
  config: {
    name: "info",
    aliases: ["owner", "dev", "creator"],
    version: "5.0",
    author: "BaYjid",
    role: 0,
    shortDescription: {
      en: "Bot owner info with Date Note style"
    },
    longDescription: {
      en: "Displays owner info with styled title and fonts only."
    },
    category: "Info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const ownerID = "100001781964895";

    // Check for unauthorized author change
    if (this.config.author !== "BaYjid") {
      await api.sendMessage(
        `⚠️ Warning! The command "info" was run but author has been changed from "BaYjid" to "${this.config.author}". Possible unauthorized modification!`,
        ownerID
      );

      return api.sendMessage(
        "❌🦈 fu*c*k you! This command is protected and author mismatch detected. Command will not run.",
        event.threadID
      );
    }

    // Owner info
    const joinDate = "01-01-2023";
    const botVersion = "v4.5.2";
    const website = "https://xass-api.vercel.app/";
    const contact = "+8801638007072";

    const ownerName = "𝐁𝐚𝐘𝐣𝐢𝐝";
    const title = "𝗖𝘂𝗿𝘀𝗲𝗱 𝗖𝗼𝗱𝗲 𝗠𝗮𝘀𝘁𝗲𝗿";
    const teamName = "𝘛𝘦𝘢𝘮 𝘕𝘰𝘰𝘣𝘴";
    const specialNote = "𝗖𝗼𝗱𝗲 𝘄𝗶𝘁𝗵 𝗵𝗼𝗻𝗼𝗿, 𝗳𝗶𝗴𝗵𝘁 𝘄𝗶𝘁𝗵 𝗵𝗲𝗮𝗿𝘁.";

    const ownerInfo = 
`𝐗𝐀𝐒𝐒 𝐁𝐚𝐘 𝐣𝐢𝐝
━━━━━━━━━━━━━━━━
👤 Name        : ${ownerName} (Itadori Yuji)
🧠 Title       : ${title}
🛠️ Skills      : JavaScript, Bots, UI Sorcery
🎌 From        : 🇧🇩 Bangladesh

🗓️ Join Date   : ${joinDate}
🆚 Version     : ${botVersion}
🔗 Website     : ${website}
📞 Contact     : ${contact}
🎮 Favorite Tech : Node.js, React, AI Bots

🔗 Facebook    : fb.com/BAYJID.900
📧 Email       : saxxbayjid@gmail.com

🔮 Motto       : "${specialNote}"
━━━━━━━━━━━━━━━━
🔥 Team        : ${teamName} 🚀
━━━━━━━━━━━━━━━━`;

    try {
      const response = await axios({
        method: 'GET',
        url: "https://i.imgur.com/xC3Z0rg.jpeg",
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
      });

      await api.sendMessage({ body: ownerInfo, attachment: response.data }, event.threadID);
    } catch (err) {
      console.error("Failed to fetch image:", err);
      await api.sendMessage(ownerInfo, event.threadID); // fallback: send only text
    }
  }
};