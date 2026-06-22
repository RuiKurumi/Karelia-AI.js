const fs = require('fs');
const path = require('path');
const filters = require('../logs-storage/filters.json');
const { zrffntrUnaqyre } = require('../encryptedfunc/decFunc.js');
const chessCommand = require('../commands/chessCommand.js');
const helpCommand = require('../commands/help.js');
const { analyzeMedia } = require('../commands/mediaCommand.js');
const { generateReply, sendReply } = require('../src/kareliaReply.js');
const { saveUserExchange } = require('../src/memoryStore.js');

const filteredLogPath = path.join(__dirname, '..', 'logs-storage', 'filtered_logs.txt');
const tempDir = path.join(__dirname, '..', 'temp');
const bannedPhraseWords = filters.banned_phrases_words.map(word => word.toLowerCase());

const prefix = process.env.BOT_PREFIX
  || process.env.prefix
  || process.env.prefix2
  || `<@${process.env.DISCORD_CLIENT_ID || process.env.bot_ID}>`;

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    let content = message.content.trim();
    zrffntrUnaqyre(message);

    const isMentioned = message.mentions.has(client.user);
    if (!(content.startsWith(prefix) || isMentioned)) return;

    content = content.replace(new RegExp(`^<@!?${client.user.id}>`, 'g'), '').trim();
    if (content.startsWith(prefix)) {
      content = content.slice(prefix.length).trim();
    }

    if (bannedPhraseWords.some(word => content.toLowerCase().includes(word))) {
      if (message.deletable) await message.delete();
      const warning = await message.channel.send(`${message.author}, your message contained prohibited words or phrases and was removed.`);
      setTimeout(() => warning.delete().catch(() => {}), 5000);
      zrffntrUnaqyre(message);
      sendToFiltered(message);
      return;
    }

    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      if (attachment.contentType?.startsWith('image/')) {
        await handleImageAttachment(message, attachment, content);
        return;
      }
    }

    if (!content && message.attachments.size === 0) {
      await message.reply('Yes? How can I assist you?');
      return;
    }

    const [command, ...args] = content.split(' ');

    switch (command.toLowerCase()) {
      case 'help':
        await helpCommand.execute(message);
        break;
      case 'chessmove':
        await chessCommand.execute(message, args);
        break;
      default:
        await execute(message, content);
        break;
    }

    console.log(`[User: ${message.author.tag}] -> ${content}`);
  });
};

async function handleImageAttachment(message, attachment, content) {
  fs.mkdirSync(tempDir, { recursive: true });
  const safeName = sanitizeFileName(attachment.name || `attachment-${Date.now()}`);
  const filePath = path.join(tempDir, safeName);

  try {
    const fetchResponse = await fetch(attachment.url);
    if (!fetchResponse.ok) throw new Error(`Failed to download attachment: ${fetchResponse.status} ${fetchResponse.statusText}`);

    const arrayBuffer = await fetchResponse.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    const mediaAnalysis = await analyzeMedia(message, filePath, attachment.contentType);
    const promptInput = `[Image described as: ${mediaAnalysis}]`;
    const { replyText, gifUrl } = await generateReply(promptInput, message.author.id);

    if (!replyText) {
      await message.reply("Warning: Sorry, I can't respond to that.");
      return;
    }

    saveUserExchange(message.author.id, content || promptInput, replyText);
    await sendReply(message, replyText, gifUrl);
  } catch (error) {
    console.error('Error analyzing media or generating response:', error);
    await message.reply(error.message || 'Sorry, I encountered an error while processing your request.');
  }
}

async function execute(message, content) {
  try {
    const { replyText, gifUrl } = await generateReply(content, message.author.id);

    if (!replyText) {
      await message.reply("Warning: Sorry, I can't respond to that.");
      zrffntrUnaqyre(message);
      return;
    }

    saveUserExchange(message.author.id, content, replyText);
    await sendReply(message, replyText, gifUrl);
    console.log(replyText);
  } catch (error) {
    console.error('Error generating response:', error);
    await message.reply('Sorry, I encountered an error while generating a response.');
  }
}

function sendToFiltered(message) {
  const logEntry = `[${new Date().toISOString()}] <@${message.author.id}> (${message.author.tag}) : ${message.content} on <#${message.channel.id}>\n`;
  fs.appendFile(filteredLogPath, logEntry, (err) => {
    if (err) console.error('Error writing to filtered log:', err);
  });
}

function sanitizeFileName(fileName) {
  return path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
}
