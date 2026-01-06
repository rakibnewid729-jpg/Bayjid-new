module.exports.config = {
  name: "setallbal",
  version: "1.1",
  author: "BaYjid",
  role: 2, // admin only
  shortDescription: {
    en: "Set all users balance to 1M"
  },
  longDescription: {
    en: "Set balance of all users in database to 1,000,000 at once"
  },
  category: "Admin",
  guide: {
    en: "{pn}"
  }
};

module.exports.onStart = async function ({ api, event, usersData }) {
  const { threadID } = event;

  try {
    const allUsers = await usersData.getAll();
    let count = 0;

    for (const user of allUsers) {
      await usersData.set(user.userID, {
        money: 1000000
      });
      count++;
    }

    return api.sendMessage(
      `✅ | Balance Update Successful\n\n👥 Total Users: ${count}\n💰 New Balance: 1,000,000`,
      threadID
    );

  } catch (error) {
    console.error(error);
    return api.sendMessage(
      "❌ | Failed to update all balances.",
      threadID
    );
  }
};