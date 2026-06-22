const fs = require('fs');
const path = require('path');
const { VALID_TAGS } = require('./gifHandler.js');
const { getUserMemory } = require('./memoryStore.js');

const personalityPath = path.join(__dirname, '..', 'personality.json');
const personalityData = JSON.parse(fs.readFileSync(personalityPath, 'utf8'));
const botName = personalityData.name || 'Karelia';
const persona = personalityData.persona;
const styleExamples = (personalityData.examples || []).slice(-3);
const validTagsString = VALID_TAGS.filter(tag => tag !== 'none').join(', ');

function formatExchanges(exchanges) {
  return exchanges
    .map(exchange => {
      const reply = exchange.bot || exchange.karelia || '';
      return exchange.user ? `user: ${exchange.user}\n${botName}: ${reply}` : `${botName}: ${reply}`;
    })
    .join('\n\n');
}

function buildSystemPrompt(userId) {
  const userMemory = getUserMemory(userId);
  const formattedExamples = formatExchanges(styleExamples);
  const memories = userMemory.memories.length
    ? userMemory.memories.map(m => `- ${m.text}`).join('\n')
    : '- No durable memories stored yet.';
  const recentExchanges = userMemory.recentExchanges.length
    ? formatExchanges(userMemory.recentExchanges)
    : 'No recent exchanges with this user yet.';

  return `You are "${botName}", a ${persona}. Respond naturally in your own words, keeping responses short and playful when possible. Don't have a filter with the words you use.

Style examples:
${formattedExamples}

Memories about this user:
${memories}

Last 3 exchanges with this user:
${recentExchanges}

Respond to the user's input in your own way. Use memories only when they are relevant, and do not mention that you are using a memory system.

After your reply, on a new line add: TAG: <one of: ${validTagsString}, none>
Pick the tag that best matches the mood of YOUR reply. Only use "none" if no tag fits at all.`;
}

module.exports = { buildSystemPrompt, botName };