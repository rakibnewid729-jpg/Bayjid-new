const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
		version: "2.0",
		author: "BaYjid",
		category: "events",
		envConfig: {
			allow: true
		}
	},

	langs: {
		en: {
			added:
				"🟢 𝐁𝐎𝐓 𝐀𝐃𝐃𝐄𝐃\n\n" +
				"📌 Group : %1\n" +
				"👤 Added By : %2\n" +
				"🆔 Group ID : %3\n" +
				"⏰ Time : %4",

			kicked:
				"🔴 𝐁𝐎𝐓 𝐑𝐄𝐌𝐎𝐕𝐄𝐃\n\n" +
				"📌 Group : %1\n" +
				"👤 Removed By : %2\n" +
				"🆔 Group ID : %3\n" +
				"⏰ Time : %4"
		}
	},

	onStart: async ({ api, event, usersData, threadsData, getLang }) => {
		const botID = api.getCurrentUserID();
		const { logMessageType, logMessageData, author, threadID } = event;
		const { adminBot } = global.GoatBot.config;

		if (!adminBot || adminBot.length === 0) return;

		// BOT ADD
		if (
			logMessageType === "log:subscribe" &&
			logMessageData.addedParticipants.some(i => i.userFbId == botID)
		) {
			if (author == botID) return;

			const threadInfo = await api.getThreadInfo(threadID);
			const groupName = threadInfo.threadName || "Unknown Group";
			const authorName = await usersData.getName(author);
			const time = getTime("DD/MM/YYYY HH:mm:ss");

			const msg = getLang(
				"added",
				groupName,
				authorName,
				threadID,
				time
			);

			for (const adminID of adminBot) {
				api.sendMessage(msg, adminID);
			}
		}

		// BOT KICKED
		if (
			logMessageType === "log:unsubscribe" &&
			logMessageData.leftParticipantFbId == botID
		) {
			const threadData = await threadsData.get(threadID);
			const groupName = threadData?.threadName || "Unknown Group";
			const authorName = await usersData.getName(author);
			const time = getTime("DD/MM/YYYY HH:mm:ss");

			const msg = getLang(
				"kicked",
				groupName,
				authorName,
				threadID,
				time
			);

			for (const adminID of adminBot) {
				api.sendMessage(msg, adminID);
			}
		}
	}
};