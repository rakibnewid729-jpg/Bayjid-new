const axios = require('axios');

module.exports = {
  config: {
    name: 'chudon',
    category: 'MEDIA',
    author: 'BaYjid',
    description: 'Uploads media from a replied message to a server and returns the new URL'
  },

  onStart: async ({ event, message }) => {
    try {
      const attachment = event.messageReply?.attachments?.[0];

      if (!attachment) {
       message.reply("Please reply to an image, video, or audio file.");
      }

      const originalUrl = attachment.url;
      const apiUrl = `https://cdn.noobs-api.top/upload?url=${encodeURIComponent(originalUrl)}`;

      const response = await axios.get(apiUrl);
      const newUrl = response.data.url;

      if (!newUrl) {
     message.reply("No URL returned. Please check the API response.");
      }

      message.reply(`Uploaded URL:\n${newUrl}`);
    } catch (error) {
      message.reply("An error occurred: " + error.message);
    }
  }
};
