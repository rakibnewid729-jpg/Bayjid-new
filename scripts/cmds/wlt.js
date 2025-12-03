const { config } = global.GoatBot;
const { client } = global;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "whitelist",
		aliases: ["wlt"],
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		description: {
			en: "Add, remove, edit whiteListThreadIds role"
		},
		category: "Sex",
		guide: {
			en: `
{pn} [add | -a | +] [<tid>...]: Add whiteListThreadIds role for current or specified threads
{pn} [remove | -r | -] [<tid>...]: Remove whiteListThreadIds role from current or specified threads
{pn} [list | -l]: Show all whiteListThreadIds
{pn} [mode | -m] <on|off>: Toggle whitelist-only mode
{pn} [mode | -m] noti <on|off>: Toggle noti for non-whitelisted threads
`
		}
	},

	langs: {
		en: {
			added: `\n╭─✦✅ | Added %1 thread/s\n%2`,
			alreadyWLT: `╭✦⚠️ | Already whitelisted %1 thread/s\n%2\n`,
			missingTIDAdd: "⚠️ | Enter TID(s) to add to whitelist",
			removed: `\n╭✦✅ | Removed %1 thread/s\n%2`,
			notAdded: `╭✦❎ | Not whitelisted %1 thread/s\n%2\n`,
			missingTIDRemove: "⚠️ | Enter TID(s) to remove from whitelist",
			listWLTs: `╭✦✨ | Whitelisted Threads\n%1\n╰‣`,
			turnedOn: "✅ | Whitelist-only mode activated",
			turnedOff: "❎ | Whitelist-only mode deactivated",
			turnedOnNoti: "✅ | Notification for non-whitelisted threads enabled",
			turnedOffNoti: "❎ | Notification for non-whitelisted threads disabled"
		}
	},

	onStart: async function ({ message, args, event, getLang, api }) {
		const tidList = args.slice(1).filter(arg => !isNaN(arg));
		const tids = tidList.length > 0 ? tidList : [event.threadID];

		const getThreadInfo = async (tid) => {
			const info = await api.getThreadInfo(tid) || {};
			return { tid, name: info.threadName || "Unknown" };
		};

		switch (args[0]) {
			case "add":
			case "-a":
			case "+": {
				const alreadyAdded = [];
				const newAdd = tids.filter(tid => {
					if (config.whiteListModeThread.whiteListThreadIds.includes(tid)) {
						alreadyAdded.push(tid);
						return false;
					}
					return true;
				});

				config.whiteListModeThread.whiteListThreadIds.push(...newAdd);

				const addedThreads = await Promise.all(newAdd.map(getThreadInfo));
				const alreadyThreads = await Promise.all(alreadyAdded.map(getThreadInfo));

				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(newAdd.length > 0 ? getLang("added", newAdd.length, addedThreads.map(({ tid, name }) => `├‣ NAME: ${name}\n╰‣ ID: ${tid}`).join("\n")) : "") +
					(alreadyAdded.length > 0 ? getLang("alreadyWLT", alreadyAdded.length, alreadyThreads.map(({ tid }) => `╰‣ ID: ${tid}`).join("\n")) : "")
				);
			}

			case "remove":
			case "rm":
			case "-r":
			case "-": {
				const inList = [];
				const notInList = [];

				tids.forEach(tid => {
					if (config.whiteListModeThread.whiteListThreadIds.includes(tid)) inList.push(tid);
					else notInList.push(tid);
				});

				config.whiteListModeThread.whiteListThreadIds = config.whiteListModeThread.whiteListThreadIds.filter(tid => !inList.includes(tid));

				const removedThreads = await Promise.all(inList.map(getThreadInfo));

				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(inList.length > 0 ? getLang("removed", inList.length, removedThreads.map(({ tid, name }) => `├‣ NAME: ${name}\n╰‣ ID: ${tid}`).join("\n")) : "") +
					(notInList.length > 0 ? getLang("notAdded", notInList.length, notInList.map(tid => `╰‣ ID: ${tid}`).join("\n")) : "")
				);
			}

			case "list":
			case "-l": {
				const list = await Promise.all(config.whiteListModeThread.whiteListThreadIds.map(getThreadInfo));
				return message.reply(getLang("listWLTs", list.map(({ tid, name }) => `├‣ NAME: ${name}\n├‣ ID: ${tid}`).join("\n")));
			}

			case "mode":
			case "m":
			case "-m": {
				let value;
				let isNoti = false;

				if (args[1] === "noti") {
					isNoti = true;
					value = args[2] === "on";
					config.hideNotiMessage.whiteListModeThread = !value;
					message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
				} else {
					value = args[1] === "on";
					config.whiteListModeThread.enable = value;
					message.reply(getLang(value ? "turnedOn" : "turnedOff"));
				}

				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
				break;
			}

			default:
				return message.reply(getLang("missingTIDAdd"));
		}
	}
};