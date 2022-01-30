/*
  TODO
  - Keep a conversation history prompt in general and for each user
    - Handle massive prompt sizes as a result of big conversation histories
    - Handle resetting
  - Add Search, Image Classification/Creation and question/answer functionality
*/

const OpenAI = require("openai-api");
const { Client, Intents } = require("discord.js");
const promptsPreset = require("./prompts.json"); // Import prompts to feed OpenAI with some context
require("dotenv").config();

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Initialize OpenAI
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}); // Initialize the discord client with the right permissions
let prompts = new Array(); // Initialize the prompts array
let lastBotMessages;

/**
 * @description Resets the prompt to default for the user
 *
 * @param {Message} message Message object from Discord
 */
function resetPromptStep(message) {
  prompts = new Array();
  message.channel.send(
    "Reset conversation history for user " + message.author.username
  );
}

// /**
//  * @description Create new prompt for the user
//  *
//  * @param {string} userId User ID
//  * @param {string} prompt Prompt to add
//  */
// function createPrompt(userId, prompt) {
//   if(prompts?.forEach(prompt => prompt.userId === userId)) {

//   }
//   prompts.push({
//     userId: userId,
//     prompt: prompt,
//   });
// }

// /**
//  * @description Gets the specified prompt for the user
//  *
//  * @param {string} userId User ID
//  * @param {string} selectedPrompt Prompt to get
//  */
// function getPrompt(userId, selectedPrompt) {}

client.on("messageCreate", (message) => {
  if (message.author.bot) return; // Return if the message was sent by a bot including AiBud itself

  // Reset the conversation history for the user
  if (message.content.startsWith("!ai.reset")) {
    prompts[message.author.id] = [];
    message.channel.send(
      "Reset conversation history for user " + message.author.username
    );
  }
  // Prompt command case
  else if (message.content.includes("!ai")) {
    // Make sure the bot appears as typing while the request is processing
    message.channel.sendTyping();

    // Add the user's message to the personality prompt
    prompts[message.author.id].baseline += `${
      message.author.username
    }: ${message.content.replace("!ai", "").trim()}\n`;

    // Send the prompt to OpenAI and wait for the magic to happen 🪄
    async () => {
      const gptResponse = await openai.complete({
        engine: "davinci",
        prompt: personality_prompts.baseline,
        maxTokens: 150,
        temperature: 0.3,
        topP: 0.3,
        presencePenalty: 0,
        frequencyPenalty: 0.5,
        bestOf: 1,
        n: 1,
        stream: false,
        stop: ["\n", "\n\n"],
      });
      const response = gptResponse.data.choices[0]?.text.substring(7);

      message.reply(`${response}`);
      personality_prompts.baseline += `${gptResponse.data.choices[0].text}\n`;

      console.log(personality_prompts.baseline);
    };
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
