const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "xass",
    version: "1.1.1",
    author: "BaYjid",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Upload command files to custom Pastebin"
    },
    longDescription: {
      en: "Upload a command file from cmds folder to your custom Pastebin and get a raw code link."
    },
    category: "Utility",
    guide: {
      en: "Usage: !xass <filename>\n(Note: File must be inside 'cmds' folder)"
    }
  },

  onStart: async ({ api, event, args }) => {
    const fileName = args[0];

    if (!fileName) {
      return api.sendMessage(
        "⚠️ Please provide a file name.\nExample: !xass bdresult",
        event.threadID
      );
    }

    const cmdsFolder = path.join(__dirname, "..", "cmds");
    const filePathRaw = path.join(cmdsFolder, fileName);
    const filePathJs = `${filePathRaw}.js`;

    const filePath = fs.existsSync(filePathRaw)
      ? filePathRaw
      : fs.existsSync(filePathJs)
      ? filePathJs
      : null;

    if (!filePath) {
      return api.sendMessage(
        `❌ File ${fileName} not found in cmds folder! Please check the filename and try again.`,
        event.threadID
      );
    }

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");

      const res = await axios.post("http://141.11.167.247:6456/x", {
        text: fileContent,
        title: fileName
      });

      const pasteId = res?.data?.id;

      if (!pasteId) {
        return api.sendMessage(
          "❌ Upload failed: Server did not return a valid ID.",
          event.threadID
        );
      }

      const rawLink = `http://141.11.167.247:6456/x/raw/${pasteId}`;

      const successMessage = [
        "✅ Upload Successful!",
        `🔗 Here's your raw link:`,
        `${rawLink}`,
        "",
        "🙈😚"
      ].join("\n");

      api.sendMessage(successMessage, event.threadID);
    } catch (error) {
      console.error("❌ Upload Error:", error);
      api.sendMessage(
        `❌ Error uploading to custom server:\n${error.message}`,
        event.threadID
      );
    }
  }
};