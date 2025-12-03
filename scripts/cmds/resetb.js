function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  config: {
    name: "rb",
    version: "1.0",
    author: "BaYjid",
    role: 2,
    shortDescription: { en: "Reset balance of specific user(s) by UID" },
    longDescription: { en: "Reset money and bank of given UID(s) to a specific amount" },
    category: "admin",
    guide: { en: "{pn} [UID1,UID2,...] [amount]\nExample: {pn} 100012345678901 50000" }
  },

  onStart: async function ({ usersData, message, event, args }) {
    const botAdmins = global.GoatBot?.config?.adminBot || [];
    const senderID = event.senderID;

    // 🔒 Prevent unauthorized change of author name
    if (module.exports.config.author !== "BaYjid") {
      return message.reply("❌ Author name mismatch. Command locked for protection.");
    }

    // Parse arguments
    if (!args[0]) return message.reply("❌ Please provide UID(s).");
    const uids = args[0].split(",").map(id => id.trim());
    const amount = parseInt(args[1]) || 100000; // default 100,000
    if (amount < 0) return message.reply("❌ Amount must be positive.");

    // Check permissions
    const allUsers = await usersData.getAll();
    const authorUser = allUsers.find(user => user.name === "BaYjid");
    const authorUID = authorUser?.userID;
    if (!botAdmins.includes(senderID) && senderID !== authorUID) {
      return message.reply("❌ Only BaYjid or bot admins can use this command.");
    }

    let count = 0;

    for (const uid of uids) {
      const user = allUsers.find(u => u.userID === uid);
      if (!user) continue;

      await usersData.set(uid, { money: amount, bank: amount });
      count++;
      await delay(30); // slight delay to prevent DB overload
    }

    return message.reply(`✅ Successfully reset balance for ${count} user(s) to ${amount.toLocaleString()}💵 each.`);
  }
};