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
let prompts = promptsPreset; // Initialize the prompts array
let selectedPrompt = "normal"; // Prompt to use
let lastBotMessages = new Array(process.env.MAX_BOT_PROMPT_HISTORY); // Stores the last bot messages
let defaultNameNeedsChange = true; // Keeps track of whether the default name needs to be changed

/**
 * @description Gets the specified prompt
 *
 * @param {string} selectedPrompt Prompt to get
 *
 * @returns {string} Prompt
 */
function getPrompt(selectedPrompt) {
  for (const [promptKey, promptValue] of Object.entries(prompts)) {
    if (promptKey === selectedPrompt) {
      return promptValue;
    }
  }
}

/**
 * @description Changes the default name throughout the prompts to the user's name
 *
 * @param {string} username Name of the user to change the prompt to
 */
function changeNameOccurrences(username) {
  if (defaultNameNeedsChange) {
    for (const [promptKey, promptValue] of Object.entries(prompts)) {
      prompts[promptKey] = promptValue.replaceAll("You:", `${username}:`);
    }
    defaultNameNeedsChange = false;
  }
}

/**
 * @description Concatenates the specified prompt
 *
 * @param {string} newPrompt New prompt to concatenate
 */
function concatPrompt(newPrompt) {
  for (const [promptKey, promptValue] of Object.entries(prompts)) {
    if (promptKey === selectedPrompt) {
      prompts[selectedPrompt] = promptValue + newPrompt;
    }
  }
}

/**
 * @description Resets the prompt to default for the user
 *
 * @param {Message} message Message object from Discord
 */
function resetPromptStep(message) {
  prompts = promptsPreset;
  message.channel.send("🪄`Memory Reset`🪄");
}

/**
 * @description Resets the prompt to default for the user
 *
 * @param {Message} message Message object from Discord
 */
async function generatePromptStep(message) {
  const userPrompt = `${message.author.username}: ${message.content
    .replace("!ai", "")
    .trim()}\n`;

  // Add the user's message to the selected prompt
  concatPrompt(userPrompt);

  // Send the prompt to OpenAI and wait for the magic to happen 🪄
  const gptResponse = await openai.complete({
    engine: "davinci",
    prompt: getPrompt(selectedPrompt),
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
  const response = gptResponse.data.choices[0]?.text.substring(6).trim();

  // Reset prompt if messages keep repeating
  for (const message of lastBotMessages) {
    if (message === response) {
      resetPromptStep(message);
      return;
    }
  }

  message.reply(`${response}`);
  concatPrompt(`${gptResponse.data.choices[0].text}\n`);
}

/**
 * @description Sets the prompt to the entered prompt
 *
 * @param {Message} message Message object from Discord
 */
function setEnteredPromptStep(message) {
  const enteredPrompt = message.content.replace("!ai.set", "").trim();

  if (enteredPrompt.length === 0)
    return message.reply("`Empty prompt entered\nEnter a valid prompt`");

  // Check if the entered prompt exists and set it to the selected prompt if it does
  for (const [promptKey, promptValue] of Object.entries(prompts)) {
    if (promptKey === enteredPrompt) {
      if (selectedPrompt == enteredPrompt)
        message.reply("`Behavior prompt already set`");
      else {
        selectedPrompt = enteredPrompt;
        message.reply(`\`Behavior prompt set to ${selectedPrompt}\``);
      }
      return;
    }
  }
  message.reply(`\`Behavior prompt ${enteredPrompt} not found\``);
}

client.on("messageCreate", (message) => {
  if (message.author.bot) return; // Return if the message was sent by a bot including AiBud itself

  if (message.content.startsWith("!ai")) {
    message.channel.sendTyping(); // Show the bot as typing in the channel
    changeNameOccurrences(message.author.username); // Change the default prompt name occurrences
  }

  // Reset prompt history case
  if (message.content.startsWith("!ai.reset")) {
    resetPromptStep(message);
  }
  // Set entered prompt case
  else if (message.content.startsWith("!ai.set")) {
    setEnteredPromptStep(message);
  }
  // Prompt command case
  else if (message.content.startsWith("!ai")) {
    generatePromptStep(message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
