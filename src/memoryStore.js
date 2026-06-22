const fs = require('fs');
const path = require('path');

const memoryPath = path.join(__dirname, '..', 'data', 'user-memories.json');

function readMemoryStore() {
  try {
    if (!fs.existsSync(memoryPath)) return { users: {} };
    const store = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
    return store && typeof store === 'object' && store.users ? store : { users: {} };
  } catch (error) {
    console.error('Error reading user memory store:', error);
    return { users: {} };
  }
}

function writeMemoryStore(store) {
  try {
    fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
    fs.writeFileSync(memoryPath, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error('Error writing user memory store:', error);
  }
}

function normalizeUserMemory(userMemory = {}) {
  return {
    memories: Array.isArray(userMemory.memories) ? userMemory.memories : [],
    recentExchanges: Array.isArray(userMemory.recentExchanges) ? userMemory.recentExchanges : []
  };
}

function getUserMemory(userId) {
  const store = readMemoryStore();
  return normalizeUserMemory(store.users[userId]);
}

function saveUserExchange(userId, userInput, botReply) {
  const store = readMemoryStore();
  const userMemory = normalizeUserMemory(store.users[userId]);

  userMemory.recentExchanges.push({
    user: userInput,
    bot: botReply,
    at: new Date().toISOString()
  });
  userMemory.recentExchanges = userMemory.recentExchanges.slice(-3);

  const memoryText = extractMemory(userInput);
  if (memoryText && !userMemory.memories.some(m => m.text.toLowerCase() === memoryText.toLowerCase())) {
    userMemory.memories.push({
      text: memoryText,
      source: userInput,
      createdAt: new Date().toISOString()
    });
    userMemory.memories = userMemory.memories.slice(-20);
  }

  store.users[userId] = userMemory;
  writeMemoryStore(store);
}

function extractMemory(userInput) {
  const trimmed = userInput.trim();
  const patterns = [
    { regex: /\bmy name is\s+(.{1,80})$/i, label: 'The user says their name is' },
    { regex: /\bcall me\s+(.{1,80})$/i, label: 'The user likes to be called' },
    { regex: /\bi am\s+(.{1,120})$/i, label: 'The user says they are' },
    { regex: /\bi'm\s+(.{1,120})$/i, label: 'The user says they are' },
    { regex: /\bi like\s+(.{1,120})$/i, label: 'The user likes' },
    { regex: /\bi love\s+(.{1,120})$/i, label: 'The user loves' },
    { regex: /\bi hate\s+(.{1,120})$/i, label: 'The user dislikes' },
    { regex: /\bremember that\s+(.{1,180})$/i, label: 'The user wants remembered that' }
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern.regex);
    if (match?.[1]) return `${pattern.label} ${stripTrailingPunctuation(match[1])}.`;
  }

  return null;
}

function stripTrailingPunctuation(value) {
  return value.trim().replace(/[.!?]+$/, '');
}

module.exports = { getUserMemory, saveUserExchange };