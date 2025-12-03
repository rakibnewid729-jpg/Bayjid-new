const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "list",
    version: "3.0",
    author: "BaYjid",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Show all commands or details"
    },
    longDescription: {
      en: "Type 'list' to view all categorized commands\nType 'list <command>' to view details"
    },
    category: "info",
    guide: {
      en: "list\nlist <command>"
    },
    usePrefix: true,
    useChat: true
  },

  langs: {
    en: {
      header: "🪷 𝐇𝐞𝐥𝐩 𝐌𝐞𝐧𝐮 𝐛𝐲 𝐁𝐚𝐘 𝐣𝐢𝐝 🪷",
      categoryNoPrefix: "🧸 𝐍𝐨 𝐏𝐫𝐞𝐟𝐢𝐱 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 🧸",
      categoryPrefixOnly: "🌸 𝐏𝐫𝐞𝐟𝐢𝐱 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 🌸",
      empty: "🚫 𝐍𝐨 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲.",
      footer: "\n📌 𝐓𝐲𝐩𝐞 '𝐥𝐢𝐬𝐭 <𝐜𝐨𝐦𝐦𝐚𝐧𝐝>' 𝐟𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬!",
      notFound: "❗ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 '%1' 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!",
      detailTitle: "🔎 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐨𝐟 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 『 %1 』",
      name: "🔤 𝐍𝐚𝐦𝐞: %1",
      aliases: "🪻 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: %1",
      description: "📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: %1",
      role: "🔐 𝐑𝐨𝐥𝐞 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝: %1",
      guide: "📘 𝐔𝐬𝐚𝐠𝐞: %1",
      version: "📦 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: %1",
      noGuide: "🚫 𝐍𝐨 𝐮𝐬𝐚𝐠𝐞 𝐠𝐮𝐢𝐝𝐞 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞"
    }
  },

  onChat: async function ({ message, event, getLang }) {
    const text = event.body.trim();
    if (!text.toLowerCase().startsWith("list")) return;

    const args = text.split(/\s+/).slice(1);
    return module.exports.onStart({ message, args, getLang });
  },

  onStart: async function ({ message, args, getLang }) {
    if (args.length === 0) {
      const noPrefix = [], prefixOnly = [];

      const short = (name) => name.length > 10 ? name.slice(0, 7) + "..." : name;

      for (const [, cmd] of commands) {
        const cfg = cmd.config;
        const desc = cfg.shortDescription?.en || "No description";
        const info = `• ${short(cfg.name).padEnd(10)} ➤ ${desc}`;

        if (typeof cmd.onChat === "function") noPrefix.push(info);
        else prefixOnly.push(info);
      }

      function addBars(arr) {
        const res = [];
        for (let i = 0; i < arr.length; i++) {
          res.push(arr[i]);
          if ((i + 1) % 3 === 0 && i !== arr.length - 1) res.push("────────── 🐬");
        }
        return res.join("\n");
      }

      const msg = [
        getLang("header"),
        "",
        `${getLang("categoryNoPrefix")}\n${noPrefix.length ? addBars(noPrefix) : getLang("empty")}`,
        "",
        `${getLang("categoryPrefixOnly")}\n${prefixOnly.length ? addBars(prefixOnly) : getLang("empty")}`,
        getLang("footer")
      ].join("\n");

      return message.reply(msg);
    }

    // list <command>
    const name = args[0].toLowerCase();
    const cmd = commands.get(name) || commands.get(aliases.get(name));
    if (!cmd) return message.reply(getLang("notFound", name));

    const cfg = cmd.config;
    const getRole = (r) => ["Everyone", "Admin", "Bot Owner"][r] || `Role ${r}`;
    const msg = [
      getLang("detailTitle", cfg.name),
      "────────── 🐬",
      "",
      getLang("name", cfg.name || "N/A"),
      "",
      getLang("aliases", cfg.aliases?.join(", ") || "None"),
      "",
      getLang("description", typeof cfg.description === "object" ? cfg.description.en || "No description" : cfg.description || "No description"),
      "",
      getLang("role", getRole(cfg.role ?? 0)),
      "",
      getLang("guide", typeof cfg.guide === "object" ? (cfg.guide.en || getLang("noGuide")) : (cfg.guide || getLang("noGuide"))),
      "",
      getLang("version", cfg.version || "1.0"),
      "",
      "────────── 🐬"
    ].join("\n");

    return message.reply(msg);
  }
};