const axios = require("axios");

module.exports = {
  config: {
    name: "api",
    version: "3.0",
    author: "BaYjid",
    description: "One command for all public APIs",
    usage: "<type>",
    cooldown: 5,
    role: 0
  },

  onStart: async ({ api, event, args }) => {
    const type = args[0]?.toLowerCase();
    const query = args.slice(1).join(" ");
    const send = (msg, attach) =>
      api.sendMessage(attach ? { body: msg, attachment: attach } : msg, event.threadID);

    // 🔹 API list
    const apiList = `
📚 Available APIs:
──────────────────
🐱 cat – Random cat fact
🐶 dog – Random dog picture
🤣 joke – Random joke
🎯 activity – Random activity idea
🔮 agify <name> – Guess age by name
🌍 nationalize <name> – Guess countries by name
⚧ gender <name> – Guess gender by name
👤 randomuser – Random user info
🌐 ip – Show bot server IP
🇺🇸 uspop – US population data
🏫 unis <country> – University list
📮 zip <code> – Info about US ZIP code
──────────────────
💡 Example:
.api cat
.api agify asif
.api unis Bangladesh
`;

    if (!type || type === "list") return send(apiList);

    try {
      switch (type) {
        case "cat": {
          const { data } = await axios.get("https://catfact.ninja/fact");
          send(`🐱 Cat Fact:\n${data.fact}`);
          break;
        }

        case "dog": {
          const { data } = await axios.get("https://dog.ceo/api/breeds/image/random");
          const img = await global.utils.getStreamFromURL(data.message);
          send("🐶 Random Doggo:", img);
          break;
        }

        case "joke": {
          const { data } = await axios.get("https://official-joke-api.appspot.com/random_joke");
          send(`🤣 ${data.setup}\n👉 ${data.punchline}`);
          break;
        }

        case "activity": {
          const { data } = await axios.get("https://www.boredapi.com/api/activity");
          send(`🎯 Try this:\n${data.activity}\nType: ${data.type}`);
          break;
        }

        case "agify": {
          if (!query) return send("⚠️ Usage: .api agify <name>");
          const { data } = await axios.get(`https://api.agify.io?name=${encodeURIComponent(query)}`);
          send(`🔮 Name: ${data.name}\nEstimated Age: ${data.age ?? "Unknown"}`);
          break;
        }

        case "nationalize": {
          if (!query) return send("⚠️ Usage: .api nationalize <name>");
          const { data } = await axios.get(`https://api.nationalize.io?name=${encodeURIComponent(query)}`);
          const list =
            data.country?.slice(0, 3)
              .map(c => `• ${c.country_id} (${(c.probability * 100).toFixed(1)}%)`)
              .join("\n") || "No data found.";
          send(`🌍 Name: ${data.name}\n${list}`);
          break;
        }

        case "gender": {
          if (!query) return send("⚠️ Usage: .api gender <name>");
          const { data } = await axios.get(`https://api.genderize.io?name=${encodeURIComponent(query)}`);
          send(`⚧ Name: ${data.name}\nGender: ${data.gender ?? "Unknown"} (${Math.round((data.probability || 0) * 100)}%)`);
          break;
        }

        case "randomuser": {
          const { data } = await axios.get("https://randomuser.me/api/");
          const u = data.results[0];
          const info = `👤 ${u.name.title} ${u.name.first} ${u.name.last}\n📍 ${u.location.city}, ${u.location.country}\n📧 ${u.email}\n📱 ${u.phone}`;
          const pic = await global.utils.getStreamFromURL(u.picture.large);
          send(info, pic);
          break;
        }

        case "ip": {
          const { data } = await axios.get("https://api.ipify.org?format=json");
          send(`🌐 Bot's Public IP: ${data.ip}`);
          break;
        }

        case "uspop": {
          const { data } = await axios.get("https://datausa.io/api/data?drilldowns=Nation&measures=Population");
          const latest = data.data.slice(-1)[0];
          send(`🇺🇸 Year: ${latest.Year}\nPopulation: ${latest.Population.toLocaleString()}`);
          break;
        }

        case "unis": {
          if (!query) return send("⚠️ Usage: .api unis <country>");
          const { data } = await axios.get(`http://universities.hipolabs.com/search?country=${encodeURIComponent(query)}`);
          const list = data.slice(0, 5).map((u, i) => `${i + 1}. ${u.name}`).join("\n");
          send(`🏫 Top universities in ${query}:\n${list || "No results found."}`);
          break;
        }

        case "zip": {
          if (!query) return send("⚠️ Usage: .api zip <code>");
          const { data } = await axios.get(`https://api.zippopotam.us/us/${query}`);
          const p = data.places[0];
          send(`📮 ZIP: ${data['post code']}\nPlace: ${p['place name']}, ${p['state']}\nLat: ${p['latitude']} | Lon: ${p['longitude']}`);
          break;
        }

        default:
          send("❌ Unknown type. Use `.api list` to see available APIs.");
      }
    } catch (err) {
      send("⚠️ API request failed or timed out. Try again later.");
    }
  }
};