const fs = require("fs-extra");
const path = __dirname + "/cache/lastActive.json";

module.exports.config = {
  name: "inactive",
  version: "1.1",
  author: "BaYjid",
  countDown: 5,
  role: 0,
  description: "Warns members if they’ve been inactive for 2 days",
  category: "auto",
};

if (!fs.existsSync(path)) fs.writeJsonSync(path, {});

module.exports.handleEvent = async function ({ event }) {
  const { threadID, senderID, body } = event;
  if (!body) return;

  let data = fs.readJsonSync(path);
  if (!data[threadID]) data[threadID] = {};
  data[threadID][senderID] = Date.now();
  fs.writeJsonSync(path, data);
};

module.exports.onLoad = function ({ api }) {
  setInterval(async () => {
    const data = fs.readJsonSync(path);
    const now = Date.now();
    const threshold = 2 * 24 * 60 * 60 * 1000; // 2 days

    for (const threadID in data) {
      const users = data[threadID];
      for (const userID in users) {
        const lastActive = users[userID];
        if (now - lastActive > threshold) {
          api.sendMessage({
            body: `⚠️ <@${userID}> has been inactive for 2 days! Please say something or you might be removed.`,
            mentions: [{ id: userID, tag: "inactive user" }],
          }, threadID);
        }
      }
    }
  }, 60 * 60 * 1000); // every hour
};

module.exports.onStart = async function ({ api, event }) {
  return api.sendMessage("✅ This module runs in the background. No command needed.", event.threadID);
};