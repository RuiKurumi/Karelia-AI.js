const Groq = require('groq-sdk');
const { getGifForTag } = require('./gifHandler.js');
const { buildSystemPrompt } = require('./systemPrompt.js');

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const MODEL = 'llama-3.3-70b-versatile';

async function generateReply(userInput, userId) {
  if (!groq) throw new Error('GROQ_API_KEY is not configured.');

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(userId) },
      { role: 'user', content: userInput }
    ],
    max_tokens: 500
  });

  const raw = completion.choices[0]?.message?.content || '';
  const tagMatch = raw.match(/TAG:\s*(\w+)/i);
  const tag = tagMatch?.[1]?.toLowerCase() || 'none';
  const replyText = raw.replace(/\nTAG:.*$/im, '').trim() || null;
  const gifUrl = await getGifForTag(tag);

  console.log(`[TAG: ${tag}] [GIF: ${gifUrl ? 'yes' : 'no'}]`);
  return { replyText, gifUrl };
}

async function sendReply(message, replyText, gifUrl) {
  if (gifUrl) {
    await message.reply(replyText);
    await message.channel.send(gifUrl);
    return;
  }
  await message.reply(replyText);
}

module.exports = { generateReply, sendReply };