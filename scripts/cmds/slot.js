module.exports = {
  config: {
    name: "slot",
    version: "1.9",
    author: "BaYjid",
    shortDescription: {
      en: "🎰 Slot Game (30 spins daily)",
    },
    longDescription: {
      en: "Enjoy 30 spins every 24h with boosted jackpot chances. Flex your luck! 💎",
    },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "❌ Enter a valid number.",
      rolling_1: "🎲 Rolling the reels...",
      rolling_2: "⏳ Still spinning...",
      rolling_3: "🔥 Almost there!",
      win_message: "✨ You won $%1!",
      lose_message: "😢 You lost $%1.",
      jackpot_message: "💎 JACKPOT! Triple %2 → $%1",
      balance_message: "💰 Balance: $%1",
      spin_limit_reached: "⛔ 30 spins used. Try again in %1h %2m %3s.",
      spins_left: "🎮 Spins left: %1/30",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang, api }) {
    const { senderID, threadID } = event;
    const userData = await usersData.get(senderID);
    const bet = parseInt(args[0]);
    const now = Date.now();

    if (isNaN(bet) || bet <= 0) return message.reply(getLang("invalid_amount"));
    if (bet > userData.money) return;

    const spinData = userData.data?.slotSpin || { count: 0, resetTime: now };

    if (now - spinData.resetTime >= 86400000) {
      spinData.count = 0;
      spinData.resetTime = now;
    }

    if (spinData.count >= 30) {
      const wait = 86400000 - (now - spinData.resetTime);
      const h = Math.floor(wait / 3600000);
      const m = Math.floor((wait % 3600000) / 60000);
      const s = Math.floor((wait % 60000) / 1000);
      return message.reply(getLang("spin_limit_reached").replace("%1", h).replace("%2", m).replace("%3", s));
    }

    api.sendMessage(getLang("rolling_1"), threadID, async (err, info) => {
      if (err) return;

      setTimeout(() => {
        api.editMessage(getLang("rolling_2"), info.messageID, threadID);
      }, 1000);

      setTimeout(() => {
        api.editMessage(getLang("rolling_3"), info.messageID, threadID);
      }, 2000);

      setTimeout(async () => {
        const slots = ["🍒", "🍋", "💎", "💚", "⭐", "💛", "💙"];
        const [a, b, c] = Array(3).fill().map(() => weightedSlot(slots));

        const winnings = calculateWinnings(a, b, c, bet);
        const updatedBalance = userData.money + winnings;

        spinData.count++;

        await usersData.set(senderID, {
          money: updatedBalance,
          data: {
            ...userData.data,
            slotSpin: spinData,
          },
        });

        const visuals = `━━━━━━━━━━━━━━\n🎰 [ ${a} | ${b} | ${c} ] 🎰\n━━━━━━━━━━━━━━`;
        const resultMsg = getSpinResultMessage(a, b, c, winnings, getLang);
        const balanceMsg = getLang("balance_message").replace("%1", updatedBalance);
        const spinsLeft = getLang("spins_left").replace("%1", 30 - spinData.count);

        api.editMessage(`${visuals}\n${resultMsg}\n${balanceMsg}\n${spinsLeft}`, info.messageID, threadID);
      }, 3000);
    });
  },
};

function weightedSlot(slots) {
  const weights = {
    "💎": 3,
    "🍒": 5,
    "🍋": 5,
    "💚": 4,
    "⭐": 4,
    "💛": 4,
    "💙": 4,
  };

  const pool = [];
  for (const s of slots) {
    for (let i = 0; i < weights[s]; i++) pool.push(s);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function calculateWinnings(a, b, c, bet) {
  if (a === "💎" && b === "💎" && c === "💎") return bet * 20;
  if (a === b && b === c) return bet * 8;
  if (a === b || a === c || b === c) return bet * 4;
  return -Math.floor(bet * 0.1);
}

function getSpinResultMessage(a, b, c, win, getLang) {
  if (win > 0) {
    if (a === "💎" && b === "💎" && c === "💎") {
      return getLang("jackpot_message")
        .replace("%1", win)
        .replace("%2", "💎");
    }
    return getLang("win_message").replace("%1", win);
  } else {
    return getLang("lose_message").replace("%1", -win);
  }
}