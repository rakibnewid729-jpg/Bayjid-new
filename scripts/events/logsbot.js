const { getTime } = global.utils;

module.exports = {
    config: {
        name: "logsbot",
        isBot: true,
        version: "1.5",
        author: "NTKhang",
        envConfig: { allow: true },
        category: "events"
    },

    langs: {
        vi: {
            added: "✨✅ 𝗕𝗼𝘁 được thêm vào: %1\n👤 Thêm bởi: %2\n👥 Tổng thành viên: %3",
            kicked: "⚠️❌ 𝗕𝗼𝘁 bị kick khỏi: %1\n👤 Kick bởi: %2\n👥 Tổng thành viên còn lại: %3"
        },
        en: {
            added: "✨✅ Bot added to: %1\n👤 Added by: %2\n👥 Total members: %3",
            kicked: "⚠️❌ Bot kicked from: %1\n👤 Kicked by: %2\n👥 Remaining members: %3"
        }
    },

    onStart: async ({ usersData, event, threadsData, api, getLang }) => {
        if (
            (event.logMessageType == "log:subscribe" && event.logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID()))
            || (event.logMessageType == "log:unsubscribe" && event.logMessageData.leftParticipantFbId == api.getCurrentUserID())
        ) return async function () {
            const { author, threadID } = event;
            if (author == api.getCurrentUserID()) return;

            const threadInfo = await api.getThreadInfo(threadID);
            const threadName = threadInfo.threadName;
            const authorName = await usersData.getName(author);

            // Get total members
            const totalMembers = threadInfo.participantIDs.length;

            let msg = "";
            if (event.logMessageType == "log:subscribe") {
                if (!event.logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID())) return;
                msg = getLang("added", threadName, authorName, totalMembers);
            } else if (event.logMessageType == "log:unsubscribe") {
                if (event.logMessageData.leftParticipantFbId != api.getCurrentUserID()) return;
                msg = getLang("kicked", threadName, authorName, totalMembers);
            }

            const { config } = global.GoatBot;
            for (const adminID of config.adminBot)
                api.sendMessage(msg, adminID);
        };
    }
};