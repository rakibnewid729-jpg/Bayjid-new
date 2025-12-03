module.exports = {
  config: {
    name: "dice",
    version: "1.3",
    author: "BaYjid",
    shortDescription: {
      en: "🎲 Dice duel with editable rolling msg — no limits",
    },
    longDescription: {
      en: "Roll a die vs bot as many times as you want. No cooldowns, just pure gambling.",
    },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "❌ Type a valid bet amount.",
      win: "🔥 You rolled %1 vs bot’s %2 — you win $%3!",
      lose: "💀 You rolled %1 vs bot’s %2 — you lost $%3.",
      draw: "😐 Both rolled %1 — it’s a tie. Your money is safe.",
      balance: "💰 Balance: $%1",
      rolling: "🎲 Rolling the dice...",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply(getLang("invalid_amount"));
    if (bet > userData.money) return;

    // No limit logic here — just roll
    let rollingMsg;
    if (typeof message.send === "function") {
      rollingMsg = await message.send(getLang("rolling"));
    } else {
      rollingMsg = await message.reply(getLang("rolling"));
    }

    const userRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;
    let newBalance = userData.money;
    let resultText = "";

    if (userRoll > botRoll) {
      newBalance += bet;
      resultText = getLang("win")
        .replace("%1", userRoll)
        .replace("%2", botRoll)
        .replace("%3", bet);
    } else if (userRoll < botRoll) {
      newBalance -= bet;
      resultText = getLang("lose")
        .replace("%1", userRoll)
        .replace("%2", botRoll)
        .replace("%3", bet);
    } else {
      resultText = getLang("draw").replace(/%1/g, userRoll);
    }

    await usersData.set(senderID, {
      money: newBalance,
      data: {
        ...userData.data,
        // no diceDuel data needed anymore
      },
    });

    const balanceText = getLang("balance").replace("%1", newBalance);
    const finalMsg = `${resultText}\n${balanceText}`;

    setTimeout(() => {
      if (rollingMsg && typeof rollingMsg.edit === "function") {
        rollingMsg.edit(finalMsg);
      } else {
        message.reply(finalMsg);
      }
    }, 1000);
  },
};