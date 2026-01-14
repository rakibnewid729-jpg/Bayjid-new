.cmd install call.js const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

// 🔴 FIXED TARGET THREAD ID
const TARGET_THREAD_ID = "1401026381515569";

module.exports = {
	config: {
		name: "call",
		aliases: ["callad"], // ✅ ALIASES ADDED
		version: "2.2",
		author: "BaYjid",
		countDown: 5,
		role: 0,
		description: {
			en: "Send message or report to a fixed admin thread"
		},
		category: "contacts admin",
		guide: {
			en: "{pn} <your message>"
		}
	},

	langs: {
		en: {
			missingMessage: "⚠️ Please enter a message to send.",
			success: "✅ Your message has been successfully sent to the admin thread!",
			failed: "❌ Failed to send your message. Please try again later.",
			replyFromAdmin: "📩 Reply from admin %1:\n─────────────────\n%2\n─────────────────",
			replyUserSuccess: "📤 Reply successfully delivered to the user.",
			replyAdminSuccess: "📨 Reply successfully delivered to the admin."
		}
	},

	onStart: async function ({ args, message, event, usersData, api, commandName, getLang }) {
		if (!args[0])
			return message.reply(getLang("missingMessage"));

		const senderID = event.senderID;
		const senderName = await usersData.getName(senderID);

		const formMessage = {
			body:
				"== 📞 ADMIN CONTACT MESSAGE 📞 ==\n" +
				`👤 User Name: ${senderName}\n` +
				`🆔 User ID: ${senderID}\n\n` +
				"📨 Message:\n" +
				"─────────────────\n" +
				args.join(" ") +
				"\n─────────────────",
			mentions: [{
				id: senderID,
				tag: senderName
			}],
			attachment: await getStreamsFromAttachment(
				[...event.attachments, ...(event.messageReply?.attachments || [])]
					.filter(item => mediaTypes.includes(item.type))
			)
		};

		try {
			const info = await api.sendMessage(formMessage, TARGET_THREAD_ID);

			global.GoatBot.onReply.set(info.messageID, {
				commandName,
				messageID: info.messageID,
				threadID: event.threadID,
				messageIDSender: event.messageID,
				type: "userCallAdmin"
			});

			return message.reply(getLang("success"));
		}
		catch (err) {
			log.err("CALL FIXED THREAD", err);
			return message.reply(getLang("failed"));
		}
	},

	onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
		const senderName = await usersData.getName(event.senderID);

		switch (Reply.type) {
			// 🔁 Admin → User
			case "userCallAdmin": {
				const formMessage = {
					body: getLang("replyFromAdmin", senderName, args.join(" ")),
					mentions: [{
						id: event.senderID,
						tag: senderName
					}],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, Reply.threadID, (err, info) => {
					if (err) return message.err(err);

					message.reply(getLang("replyUserSuccess"));

					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: TARGET_THREAD_ID,
						type: "adminReply"
					});
				}, Reply.messageIDSender);
				break;
			}

			// 🔁 User → Admin
			case "adminReply": {
				const formMessage = {
					body:
						"📨 User Reply:\n" +
						"─────────────────\n" +
						args.join(" ") +
						"\n─────────────────",
					mentions: [{
						id: event.senderID,
						tag: senderName
					}],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, TARGET_THREAD_ID, (err, info) => {
					if (err) return message.err(err);

					message.reply(getLang("replyAdminSuccess"));

					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: Reply.threadID,
						type: "userCallAdmin"
					});
				}, Reply.messageIDSender);
				break;
			}
		}
	}
};