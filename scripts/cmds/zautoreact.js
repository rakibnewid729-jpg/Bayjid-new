module.exports = {
    config: {
        name: "autoreact",
        version: "1.2",
        author: "BaYjid 👽",
        countDown: 5,
        role: 0,
        shortDescription: "Auto reacts with cute emojis",
        longDescription: "Automatically reacts with cute and adorable emojis to certain keywords",
        category: "fun",
    },

    onStart: async function () {},

    onChat: async function ({ event, api }) {
        const msg = event.body.toLowerCase();
        const reactions = [
            { keywords: ["iloveyou"], emoji: "🥰" },
            { keywords: ["good night", "good morning"], emoji: "🌙✨" },
            { keywords: ["pakyo", "pangit"], emoji: "😡💢" },
            { keywords: ["mahal", "mwa", "hi", "hello", "ganda", "i miss you"], emoji: "💖💞" },
            { keywords: ["😢"], emoji: "😭💧" },
            { keywords: ["😆", "😂", "🤣"], emoji: "😹💫" },
            { keywords: ["tangina", "gago"], emoji: "😤🔥" },
            { keywords: ["good afternoon", "good evening"], emoji: "🌸💝" },
            { keywords: ["bastos", "bas2s", "bastog"], emoji: "😳😳" },
            { keywords: ["zope"], emoji: "⏳💭" },
            { keywords: ["redroom", "😏", "shoti"], emoji: "😎✨" },
            { keywords: ["pakyu", "fuck you"], emoji: "💢😠" },
            { keywords: ["bata", "kid"], emoji: "🧒🌸" },
            { keywords: ["i hate you"], emoji: "😔💔" },
            { keywords: ["useless"], emoji: "😓💦" },
            { keywords: ["omg"], emoji: "😲✨" },
            { keywords: ["pogi"], emoji: "😎🌟" },
            { keywords: ["sad"], emoji: "🥺💖" },
        ];

        for (const react of reactions) {
            for (const keyword of react.keywords) {
                if (msg.includes(keyword)) {
                    return api.setMessageReaction(react.emoji, event.messageID, event.threadID);
                }
            }
        }
    }
};