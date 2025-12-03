/**
 * @author BaYjid
 * @description 📚 Compact page-style categorized help menu (Malvina-style) with Developer role
 */

const { getPrefix } = global.utils || {};
const { commands, aliases } = global.GoatBot || {};
const PAGE_SIZE = 30; // 30 commands per page
const AUTO_UNSEND = 40 * 1000; // 40 seconds

module.exports = {
  config: {
    name: "help",
    version: "19.0",
    author: "BaYjid",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📚 Compact page-style help menu" },
    longDescription: { en: "💫 Displays commands grouped by category in compact page style" },
    category: "ℹ️ Info",
    guide: { en: "{pn}help [page|command]" }
  },

  onStart: async function ({ message, args, event, api }) {
    const prefix = getPrefix(event.threadID) || "!";
    const allCommands = Array.from(commands.values());
    let page = 1;

    // Detailed command info mode
    if (args[0] && isNaN(args[0])) {
      const name = args[0].toLowerCase();
      const cmd = commands.get(name) || commands.get(aliases.get(name));
      if (!cmd) return message.reply(`❌ Command "${name}" not found.`);

      const cfg = cmd.config;
      const role =
        cfg.role === 0 ? "🌍 Everyone" :
        cfg.role === 1 ? "👑 Group Admin" :
        cfg.role === 2 ? "🤖 Bot Admin" :
        cfg.role === 3 ? "💠 Developer" :
        "❓ Unknown";

      const sentMsg = await message.reply(
`╭──✦ [ Command: ${cfg.name.toUpperCase()} ]
├‣ 📜 Name: ${cfg.name}
├‣ 🪶 Aliases: ${cfg.aliases?.join("✧ ") || "None"}
├‣ 👤 Credits: ${cfg.author || "Unknown"}
╰‣ 🔑 Permission: ${role}

╭─✦ [ INFORMATION ]
├‣ 💰 Cost: Free
├‣ 📝 Description:
│   ${cfg.longDescription?.en || cfg.shortDescription?.en || "No description"}
╰‣ Guide: ${cfg.guide?.en || prefix + cfg.name}

╭─✦ [ SETTINGS ]
├‣ 🚩 Prefix Required: ${cfg.role === 0 ? "✓ Required" : "✗ Not Required"}
╰‣ ⚜ Premium: ${cfg.premium ? "✓ Yes" : "✗ Free to Use"}`
      );

      setTimeout(() => api.unsendMessage(sentMsg.messageID), AUTO_UNSEND);
      return;
    }

    // Pagination mode
    if (!isNaN(args[0])) page = parseInt(args[0]);
    const totalPages = Math.ceil(allCommands.length / PAGE_SIZE);
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const commandsPage = allCommands.slice(start, end);

    // Group commands by category
    const grouped = {};
    commandsPage.forEach(cmd => {
      const cat = cmd.config.category || "OTHER";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd.config.name);
    });

    // Build compact page-style message
    let msg = `✨ [ Guide For Beginners - Page ${page} ] ✨\n\n`;
    for (const cat of Object.keys(grouped)) {
      msg += `╭──── [ ${cat.toUpperCase()} ]\n`;
      msg += `│ ✧ ${grouped[cat].join("✧ ")}\n`;
      msg += `╰───────────────◊\n`;
    }

    // Footer with fancy admin font
    msg += `
╭─『 YOUR MALVINA BOT 』
╰‣ Total commands: ${allCommands.length}
╰‣ Page ${page} of ${totalPages}
╰‣ A Personal Facebook Bot
╰‣ ADMIN: 𝐁𝐚𝐘𝐣𝐢𝐝
╰‣ If you Don't know how to use commands Then Type ${prefix}help [commandName] to see command usages`;

    const sentMsg = await message.reply(msg);

    // Auto unsend
    setTimeout(() => api.unsendMessage(sentMsg.messageID), AUTO_UNSEND);
  }
};