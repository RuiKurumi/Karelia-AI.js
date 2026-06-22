require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("Karelia-AI-v2.0.0 online");
  const statuses = ["PIERDOLE, KURWA BOBER BLYAT", "Playing chess.", "Chatting with Yoshi"];

  let currentStatus = 0;

  setInterval(() => {
    client.user.setActivity(statuses[currentStatus],
      {
        type: ActivityType.Streaming
      });
    currentStatus = (currentStatus + 1) % statuses.length;
  }, 60000);
});

// Load events from the 'events' folder
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  event(client);
}

client.login(process.env.DISCORD_TOKEN || process.env.bot_token);
