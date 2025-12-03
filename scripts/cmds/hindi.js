const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "malvi",
    version: "1.1",
    author: "BaYjid",
    countDown: 3,
    role: 0,
    category: "audio",
    shortDescription: {
      en: "Malvi style voice reply — asli desi swag"
    },
    guide: {
      en: "{pn} <chat text>\nExample: {pn} bhai Malvi bol ke de de"
    }
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ").trim();

    if (!query) {
      return message.reply("Malvi: ‘का बोले रे? बात कर तो सही!’ (Bhai, kuch bolne ka mann hai kya?)");
    }

    try {
      const apiUrl = `https://bayjid-anya-api.onrender.com/anya?chat=${encodeURIComponent(query)}&to=hi`;
      const res = await axios.get(apiUrl);

      const { original, translated, tts_url } = res.data;

      if (!tts_url) {
        return message.reply("Malvi: ‘अरे यार, आवाज़ नहीं मिली, बाद में ट्राई कर।’ (Voice to nahi mili, thoda ruk ja bhai)");
      }

      const audioStream = await getStreamFromURL(tts_url, "malvi_voice.mp3");

      return message.reply({
        body: `🎙️ *Malvi ka jawab:*\n\n> ${translated || original}\n\nधांसू जवाब भाई, full desi!`,
        attachment: audioStream
      });

    } catch (err) {
      console.error(err);
      return message.reply("Malvi: ‘कुछ तो गड़बड़ है, आवाज़ खो गई रे!’ (Bhai, kuch gadbad ho gaya, try kar fir!)");
    }
  }
};