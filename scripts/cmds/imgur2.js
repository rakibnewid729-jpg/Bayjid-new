let axios = require("axios"); 
module.exports = {
  config: {
    name: "imgur2",
    aliases: [`imagegur`],
    version: "1.0",
    author: "BaYjid",
    countDown: 0,
    role: 0,
    shortDescription: "upload any images in imgur server..",
    longDescription: "upload any images in imgur server..",
    category: "utility",
    guide: "{pn} reply or add link of image"
  },

  onStart: async function ({ api, event }) {
    let linkanh = event.messageReply.attachments[0].url || args.join(" ");
    if(!linkanh) return api.sendMessage('Please reply or enter the link 1 image!!!', event.threadID, event.messageID)
    let res = await axios.get(`http://noobs-api.top/dipto`);
    let img = res.data.data;
  return api.sendMessage(`${img}`, event.threadID, event.messageID)
  }
};
