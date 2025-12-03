const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair3",
    aliases: ["love", "ship"],
    version: "1.0",
    author: "BaYjid",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Find a love pair 💞",
      bn: "ভালোবাসার জুটি খুঁজে দেয় 💞"
    },
    longDescription: {
      en: "Make a random or targeted love pairing between two group members.",
      bn: "গ্রুপের দুইজনের মধ্যে র‍্যান্ডম বা টার্গেটেড লভ পেয়ার বানায়।"
    },
    category: "fun",
    guide: {
      en: "{pn} [@mention | reply] → Pair with someone\n{pn} → Random opposite gender pair",
      bn: "{pn} [@mention | reply] → কারো সাথে জুটি বানাও\n{pn} → র‍্যান্ডম বিপরীত লিঙ্গের জুটি"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderData = await usersData.get(event.senderID);
      if (!senderData?.name) {
        return api.sendMessage("❌ Could not fetch your profile info.", event.threadID, event.messageID);
      }
      const senderName = senderData.name;

      let targetUserID;

      // 1️⃣ If reply → take reply user
      if (event.messageReply?.senderID) {
        targetUserID = event.messageReply.senderID;
      }
      // 2️⃣ If mention → take first mention
      else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetUserID = Object.keys(event.mentions)[0];
      }

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      let matchName, selectedMatchID;

      if (targetUserID) {
        const targetData = users.find((u) => u.id == targetUserID);
        if (!targetData?.name) {
          return api.sendMessage("❌ Could not fetch target user's info.", event.threadID, event.messageID);
        }
        matchName = targetData.name;
        selectedMatchID = targetUserID;
      } else {
        // random pairing by opposite gender
        const myData = users.find((u) => u.id == event.senderID);
        const myGender = myData?.gender?.toLowerCase();

        if (!myGender || !["male", "female"].includes(myGender)) {
          return api.sendMessage("⚠ Could not determine your gender.", event.threadID, event.messageID);
        }

        const targetGender = myGender === "male" ? "female" : "male";
        const candidates = users.filter(
          (u) => u.id !== event.senderID && u.gender?.toLowerCase() === targetGender
        );

        if (candidates.length === 0) {
          return api.sendMessage("❌ No suitable match found in this group.", event.threadID, event.messageID);
        }

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        matchName = chosen.name;
        selectedMatchID = chosen.id;
      }

      // 🎨 Canvas part
      const width = 800, height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Random background
      const bgs = [
        "https://i.imgur.com/OntEBiq.png",
        "https://i.imgur.com/IYCoZgc.jpeg",
        "https://i.imgur.com/753i3RF.jpeg"
      ];
      const bg = await loadImage(bgs[Math.floor(Math.random() * bgs.length)]);
      ctx.drawImage(bg, 0, 0, width, height);

      // Helper: fetch avatar
      const getAvatar = async (uid) => {
        try {
          return await loadImage(
            `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
          );
        } catch {
          return await loadImage("https://i.imgur.com/QrAz3XU.png");
        }
      };

      const senderAvatar = await getAvatar(event.senderID);
      const matchAvatar = await getAvatar(selectedMatchID);

      ctx.drawImage(senderAvatar, 385, 40, 170, 170);
      ctx.drawImage(matchAvatar, width - 213, 190, 180, 170);

      // save canvas
      const imgPath = path.join(__dirname, "pair.png");
      const out = fs.createWriteStream(imgPath);
      canvas.createPNGStream().pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70; // 70–100%

        const msg = `💖 𝗣𝗮𝗶𝗿𝗶𝗻𝗴 𝗦𝘂𝗰𝗰𝗲𝘀𝘀 💖
✨ ${senderName}
✨ ${matchName}
💌 𝗪𝗶𝘀𝗵 𝘆𝗼𝘂 𝟭𝟬𝟬 𝘆𝗲𝗮𝗿𝘀 𝗼𝗳 𝗵𝗮𝗽𝗽𝗶𝗻𝗲𝘀𝘀 ❤

❤️ 𝗟𝗼𝘃𝗲 𝗣𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${lovePercent}%`;

        api.sendMessage(
          { body: msg, attachment: fs.createReadStream(imgPath) },
          event.threadID,
          () => fs.unlinkSync(imgPath),
          event.messageID
        );
      });
    } catch (e) {
      console.error("❌ Pairing error:", e);
      api.sendMessage("❌ Error: " + e.message, event.threadID, event.messageID);
    }
  }
};