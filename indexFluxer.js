// indexFluxer.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { WebSocketManager } = require('@discordjs/ws');
const { Client, GatewayDispatchEvents } = require('@discordjs/core');
const { EmbedBuilder } = require('@discordjs/builders');
const { google } = require('googleapis');
const youtube = google.youtube('v3');
const { decode } = require('entities');

// --- FLUXER CONNECTION SETUP ---
const token = process.env.bot_token; // Ensure this is your FLUXER bot token

const rest = new REST({ api: "https://api.fluxer.app", version: "1" }).setToken(token);
const gateway = new WebSocketManager({
    token,
    intents: 0, // Fluxer ignores intents
    rest,
    version: "1",
});

const client = new Client({ rest, gateway });

// --- COMMAND & EVENT LOADING ---
// Note: client.commands is handled slightly differently in @discordjs/core
// --- LOAD FLUXER EVENTS ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('Fluxer.js'));

for (const file of eventFiles) {
    const eventInit = require(path.join(eventsPath, file));
    // Pass the client to the event file
    eventInit(client); 
    console.log(`✅ Registered Fluxer Event: ${file}`);
}

// Global Debug: See if ANY gateway event is arriving
gateway.on('debug', console.log);

// --- FLUXER EVENTS ---
client.on(GatewayDispatchEvents.Ready, ({ data }) => {
    console.log(`Karelia-AI-v2.0.0 online on Fluxer as ${data.user.username}`);
    
    // Start VTuber monitoring
    monitorAll();
    setInterval(monitorAll, 30 * 60 * 1000);
});

// Interaction Handling (Slash Commands)
client.on(GatewayDispatchEvents.InteractionCreate, async ({ api, data: interaction }) => {
    const command = commands.get(interaction.data.name);
    if (!command) return;

    try {
        await command.execute(interaction); 
    } catch (error) {
        console.error(`❌ Error in command ${interaction.data.name}:`, error);
    }
});

// --- YOUTUBE LOGIC ---
const API_KEY = process.env(GemAPI);
const vtubers = [
    { name: "Yubari Rei", channelId: "UCnn1Pb_JtyHbiDTELf7mgSA" },
    { name: "Mori Calliope", channelId: "UCL_qhgtOy0dy1Agp8vkySQg" },
    { name: "Sameko Saba", channelId: "UCxsZ6NCzjU_t4YSxQLBcM5A" }
];

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

        if (res.data.items.length > 0) {
            const video = res.data.items[0];
            const thumbnail = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url;

            console.log(`🔴 ${vtuber.name} is LIVE!`);

            const embed = new EmbedBuilder()
                .setTitle(`🔴 ${vtuber.name} is LIVE!`)
                .setDescription(`# 📺 ${decode(video.snippet.title)}`)
                .setURL(`https://www.youtube.com/watch?v=${video.id.videoId}`)
                .setImage(thumbnail)
                .setColor(0xff0000)
                .setTimestamp();

            // REPLACE THESE WITH FLUXER CHANNEL IDs
            const channels = ['FLUXER_CHANNEL_ID_1', 'FLUXER_CHANNEL_ID_2'];

            for (const id of channels) {
                try {
                    await client.api.channels.createMessage(id, { 
                        embeds: [embed.toJSON()] 
                    });
                } catch (e) {
                    console.warn(`⚠️ Fluxer: Could not send to channel ${id}`);
                }
            }
        } else {
            console.log(`⚪ ${vtuber.name} is not live.`);
        }
    } catch (err) {
        console.error(`❌ Error with ${vtuber.name}: ${err.message}`);
    }
}

async function monitorAll() {
    console.log(`\n🔍 Checking VTuber live status at ${new Date().toLocaleTimeString()}...`);
    for (const vtuber of vtubers) {
        await checkIfLive(vtuber);
    }
}

// Start the gateway connection
gateway.connect();
