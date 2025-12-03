module.exports = {
  config: {
    name: "ping",
    version: "1.0.1",
    author: "BaYjid",
    countDown: 5,
    role: 0,
    shortDescription: "Ping 📶",
    longDescription: "Check bot response speed with style",
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const start = Date.now();
    const msg = await message.reply("📡 Checking...");

    const ping = Date.now() - start;

    let status;
    if (ping < 100) status = "⚡ Ultra Fast!";
    else if (ping < 200) status = "🚀 Good Speed";
    else if (ping < 400) status = "🐢 Bit Slow";
    else status = "💀 Lagging badly!";

    const styledMessage = 
`╭──[ ⚙️ 𝗣𝗜𝗡𝗚 𝗖𝗛𝗘𝗖𝗞 ]──╮
│
│   📍 𝗣𝗜𝗡𝗚: ${ping} ms
│   📶 𝗦𝗧𝗔𝗧𝗨𝗦: ${status}
│
╰───────────────╯`;

    message.reply(styledMessage);
  }
};