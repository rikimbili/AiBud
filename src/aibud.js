/*
  TODO
  - Keep a conversation history prompt in general and for each user
    - Handle massive prompt sizes as a result of big conversation histories
  - Add Search, Image Classification/Creation and question/answer functionality
*/

const OpenAI = require("openai-api");
const { Client, Intents, SnowflakeUtil} = require("discord.js");
const promptsPreset = require("./prompts.json"); // Import prompts to feed OpenAI with some context
require("dotenv").config();

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Initialize OpenAI
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}); // Initialize the discord client with the right permissions

// Server Context
// This array will hold different prompts for each server AiBud is in
const prompts = [];

/**
 * @description Gets the specified prompt
 *
 * @param {Snowflake} message Message object from Discord
 * @param {string} selectedPrompt Prompt to get
 *
 * @returns {string} Prompt
 */
function getPrompt(message, selectedPrompt) {
  const prompt_idx = getPromptObjectIndex(message);

  for (const [promptKey, promptValue] of Object.entries(prompts[prompt_idx].prompt)) {
    if (promptKey === prompts[prompt_idx].selectedPrompt) {
      return promptValue;
    }
  }
}

/**
 * @description Changes the default name throughout the prompts to the user's name
 *
 * @param {Snowflake} serverID ID of the server AiBud is in
 * @param {string} name Name of the user to change the prompt to
 */
function changeNameOccurrences(serverID, name) {
  // Get
  const prompt_idx = getPromptObjectIndex(serverID);

  if (prompts[prompt_idx].defaultNameNeedsChange) {
    for (const [promptKey, promptValue] of Object.entries(prompts[prompt_idx].prompt)) {
      prompts[prompt_idx].prompt[promptKey] = promptValue.replaceAll("You:", `${name}:`);
    }
    prompts[prompt_idx].defaultNameNeedsChange = false;
  }
}

/**
 * @description Concatenates the specified prompt
 *
 * @param {Message} message Message object from Discord
 * @param {string} newPrompt New prompt to concatenate
 */
function concatPrompt(message, newPrompt) {

  for (const [promptKey, promptValue] of Object.entries(prompts)) {
    if (promptKey === selectedPrompt) {
      prompts[getPromptObjectIndex(message)].prompt = promptValue + newPrompt;
    }
  }
}

/**
 * @description Get the prompt object index if it exists or create a prompt object for the discord server
 *
 * @param {Snowflake} serverID Server ID of the server AiBud is in
 *
 * @returns {number} Return 0 if the prompt object is created or the prompt object index if it was already in the array
 */
function getPromptObjectIndex(serverID) {
  // Prompt object already exists for the server
  const prompt_idx = prompts.findIndex((prompt) => prompt.serverId === serverID)

  if (prompt_idx !== -1) {
    // Prompt object already exists for the server, return the index
    return prompt_idx;
  }
  else {
    // Create a new prompt object for the server
    prompts.push({
      serverId: serverID,
      prompt: promptsPreset,
      selectedPrompt: "normal",
      defaultNameNeedsChange: true,
    });
    return 0;
  }
}

/**
 * @description Resets the prompt to the default preset for the server and makes a new object in the prompts array
 * if the server is not found in the array
 *
 * @param {Snowflake} serverID Server id to reset the prompt for
 */
function resetPromptStep(message) {
  // Replace the existing prompt with the preset prompt for the current discord server
  prompts[getPromptObjectIndex(message)].prompt = promptsPreset;

  message.channel.send("🪄`Prompt Reset`🪄");
}

/**
 * @description Generates and completes the selected prompt using OpenAI
 *
 * @param {Message} message Message object from Discord
 */
async function generatePromptStep(message) {
  // Show the bot as typing in the channel while the prompt is being generated
  await message.channel.sendTyping();
  // Change the default prompt name occurrences
  changeNameOccurrences(message, message.member.displayName);

  const userPrompt = `${message.author.username}: AiBud, ${message.content
    .replace("!ai", "")
    .trim()}\n`;

  // If the prompt is empty bail out
  if (message.content.replace("!ai", "").trim().length === 0) {
    message.reply("`Empty prompt received\nType a valid prompt`");
    return;
  }

  // Add the user's message to the selected prompt
  concatPrompt(userPrompt + `\nAiBud: `);

  // Send the prompt to OpenAI and wait for the magic to happen 🪄
  const gptResponse = await openai.complete({
    engine: "davinci",
    prompt: getPrompt(selectedPrompt),
    maxTokens: 128,
    temperature: 0.6,
    presencePenalty: 0.5,
    frequencyPenalty: 2.0,
    stop: ["\n", "\n\n"],
  });
  const response = gptResponse.data.choices[0]?.text.substring(6).trim();

  message.reply(`${response}`);
  concatPrompt(message, `${gptResponse.data.choices[0].text}\n`);
}

/**
 * @description Sets the prompt to the entered prompt
 *
 * @param {Message} message Message object from Discord
 */
function setEnteredPromptStep(message) {
  const enteredPrompt = message.content.replace("!ai.set", "").trim();

  if (enteredPrompt.length === 0)
    return message.reply(
      "`Empty prompt name received\nType a valid prompt name`"
    );

  // Check if the entered prompt exists and set it to the selected prompt if it does
  for (const [promptKey, promptValue] of Object.entries(prompts)) {
    if (promptKey === enteredPrompt) {
      if (selectedPrompt == enteredPrompt)
        message.reply(`\`Behavior prompt already set to ${selectedPrompt}\``);
      else {
        selectedPrompt = enteredPrompt;
        message.reply(`\`Behavior prompt set to ${selectedPrompt}\``);
      }
      return;
    }
  }
  message.reply(`\`Behavior prompt ${enteredPrompt} not found\``);
}

// Main program loop that gets triggered everytime someone sends a message in any channel
client.on("messageCreate", (message) => {
  if (message.author.bot) return; // Return if the message was sent by a bot including AiBud itself

  // Reset prompt history case
  if (message.content.startsWith("!ai.reset")) {
    resetPromptStep(message);
  }
  // Set entered prompt case
  else if (message.content.startsWith("!ai.set")) {
    setEnteredPromptStep(message);
  }
  // Invalid prompt case
  else if (message.content.startsWith("!ai.")) {
    message.reply("`Invalid prompt`");
  }
  // Prompt command case
  else if (message.content.startsWith("!ai")) {
    generatePromptStep(message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
