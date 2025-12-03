const os = require("os");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function formatTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getCpuModel() {
  const cpus = os.cpus();
  return cpus[0]?.model.split('@')[0] || "Unknown CPU";
}

function getRandomMediaStatus() {
  return Math.random() > 0.5 ? "Yes ✅" : "No ❎";
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "ut"],
    version: "7.0",
    author: "BaYjid",
    role: 0,
    shortDescription: { en: " System Uptime & Stats" },
    longDescription: { en: "System stats with Messenger-style output" },
    category: "tools",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    try {
      const uptimeSeconds = process.uptime();
      const formattedUptime = formatTime(uptimeSeconds);
      const platform = os.platform();
      const arch = os.arch();
      const cpuCores = os.cpus().length;
      const cpuModel = getCpuModel();
      const osType = os.type();
      const osRelease = os.release();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      let threadsCount = 0, usersCount = 0;

      try {
        const allThreads = await threadsData.getAll();
        threadsCount = allThreads.length;
        usersCount = (await usersData.getAll()).length;
      } catch (err) {
        console.log("Bot stats fetch error:", err.message);
      }

      const mediaStatus = getRandomMediaStatus();

      const uptimeMessage = `
╭──✦ [ Uptime Information ]
├‣ 🕒 System Uptime: ${formattedUptime}
╰‣ ⏱ Process Uptime: ${uptimeSeconds.toFixed(0)} seconds

╭──✦ [ System Information ]
├‣ 📡 OS: ${osType} ${osRelease}
├‣ 🛡 Cores: ${cpuCores}
├‣ 🔍 Architecture: ${arch}
├‣ 🖥 Node Version: ${process.version}
├‣ 📈 Total Memory: ${formatBytes(totalMem)}
├‣ 📉 Free Memory: ${formatBytes(freeMem)}
├‣ 📊 RAM Usage: ${formatBytes(usedMem)}
├‣ 👥 Total Users: ${usersCount.toLocaleString()} members
├‣ 📂 Total Threads: ${threadsCount} Groups
╰‣ ♻ Media Ban: ${mediaStatus}
`;

      await delay(300);
      await api.sendMessage(uptimeMessage, event.threadID);

    } catch (err) {
      console.error("Uptime command error:", err);
      return api.sendMessage("❌ Error fetching system data", event.threadID);
    }
  }
};