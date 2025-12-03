/**
 * @author BaYjid
 * @description Auto-leave group if another bot detected. ON/OFF toggle system.
 * @version 1.4
 */

const fs = require("fs");
const path = require("path");
const dataPath = path.join(__dirname, "otherbot_data.json");

if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({}), "utf8");

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(dataPath, "utf8")) || {};
  } catch {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "otherbot",
    version: "1.4",
    author: "BaYjid",
    countDown: 5,
    role: 2, // Admin-only
    shortDescription: { en: "Toggle auto leave when another bot detected" },
    longDescription: { en: "Detects other bots and leaves group automatically. Toggle per group." },
    category: "system",
    guide: { en: "{pn} [on/off/status]" }
  },

  onStart: async ({ api, event, args }) => {
    const threadID = event.threadID;
    const data = loadData();
    if (!data[threadID]) data[threadID] = { enabled: false };

    const input = args[0]?.toLowerCase();
    if (input === "on") {
      data[threadID].enabled = true;
      saveData(data);
      return api.sendMessage("✅ OtherBot auto-leave is now ON for this group.", threadID);
    }

    if (input === "off") {
      data[threadID].enabled = false;
      saveData(data);
      return api.sendMessage("⛔ OtherBot auto-leave is now OFF for this group.", threadID);
    }

    if (input === "status") {
      const status = data[threadID].enabled ? "🟢 ON" : "🔴 OFF";
      return api.sendMessage(`📊 OtherBot auto-leave status: ${status}`, threadID);
    }

    return api.sendMessage("⚙️ Usage: otherbot [on/off/status]", threadID);
  },

  handleEvent: async ({ api, event }) => {
    const threadID = event.threadID;
    const data = loadData();
    if (!data[threadID] || !data[threadID].enabled) return;

    try {
      const info = await api.getThreadInfo(threadID);
      const myID = api.getCurrentUserID();

      // Detect users with "bot" in name (except self)
      const bots = info.userInfo.filter(u => /bot/i.test(u.name) && u.id !== myID);

      if (bots.length > 0) {
        const botNames = bots.map(b => b.name).join(", ");
        await api.sendMessage(
          `⚠️ Detected another bot in this group: ${botNames}\n🚪 Leaving now...`,
          threadID
        );

        // Leave safely, with await
        await api.removeUserFromGroup(myID, threadID).catch(err => {
          console.error("Failed to leave group:", err);
          api.sendMessage("❌ I cannot leave. Make sure I am an admin.", threadID);
        });
      }
    } catch (err) {
      console.error("OtherBot auto-leave error:", err);
    }
  }
};