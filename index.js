require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const path = require('path');
const { EmbedBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');

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
    client.user.setActivity(statuses[currentStatus], {
      type: ActivityType.Streaming,
    });
    currentStatus = (currentStatus + 1) % statuses.length;
  }, 60000);

  let tosSent = {};
  try {
    tosSent = JSON.parse(fs.readFileSync('tos_sent.json', 'utf8'));
  } catch (e) {
    console.log("No existing TOS sent cache found, starting fresh.");
  }
  // Get the first guild the bot is in
  client.guilds.cache.forEach(guild => {
    if (tosSent[guild.id]) {
      console.log(`TOS already sent to ${guild.name}, skipping.`);
      return;
    }

    const botChannels = guild.channels.cache.filter(channel =>
      channel.type === ChannelType.GuildText &&
      channel.name.toLowerCase().includes("bot")
    );

    if (botChannels.size > 0) {
      botChannels.forEach(botChannel => {
        const embed = new EmbedBuilder()
          .setTitle(`Hello!, I'm Karelia!`)
          .setDescription('Terms of Use:')
          .addFields(
            { name: 'Purpose', value: 'This bot is designed to provide emotional support, motivation, and assistance in a safe and respectful manner. It is not intended to replace professional mental health services.' },
            { name: 'Respectful Use', value: 'Do not use the bot for any form of abuse, harassment, or harmful behavior. Respect other users and follow Discord\'s Community Guidelines.' },
            { name: 'No Sensitive Personal Information', value: 'Avoid sharing sensitive personal or confidential information. The bot is not equipped to handle crises or emergencies. If you or someone else is in immediate danger, please contact a professional or emergency service.' },
            { name: 'Content Limitations', value: 'The bot will not engage in or promote any harmful, illegal, or inappropriate content. All interactions should be positive and constructive.' },
            { name: 'Accountability', value: 'The developers are not responsible for any negative consequences from using this bot. The bot’s support is intended for general emotional encouragement, not clinical therapy.' },
            { name: 'Modifications and Termination', value: 'The developers are not responsible for any negative consequences from using this bot. The bot’s support is intended for general emotional encouragement, not clinical therapy.' }
          )
          .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() })
          .setColor(0x00FF00)
          .setThumbnail(client.user.displayAvatarURL());

        botChannel.send({ embeds: [embed] })
          .then(() => {
            console.log(`TOS message sent to ${botChannel.name} in ${guild.name}`);
            tosSent[guild.id] = true;
            fs.writeFileSync('tos_sent.json', JSON.stringify(tosSent, null, 2));
          })
          .catch(err => console.error(`Failed to send TOS in ${botChannel.name}:`, err));
      });
    } else {
      console.log(`No bot channels found in ${guild.name}`);
    }
  });
});

// Load events from the 'events' folder
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  event(client);
}

client.login(process.env.bot_token);