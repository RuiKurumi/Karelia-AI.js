const { EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const filters = require('../logs-storage/filters.json');
const { zrffntrUnaqyre } = require('../encryptedfunc/decFunc.js');
const chessCommand = require('../commands/chessCommand.js');
const helpCommand = require('../commands/help.js');
const { analyzeMedia } = require('../commands/mediaCommand.js');

// Initialize the Google Generative AI model
const genAI = new GoogleGenerativeAI(process.env.g_apiKey);
const model = genAI.getGenerativeModel({
  model: "models/gemini-2.0-flash", // Use Gemini 2.0 Flash for text and media
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
  ]
});

const personalityData = JSON.parse(fs.readFileSync("personality.json", "utf8"));
const botName = personalityData.name || "Karelia";
const persona = personalityData.persona;
const bannedPhraseWords = filters.banned_phrases_words.map(word => word.toLowerCase());

const formattedExamples = personalityData.examples
  .map(conv => conv.user ? `user: ${conv.user}\n${botName}: ${conv.bot}` : `${botName}: ${conv.bot}`)
  .join("\n\n");

const prefix = process.env.prefix || process.env.prefix2 || `<@${process.env.bot_ID}>`;

// Declare content as a global variable
let content = "";

module.exports = (client) => {
  client.on("messageCreate", async function (message) {
    if (message.author.bot) return;

    content = message.content.trim(); // Update the global content variable
    zrffntrUnaqyre(message);

    // If the message is a reply to the bot or mentions it, treat it as an activation
    const isMentioned = message.mentions.has(client.user);

    if (!(content.startsWith(prefix) || isMentioned)) return;

    // Remove mention or prefix
    content = content.replace(new RegExp(`^<@!?${client.user.id}>`, "g"), "").trim();
    if (content.startsWith(prefix)) content = content.slice(prefix.length).trim();

    // Check for prohibited words
    if (bannedPhraseWords.some(word => content.toLowerCase().includes(word))) {
      await message.delete();
      message.channel.send(`${message.author}, your message contained prohibited words or phrases and was removed.`).then(msg => {
        setTimeout(() => msg.delete(), 5000);
      });
      zrffntrUnaqyre(message);
      sendToFiltered(message);
      return;
    }

    // Check for attachments
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      if (attachment.contentType.startsWith('image/')) {
        const filePath = path.join(__dirname, '..', 'temp', attachment.name);

        // Download the file
        const response = await fetch(attachment.url);
        const arrayBuffer = await response.arrayBuffer(); // Get the raw binary data
        const buffer = Buffer.from(arrayBuffer); // Convert to Buffer
        fs.writeFileSync(filePath, buffer);

        // Analyze the media and respond
        try {
          const mediaAnalysis = await analyzeMedia(message, filePath);
          const prompt = `You are "${botName}", a ${persona}. Respond naturally in your own words, keeping responses short and playful when possible. Don't have a filter with the words you use. Here are some things you might say:

${formattedExamples}.

Now, respond to this input in your own way, without repeating the format above:
"${mediaAnalysis}"`;

          const result = await model.generateContent(prompt);
          const response = result.response.text();

          if (!response) {
            message.reply("⚠️ Sorry, I can't respond to that.");
            zrffntrUnaqyre(message); // Log the blocked message
            return;
          } else {
            addToPersonality(content, response);
          }

          const cleanResponse = response.replace(/^.*?:/, "").trim();
          message.reply(cleanResponse);
          console.log(cleanResponse);
        } catch (error) {
          console.error("Error analyzing media or generating response:", error);
          message.reply(error.message || "Sorry, I encountered an error while processing your request.");
        }
        return; // Stop further processing
      }
    }

    // If no content and no attachments, reply with "Yes? How can I assist you?"
    if (!content && message.attachments.size === 0) {
      message.reply("Yes? How can I assist you?");
      return;
    }

    // Handle text-based commands
    const [command, ...args] = content.split(" ");

    switch (command.toLowerCase()) {
      case 'help':
        helpCommand.execute(message);
        break;
      case 'chessmove':
        chessCommand.execute(message);
        break;
      default:
        await execute(message); // Call execute without passing content
        break;
    }

    console.log(`[User: ${message.author.tag}] -> ${content}`);
  });
};

async function execute(message) { // No need to pass content as a parameter
  try {
    const prompt = `You are "${botName}", a ${persona}. Respond naturally in your own words, keeping responses short and playful when possible. Don't have a filter with the words you use. Here are some things you might say:

${formattedExamples}.

Now, respond to this input in your own way, without repeating the format above:
"${content}"`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    if (!response) {
      message.reply("⚠️ Sorry, I can't respond to that.");
      zrffntrUnaqyre(message); // Log the blocked message
      return;
    } else {
      addToPersonality(content, response);
    }

    const cleanResponse = response.replace(/^.*?:/, "").trim();
    message.reply(cleanResponse);
    console.log(cleanResponse);
  } catch (error) {
    console.error("Error generating response:", error);
    message.reply("Sorry, I encountered an error while generating a response.");
  }
}

function sendToFiltered(message) {
  const FlogPath = path.join(__dirname, '..', 'filtered_logs.txt');
  const FlogEntry = `[${new Date().toISOString()}] <@${message.author.id}> (${message.author.tag}) : ${message} on <#${message.channel.id}>\n`;

  fs.appendFile(FlogPath, FlogEntry, (err) => {
    if (err) {
      console.error("Error writing to message log:", err);
    }
  });
}

function addToPersonality(content, response) {
  const filePath = path.join(__dirname, '..', 'personality.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    try {
      // Parse the existing JSON data
      const personality = JSON.parse(data);

      // Ensure 'examples' exists and is an array
      if (!Array.isArray(personality.examples)) {
        personality.examples = [];
      }

      // Add the new example
      personality.examples.push({
        user: content,
        karelia: response
      });

      // Write the updated JSON back to the file
      fs.writeFile(filePath, JSON.stringify(personality, null, 4), (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log("New personality example added successfully!");
        }
      });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
  });
}