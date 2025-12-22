const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

// ✅ Fixed Admin Thread ID
const ADMIN_THREAD_ID = "1401026381515569"; // Admin-er group

module.exports = {
    config: {
        name: "callad",
        aliases: ["call", ""],
        version: "5.3",
        author: "BaYjid 👽",
        countDown: 5,
        role: 0,
        description: "Send feedback to admin group, reply goes back to original group",
        category: "contacts admin",
        guide: "{pn} <message>"
    },

    langs: {
        en: {
            missingMessage: "❗ Please type the message you want to send",
            success: "✅ Your message has been sent to admin group!",
            failed: "❌ Error sending message. Check console for details",
            replyUserSuccess: "✅ Admin reply has been sent to your group!"
        }
    },

    onStart: async ({ args, message, event, usersData, api }) => {
        if (!args[0]) return message.reply(module.exports.langs.en.missingMessage);

        const msgContent = args.join(" ");
        const senderName = await usersData.getName(event.senderID);

        const styledMsg = `
───────────────
         𝗙𝗥𝗢𝗠 𝗨𝗦𝗘𝗥
───────────────

👤 Name: ${senderName}
🆔 ID: ${event.senderID}
📝 Original Group ID: ${event.threadID}
────────────────────────
💬 Message:
${msgContent}
────────────────────────
⚡ Stay safe & active!
📬───────────────📬`;

        const formMessage = {
            body: styledMsg,
            mentions: [{ id: event.senderID, tag: senderName }],
            attachment: await getStreamsFromAttachment(
                [...event.attachments, ...(event.messageReply?.attachments || [])]
                    .filter(item => mediaTypes.includes(item.type))
            )
        };

        try {
            const sentMsg = await api.sendMessage(formMessage, ADMIN_THREAD_ID);
            message.reply(module.exports.langs.en.success);

            // store reply handler with original group
            global.GoatBot.onReply.set(sentMsg.messageID, {
                type: "adminReplyToUserGroup",
                userID: event.senderID,
                originalGroupID: event.threadID,
                commandName: module.exports.config.name
            });

        } catch (err) {
            log.err("CALLAD THREAD", err);
            return message.reply(module.exports.langs.en.failed);
        }
    },

    onReply: async ({ args, event, api, Reply, message, usersData }) => {
        const { type, userID, originalGroupID } = Reply;
        const senderName = await usersData.getName(event.senderID);

        switch (type) {
            case "adminReplyToUserGroup": {
                // styled admin reply
                const styledReply = `
📩 𝗥𝗘𝗣𝗟𝗬 𝗙𝗥𝗢𝗠 𝗔𝗗𝗠𝗜𝗡
👤 ${senderName}
🆔 ${event.senderID}
─────────────────────────
💬 ${args.join(" ")}
─────────────────────────`;

                const form = {
                    body: styledReply,
                    mentions: [{ id: event.senderID, tag: senderName }],
                    attachment: await getStreamsFromAttachment(
                        [...event.attachments, ...(event.messageReply?.attachments || [])]
                            .filter(item => mediaTypes.includes(item.type))
                    )
                };

                try {
                    // send admin reply back to user's original group
                    await api.sendMessage(form, originalGroupID);
                    message.reply(module.exports.langs.en.replyUserSuccess);
                } catch (err) {
                    log.err("CALLAD REPLY TO USER GROUP", err);
                    message.reply("❌ Failed to send admin reply to user's group.");
                }
                break;
            }
        }
    }
};