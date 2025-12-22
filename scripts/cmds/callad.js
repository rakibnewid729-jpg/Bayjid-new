const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

// ✅ Fixed Target Thread ID
const TARGET_THREAD_ID = "1401026381515569"; // শুধু এই group-এ SMS যাবে

module.exports = {
    config: {
        name: "callad",
        aliases: ["call", ""], // ✅ Add your aliases here
        version: "5.2",
        author: "BaYjid",
        countDown: 5,
        role: 0,
        description: "Send feedback to fixed group with stylish admin reply",
        category: "contacts admin",
        guide: "{pn} <message>"
    },

    langs: {
        en: {
            missingMessage: "❗ Please type the message you want to send",
            success: "✅ Your message has been sent to the group!",
            failed: "❌ Error sending message. Check console for details",
            replyUserSuccess: "✅ Admin reply has been sent to you!"
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
            const sentMsg = await api.sendMessage(formMessage, TARGET_THREAD_ID);
            message.reply(module.exports.langs.en.success);

            // store reply handler
            global.GoatBot.onReply.set(sentMsg.messageID, {
                type: "userToGroup",
                userID: event.senderID,
                commandName: module.exports.config.name
            });

        } catch (err) {
            log.err("CALLAD THREAD", err);
            return message.reply(module.exports.langs.en.failed);
        }
    },

    onReply: async ({ args, event, api, Reply, message, usersData }) => {
        const { type, userID } = Reply;
        const senderName = await usersData.getName(event.senderID);

        switch (type) {
            case "userToGroup": {
                const styledReply = `
🔁 𝗥𝗘𝗣𝗟𝗬 𝗙𝗥𝗢𝗠 𝗨𝗦𝗘𝗥
👤 ${senderName}
🆔 ${event.senderID}
────────────────────────
💬 Message:
${args.join(" ")}
────────────────────────`;

                const form = {
                    body: styledReply,
                    mentions: [{ id: event.senderID, tag: senderName }],
                    attachment: await getStreamsFromAttachment(
                        [...event.attachments, ...(event.messageReply?.attachments || [])]
                            .filter(item => mediaTypes.includes(item.type))
                    )
                };

                const sentMsg = await api.sendMessage(form, TARGET_THREAD_ID);

                global.GoatBot.onReply.set(sentMsg.messageID, {
                    type: "groupToUser",
                    userID,
                    commandName: Reply.commandName
                });
                break;
            }

            case "groupToUser": {
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
                    await api.sendMessage(form, userID); // send back to original user
                    message.reply(module.exports.langs.en.replyUserSuccess);
                } catch (err) {
                    log.err("CALLAD REPLY TO USER", err);
                    message.reply("❌ Failed to send admin reply.");
                }
                break;
            }
        }
    }
};