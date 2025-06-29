require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, ActivityType, Events, Collection } = require('discord.js');
const path = require('path');
const { EmbedBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');
const { google } = require('googleapis');
const youtube = google.youtube('v3');
const {decode} = require('entities');

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

  const statuses = ["PIERDOLE, KURWA BOBER BLYAT", "Playing chess.", "Chatting with Yoshi", "Watching Yubari Rei", "Listening to PHANTOMIME","Listening to Retrospective","Waiting for Live Streams."];
  let currentStatus = 0;

  setInterval(() => {
    client.user.setActivity(statuses[currentStatus], {
      type: ActivityType.Streaming,
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
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] The command at ${file} is missing "data" or "execute".`);
  }
}

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error in command ${interaction.commandName}:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  }
});


//Channel listeners.

const API_KEY = 'AIzaSyCJV8b_rbf2NXWpIA9TacIOasnH6YAwCh8';


// List of VTubers with known channel IDs
const vtubers = [
  { name: "Yubari Rei", channelId: "UCnn1Pb_JtyHbiDTELf7mgSA" },
  { name: "Mori Calliope", channelId: "UCL_qhgtOy0dy1Agp8vkySQg" },
  { name: "Sameko Saba", channelId: "UCxsZ6NCzjU_t4YSxQLBcM5A" }
];

// Check if a channel is live
// Check if a channel is live
async function checkIfLive(vtuber) {
  try {
    const res = await youtube.search.list({
      key: API_KEY,
      channelId: vtuber.channelId,
      eventType: 'live',
      type: 'video',
      part: 'snippet',
      maxResults: 1,
    });

    const isLive = res.data.items.length > 0;

    if (isLive) {
      const video = res.data.items[0];

      const thumbnail = video.snippet.thumbnails.high?.url
  || video.snippet.thumbnails.medium?.url
  || video.snippet.thumbnails.default?.url;

      console.log(`🔴 ${vtuber.name} is LIVE!`);
      console.log(`📺 Title: ${video.snippet.title}`);
      console.log(`🔗 https://www.youtube.com/watch?v=${video.id.videoId}\n`);
      
      // Build the embed message
      const embed = new EmbedBuilder()
        .setTitle(`🔴 ${vtuber.name} is LIVE!`)
        .setDescription(` # 📺 ${decode(video.snippet.title)}`)
        .setURL(`https://www.youtube.com/watch?v=${video.id.videoId}`)
        .setImage(thumbnail)
        .setColor(0xff0000)
        .setTimestamp();

      const channel = await client.channels.fetch('1352979949937754152'); // Replace with your actual channel ID
      const channel2 = await client.channels.fetch('1359013954768076842');

      if (channel && channel.isTextBased()) {
        await channel.send({ embeds: [embed] });
      } else {
        console.warn(`⚠️ ${channel} : Could not send message: Channel not found or not text-based.`);
      }
        
      if (channel2 && channel2.isTextBased()) {
        await channel2.send({ embeds: [embed] });
      } else {
        console.warn(`⚠️ ${channel2} : Could not send message: Channel not found or not text-based.`);
      }

    } else {
      console.log(`⚪ ${vtuber.name} is not live.`);
    }

    
    
  } catch (err) {
    console.error(`❌ Error with ${vtuber.name}: ${err.message}`);
  }
  
  
}

// Main loop to check all VTubers
async function monitorAll() {
  console.log(`\n🔍 Checking VTuber live status at ${new Date().toLocaleTimeString()}...`);
  for (const vtuber of vtubers) {
    await checkIfLive(vtuber);
  }
}

monitorAll();
// Run every 60 seconds
setInterval(monitorAll, 30 * 60 * 1000);

client.login(process.env.bot_token);