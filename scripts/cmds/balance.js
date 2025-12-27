module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "money"],
    version: "2.6",
    author: "BaYjid",
    countDown: 5,
    role: 0,
    shortDescription: "Check & manage balance",
    longDescription: `💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 Command 💰

Use this command to:
- View your balance: .bal
- View another user's balance: .bal @username or reply to their message
- Add, set, or remove balance (admins only): .bal add/set/remove <amount> [@user]
- Transfer money to others: .bal transfer/-t <amount> @username
- View transaction history: .bal history
- View your rank: .bal rank
- View top 15 richest users: .bal top

Features:
- Automatic fallback name if user's name not found
- Transaction history up to last 50 operations
- Supports mentions and message replies
- Properly formatted large numbers (K/M/B/T)
- Works for both normal users and admin actions`,
    category: "economy"
  },

  onStart: async function ({ args, message, event, usersData, api }) {
    const senderID = event.senderID;

    // ===== FORMAT MONEY =====
    function formatMoney(num) {
      if (!num || isNaN(num)) return "0";
      if (num >= 1e12) return (num / 1e12).toFixed(1) + "𝐓";
      if (num >= 1e9) return (num / 1e9).toFixed(1) + "𝐁";
      if (num >= 1e6) return (num / 1e6).toFixed(1) + "𝐌";
      if (num >= 1e3) return (num / 1e3).toFixed(1) + "𝐊";
      return Math.floor(num).toString();
    }

    // ===== GET TARGET UID =====
    let targetID = senderID;
    if (event.messageReply) targetID = event.messageReply.senderID;
    else if (Object.keys(event.mentions || {}).length > 0) targetID = Object.keys(event.mentions)[0];

    // ===== GET USER DATA =====
    async function getUserData(uid) {
      let data = await usersData.get(uid);
      const name = await usersData.getName(uid) || "User";
      if (!data) {
        data = { money: 0, history: [], name };
        await usersData.set(uid, data);
      }
      if (!data.history) data.history = [];
      if (!data.name) data.name = name;
      return data;
    }

    // ===== SAVE HISTORY =====
    async function saveHistory(uid, type, amount, fromTo) {
      const data = await getUserData(uid);
      const timestamp = new Date().toLocaleString();
      data.history.unshift({ type, amount, fromTo, timestamp });
      if (data.history.length > 50) data.history = data.history.slice(0,50);
      await usersData.set(uid, data);
    }

    const sub = args[0] ? args[0].toLowerCase() : null;

    // ===== VIEW BALANCE =====
    if (!sub) {
      const data = await getUserData(targetID);
      return message.reply(
        `👋 𝐇𝐞𝐲!\n💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 of ${data.name}: $${formatMoney(data.money)}`
      );
    }

    // ===== ADMIN CHECK =====
    const isAdmin = global.GoatBot.config.adminBot.includes(senderID);

    // ===== ADD / SET / REMOVE =====
    if (["add","set","remove"].includes(sub)) {
      if (!isAdmin) return message.reply("🚫 Admin only command!");
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return message.reply("❌ Invalid amount!");
      const data = await getUserData(targetID);
      const typeText = sub.toUpperCase();
      if (sub === "set") data.money = amount;
      if (sub === "add") data.money += amount;
      if (sub === "remove") data.money = Math.max(0, data.money - amount);
      await usersData.set(targetID, data);
      await saveHistory(targetID, typeText, amount, isAdmin ? "Admin Action" : "Self");
      return message.reply(`✅ ${data.name} balance: $${formatMoney(data.money)}`);
    }

    // ===== TRANSFER =====
    if (sub === "transfer" || sub === "-t") {
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount!");
      if (targetID === senderID) return message.reply("❌ Can't transfer to yourself!");
      const senderData = await getUserData(senderID);
      if (senderData.money < amount) return message.reply("❌ Not enough balance!");
      const targetData = await getUserData(targetID);
      senderData.money -= amount;
      targetData.money += amount;
      await usersData.set(senderID, senderData);
      await usersData.set(targetID, targetData);
      await saveHistory(senderID, "TRANSFER OUT", amount, `To ${targetData.name}`);
      await saveHistory(targetID, "TRANSFER IN", amount, `From ${senderData.name}`);
      return message.reply(
        `💸 Transfer Success!\n➡️ To: ${targetData.name}\n💰 Amount: $${formatMoney(amount)}`
      );
    }

    // ===== TOP LIST =====
    if (sub === "top") {
      const all = await usersData.getAll();
      const list = [];
      for (const uid in all) {
        const money = all[uid]?.money;
        if (!money || money <= 0) continue;
        const name = all[uid]?.name || await usersData.getName(uid) || "User";
        list.push({ name, money });
      }
      list.sort((a, b) => b.money - a.money);
      const top = list.slice(0, 15);
      let msg = "🏆 𝐓𝐨𝐩 𝟏𝟓 𝐑𝐢𝐜𝐡𝐞𝐬𝐭 𝐔𝐬𝐞𝐫𝐬:\n\n";
      top.forEach((u, i) => {
        msg += `${i + 1}. ${u.name}: $${formatMoney(u.money)}\n`;
      });
      return message.reply(msg);
    }

    // ===== RANK =====
    if (sub === "rank") {
      const all = await usersData.getAll();
      const sorted = Object.values(all).map(d => d?.money || 0).sort((a,b) => b - a);
      const myMoney = (await getUserData(senderID)).money;
      const rank = sorted.indexOf(myMoney) + 1;
      return message.reply(`📊 Your Rank: #${rank}\n💰 $${formatMoney(myMoney)}`);
    }

    // ===== HISTORY =====
    if (sub === "history") {
      const data = await getUserData(targetID);
      if (!data.history || data.history.length === 0) return message.reply("🧾 No history found.");
      let msg = `🧾 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 𝐇𝐢𝐬𝐭𝐨𝐫𝐲 of ${data.name}:\n\n`;
      data.history.slice(0,20).forEach((h,i) => {
        msg += `${i+1}. [${h.timestamp}] ${h.type} $${formatMoney(h.amount)} (${h.fromTo})\n`;
      });
      return message.reply(msg);
    }

  }
};