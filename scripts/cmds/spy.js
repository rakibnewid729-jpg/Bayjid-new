module.exports = {
  config: {
    name: "spy",
    version: "1.0",
    author: "BaYjid",
    countDown: 60,
    role: 0,
    shortDescription: "Get user info & avatar",
    longDescription: "Fetch detailed user information and avatar by mention, UID, or profile link.",
    category: "image"
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      let uid;
      const senderID = event.senderID;
      const mentionID = Object.keys(event.mentions)[0];

      // UID detection from arguments
      if (args[0]) {
        if (/^\d+$/.test(args[0])) {
          uid = args[0]; // Numeric UID
        } else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) uid = match[1]; // Profile link UID
        }
      }

      // Default UID fallback
      if (!uid) {
        uid = event.type === "message_reply"
          ? event.messageReply.senderID
          : mentionID || senderID;
      }

      // Fetch user info
      api.getUserInfo(uid, async (err, userInfo) => {
        if (err || !userInfo[uid]) {
          return message.reply("⚠️ Failed to retrieve user information.");
        }

        const user = userInfo[uid];
        const avatarUrl = await usersData.getAvatarUrl(uid);

        // Gender map
        const genderMap = {
          1: "👩 Girl",
          2: "👨 Boy",
          default: "❓ Unknown"
        };

        const genderText = genderMap[user.gender] || genderMap.default;

        // Check if birthday exists
        const birthday = user.birthday ? `🎉 ${user.birthday}` : "❌ Not Public";

        // Styled user info
        const info = [
          `👤 Name: ${user.name}`,
          `🔗 Profile: ${user.profileUrl}`,
          `⚧ Gender: ${genderText}`,
          `🆔 UID: ${uid}`,
          `🎂 Date of Birth: ${birthday}`,
          `🤝 Friend: ${user.isFriend ? "Yes ✅" : "No ❌"}`,
          `📅 Birthday Today: ${user.isBirthday ? "Yes 🎊" : "No"}`
        ].join("\n");

        message.reply({
          body: info,
          attachment: await global.utils.getStreamFromURL(avatarUrl)
        });
      });
    } catch (e) {
      console.error(e);
      message.reply("❌ An unexpected error occurred.");
    }
  }
};