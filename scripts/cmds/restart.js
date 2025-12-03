const fs = require("fs-extra");
const config = require("../../config.json");

// =============================
// 🔧 File Paths & Constants
// =============================
const AUTO_RESTART_FILE = `${__dirname}/tmp/autorestart.txt`;
const RESTART_COUNT_FILE = `${__dirname}/tmp/restartCount.json`;
const DEFAULT_THREAD = "1177626183795530";
const RESTART_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours

// =============================
// 🔐 Authorization
// =============================
function isAuthorized(uid) {
    return config.adminBot && config.adminBot.includes(uid);
}

// =============================
// 🔄 Auto-Restart Helpers
// =============================
function isAutoRestartEnabled() {
    return fs.existsSync(AUTO_RESTART_FILE) &&
        fs.readFileSync(AUTO_RESTART_FILE, "utf-8") === "on";
}

function setAutoRestart(state) {
    fs.writeFileSync(AUTO_RESTART_FILE, state);
}

// =============================
// 📊 Restart Count Handling
// =============================
function getRestartCount() {
    if (!fs.existsSync(RESTART_COUNT_FILE)) {
        return { manual: 0, auto: 0 };
    }
    return JSON.parse(fs.readFileSync(RESTART_COUNT_FILE, "utf-8"));
}

function updateRestartCount(type) {
    const count = getRestartCount();
    count[type]++;
    fs.writeFileSync(RESTART_COUNT_FILE, JSON.stringify(count, null, 2));
}

// =============================
// 📦 Module Export
// =============================
module.exports = {
    config: {
        name: "restart",
        version: "3.1",
        author: "BaYjid",
        role: 2,
        countDown: 5,
        shortDescription: "Restart the bot",
        longDescription: "Restart the bot or manage automatic restarts.",
        category: "Owner",
        guide:
`{pn}: Restart bot
{pn} autorestart on/off: Enable or disable auto-restart
{pn} list: Show restart history`
    },

    // =============================
    // ✨ Stylish Font Text Pack
    // =============================
    langs: {
        en: {
            restartting: "🌀 | 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝘁𝗵𝗲 𝘀𝘆𝘀𝘁𝗲𝗺...\n𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗮 𝗺𝗼𝗺𝗲𝗻𝘁.",

            autoRestart: "⏱️ | 𝗔𝘂𝘁𝗼-𝗿𝗲𝘀𝘁𝗮𝗿𝘁 𝗲𝗻𝗮𝗯𝗹𝗲𝗱!\n𝗦𝘆𝘀𝘁𝗲𝗺 𝘄𝗶𝗹𝗹 𝗿𝗲𝘀𝘁𝗮𝗿𝘁 𝗲𝘃𝗲𝗿𝘆 𝟯 𝗵𝗼𝘂𝗿𝘀.",

            autoRestarting: "🔁 | 𝗔𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰 𝗿𝗲𝘀𝘁𝗮𝗿𝘁 𝗶𝗻 𝗽𝗿𝗼𝗴𝗿𝗲𝘀𝘀...\n𝗢𝗽𝘁𝗶𝗺𝗶𝘇𝗶𝗻𝗴 𝗽𝗲𝗿𝗳𝗼𝗿𝗺𝗮𝗻𝗰𝗲.",

            notAuthorized: "🚫 | 𝗔𝗰𝗰𝗲𝘀𝘀 𝗗𝗲𝗻𝗶𝗲𝗱!\n𝗬𝗼𝘂 𝗮𝗿𝗲 𝗻𝗼𝘁 𝗮𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗲𝗱 𝘁𝗼 𝘂𝘀𝗲 𝘁𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱.",

            autoRestartEnabled: "🟢 | 𝗔𝘂𝘁𝗼-𝗿𝗲𝘀𝘁𝗮𝗿𝘁 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗲𝗻𝗮𝗯𝗹𝗲𝗱!\n𝗦𝘆𝘀𝘁𝗲𝗺 𝘄𝗶𝗹𝗹 𝗻𝗼𝘄 𝗿𝗲𝘀𝘁𝗮𝗿𝘁 𝘀𝗰𝗵𝗲𝗱𝘂𝗹𝗲𝗱𝗹𝘆.",

            autoRestartDisabled: "🔴 | 𝗔𝘂𝘁𝗼-𝗿𝗲𝘀𝘁𝗮𝗿𝘁 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗱𝗶𝘀𝗮𝗯𝗹𝗲𝗱!\n𝗡𝗼 𝗺𝗼𝗿𝗲 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰 𝗿𝗲𝘀𝘁𝗮𝗿𝘁𝘀.",

            restartCount:
`📊 | 𝗥𝗲𝘀𝘁𝗮𝗿𝘁 𝗛𝗶𝘀𝘁𝗼𝗿𝘆

🔧 • 𝗠𝗮𝗻𝘂𝗮𝗹 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝘀: **%1** 𝘁𝗶𝗺𝗲𝘀
⚙️ • 𝗔𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝘀: **%2** 𝘁𝗶𝗺𝗲𝘀`
        }
    },

    // =============================
    // 🚀 Bot Load Event
    // =============================
    onLoad({ api }) {
        const pathFile = `${__dirname}/tmp/restart.txt`;

        // Notify restart success
        if (fs.existsSync(pathFile)) {
            const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
            const duration = (Date.now() - time) / 1000;

            api.sendMessage(
                `✅ | 𝗕𝗼𝘁 𝗿𝗲𝘀𝘁𝗮𝗿𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!\n⏰ | 𝗧𝗶𝗺𝗲 𝘁𝗮𝗸𝗲𝗻: ${duration}s`,
                tid
            );

            fs.unlinkSync(pathFile);
        }

        // Auto Restart Handler
        if (isAutoRestartEnabled()) {
            setInterval(() => {
                console.log("🔄 | Auto-restarting bot...");
                api.sendMessage("🔁 | 𝗔𝘂𝘁𝗼-𝗿𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴...", DEFAULT_THREAD);

                updateRestartCount("auto");
                process.exit(2);

            }, RESTART_INTERVAL);
        }
    },

    // =============================
    // 🎯 Command Trigger
    // =============================
    async onStart({ message, event, args, getLang }) {
        const senderID = event.senderID;

        // Permission Check
        if (!isAuthorized(senderID)) {
            return message.reply(getLang("notAuthorized"));
        }

        // Auto-restart toggle
        if (args[0] === "autorestart") {
            if (args[1] === "on") {
                setAutoRestart("on");
                return message.reply(getLang("autoRestartEnabled"));
            }
            if (args[1] === "off") {
                setAutoRestart("off");
                return message.reply(getLang("autoRestartDisabled"));
            }
        }

        // Show restart stats
        if (args[0] === "list") {
            const count = getRestartCount();
            return message.reply(
                getLang("restartCount", count.manual, count.auto)
            );
        }

        // Manual restart
        const pathFile = `${__dirname}/tmp/restart.txt`;
        fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);

        updateRestartCount("manual");

        await message.reply(getLang("restartting"));
        process.exit(2);
    }
};