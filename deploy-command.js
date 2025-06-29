// deploy-commands.js
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Load .env
config();

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARNING] The command at ${file} is missing "data" or "execute".`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.bot_token);

try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  await rest.put(
    Routes.applicationCommands(process.env.bot_ID),
    { body: commands },
  );

  console.log('✅ Successfully reloaded all application (/) commands.');
} catch (error) {
  console.error('❌ Failed to deploy commands:', error);
}
