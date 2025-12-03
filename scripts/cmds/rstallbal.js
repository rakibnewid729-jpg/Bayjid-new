function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  config: {
    name: "rab",
    version: "1.2",
    author: "BaYjid",
    role: 2,
    shortDescription: {
      en: "Reset all user balances"
    },
    longDescription: {
      en: "Set all users' money and bank to 0 with delay to prevent timeout"
    },
    category: "admin",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ usersData, message, event }) {
    const botAdmins = global.GoatBot?.config?.adminBot || [];
    const senderID = event.senderID;

    // 🔒 Prevent unauthorized change of author name
    if (module.exports.config.author !== "BaYjid") {
      return message.reply("❌ Author name mismatch. Command locked for protection.");
    }

    try {
      const allUsers = await usersData.getAll();

      // 🔐 Check if sender is BaYjid or a bot admin
      const authorUser = allUsers.find(user => user.name === "BaYjid");
      const authorUID = authorUser?.userID;

      if (!botAdmins.includes(senderID) && senderID !== authorUID) {
        return message.reply("❌ Only BaYjid or bot admins can use this command.");
      }

      let count = 0;

      for (const user of allUsers) {
        const uid = user.userID;
        if (!uid) continue;

        await usersData.set(uid, {
          money: 0,
          bank: 0
        });

        count++;
        await delay(30); // Slight delay to prevent DB overload
      }

      return message.reply(`✅ Successfully reset balance for ${count} users.`);
    } catch (err) {
      console.error("❌ Reset Error:", err);
      return message.reply("❌ Error occurred during reset.");
    }
  }
};