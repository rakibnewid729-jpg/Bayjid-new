const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    author: "BaYjid",
    role: 0,
    shortDescription: "Pair with someone",
    longDescription: "Randomly pairs you with someone or with the person you mention",
    category: "love",
    guide: "{pn} or {pn} @mention"
  },

  onStart: async function ({ api, event, usersData }) {
    try {

      const pathImg = __dirname + "/tmp/background.png";
      const pathAvt1 = __dirname + "/tmp/Avtmot.png";
      const pathAvt2 = __dirname + "/tmp/Avthai.png";


      const id1 = event.senderID;
      const name1 = await usersData.getName(id1);


      let id2;
      if (Object.keys(event.mentions).length > 0) {

        id2 = Object.keys(event.mentions)[0];
      } else {

        const ThreadInfo = await api.getThreadInfo(event.threadID);
        const all = ThreadInfo.userInfo;
        const botID = api.getCurrentUserID();


        let gender1;
        for (let c of all) if (c.id == id1) gender1 = c.gender;

        let candidates = [];
        if (gender1 === "FEMALE") {
          candidates = all.filter(u => u.gender === "MALE" && u.id !== id1 && u.id !== botID);
        } else if (gender1 === "MALE") {
          candidates = all.filter(u => u.gender === "FEMALE" && u.id !== id1 && u.id !== botID);
        } else {
          candidates = all.filter(u => u.id !== id1 && u.id !== botID);
        }

        id2 = candidates[Math.floor(Math.random() * candidates.length)].id;
      }

      const name2 = await usersData.getName(id2);


      const rd1 = Math.floor(Math.random() * 100) + 1;
      const weirdValues = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
      const chances = Array(8).fill(rd1).concat(weirdValues);
      const tile = chances[Math.floor(Math.random() * chances.length)];


      const backgroundURL = "https://i.postimg.cc/5tXRQ46D/background3.png";


      const avt1 = (
        await axios.get(
          `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(pathAvt1, Buffer.from(avt1, "utf-8"));

      const avt2 = (
        await axios.get(
          `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(pathAvt2, Buffer.from(avt2, "utf-8"));


      const bg = (
        await axios.get(backgroundURL, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(pathImg, Buffer.from(bg, "utf-8"));


      const baseImage = await loadImage(pathImg);
      const baseAvt1 = await loadImage(pathAvt1);
      const baseAvt2 = await loadImage(pathAvt2);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseAvt1, 100, 150, 300, 300);
      ctx.drawImage(baseAvt2, 900, 150, 300, 300);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);


      return api.sendMessage(
        {
          body: `『💗』Congratulations @${name1} & @${name2}『💗』\n` +
                `『❤️』Looks like your destiny brought you together『❤️』\n` +
                `『🔗』Your link percentage is ${tile}%『🔗』`,
          mentions: [
            { tag: name1, id: id1 },
            { tag: name2, id: id2 }
          ],
          attachment: fs.createReadStream(pathImg),
        },
        event.threadID,
        event.messageID
      );
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ An error occurred while pairing!", event.threadID, event.messageID);
    }
  }
};