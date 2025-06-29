import { SlashCommandBuilder } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.g_apiKey);

const model = ai.getGenerativeModel({
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} }],
});

export const data = new SlashCommandBuilder()
  .setName('groundedask')
  .setDescription('Ask Gemini with real-world data (via Google Search)')
  .addStringOption(option =>
    option.setName('prompt')
      .setDescription('Your question')
      .setRequired(true)
  );

export async function execute(interaction) {
  const prompt = interaction.options.getString('prompt');
  await interaction.deferReply();

  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    if (!text) {
      return await interaction.editReply('⚠️ Gemini gave no reply.');
    }

    // Trim to 2000 characters max, and ensure it ends with a period
    let reply = text.slice(0, 2000);
    if (!reply.endsWith('.')) {
      const lastPeriod = reply.lastIndexOf('.');
      reply = lastPeriod !== -1 ? reply.slice(0, lastPeriod + 1) : reply + '.';
    }

    await interaction.editReply(reply.trim());
  } catch (error) {
    console.error('Gemini grounding error:', error);
    await interaction.editReply('❌ Error while querying Gemini.');
  }
}
