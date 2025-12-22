module.exports = {
    config: {
        name: "p",
        version: "1.0",
        author: "BaYjid 👽",
        countDown: 5,
        role: 2,
        shortDescription: { vi: "", en: "" },
        longDescription: { vi: "", en: "" },
        category: "pending"
    },

    langs: {
        en: {
            invalidNumber: "❌ 『%1』 is not a valid number!",
            cancelSuccess: "❌ Refused 『%1』 thread(s) successfully!",
            approveSuccess: "✅ Approved 『%1』 thread(s) successfully!",
            cantGetPendingList: "⚠️ Cannot retrieve the pending list!",
            returnListPending: "🟢 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗟𝗜𝗦𝗧 🟢\n\nTotal Threads: %1\n\n%2",
            returnListClean: "🟡 No pending threads found!"
        }
    },

    onReply: async function({ api, event, Reply, getLang }) {
        if (String(event.senderID) !== String(Reply.author)) return;

        const { body, threadID, messageID } = event;
        let count = 0;
        const isCancel = body.toLowerCase().startsWith("c") || body.toLowerCase().startsWith("cancel");
        const indices = body.replace(/^[cC]ancel?\s*/, "").split(/\s+/);

        for (const index of indices) {
            const num = parseInt(index);
            if (isNaN(num) || num <= 0 || num > Reply.pending.length) {
                return api.sendMessage(getLang("invalidNumber", num), threadID, messageID);
            }

            const targetThread = Reply.pending[num - 1].threadID;

            // ✅ Get actual approver name
            let userName = "Unknown";
            try {
                const userInfo = await api.getUserInfo(event.senderID);
                userName = userInfo[event.senderID].name || "Unknown";
            } catch (e) {}

            if (isCancel) {
                api.removeUserFromGroup(api.getCurrentUserID(), targetThread);
                api.sendMessage(`❌ This group was refused b ${userName}`, targetThread);
            } else {
                api.sendMessage(`✅ This group approved b ${userName`, targetThread);
            }
            count++;
        }

        return api.sendMessage(getLang(isCancel ? "cancelSuccess" : "approveSuccess", count), threadID, messageID);
    },

    onStart: async function({ api, event, getLang, commandName }) {
        const { threadID, messageID } = event;
        let msg = "", index = 1;

        try {
            const spam = (await api.getThreadList(100, null, ["OTHER"])) || [];
            const pending = (await api.getThreadList(100, null, ["PENDING"])) || [];
            const list = [...spam, ...pending].filter(g => g.isSubscribed && g.isGroup);

            for (const group of list) {
                msg += `🔹 ${index++}. ${group.name} (ID: ${group.threadID})\n`;
            }

            if (list.length !== 0) {
                return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (err, info) => {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: event.senderID,
                        pending: list
                    });
                }, messageID);
            } else {
                return api.sendMessage(getLang("returnListClean"), threadID, messageID);
            }
        } catch (e) {
            return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
        }
    }
};