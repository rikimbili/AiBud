const OpenAI = require("openai-api");
const { Client, Intents } = require("discord.js");
require("dotenv").config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.login(process.env.DISCORD_BOT_TOKEN);
