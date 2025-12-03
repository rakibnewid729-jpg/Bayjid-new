module.exports = {
  config: {
    name: "time",
    author: "BaYjid",
    version: "1.0",
    role: 0,
    shortDescription: "Current Time & Date",
    longDescription: "Shows the current time and date",
    category: "utility",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const now = new Date();

    const time = now.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = now.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    message.reply(`📅 Date: ${date}\n⏰ Time: ${time}`);
  }
};