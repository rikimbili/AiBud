/*
  TODO
  - Handle massive prompt sizes as a result of big conversation histories
  - Add Search, Image Classification/Creation and question/answer functionality
  - Discord status
*/
import 'dotenv/config'
import { Client, Intents } from 'discord.js';
import {GPTJ, GPT3} from './aimodels.js' // Import neural network models
import promptsPreset from './prompts.json' // Import prompts

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}); // Initialize the discord client with the right permissions

// Allows for Server Context
// This array will hold different prompt objects for each server AiBud is in
const prompts = [];

/**
 * @description Gets the specified prompt
 *
 * @param {number} promptIdx Prompt index for the discord server the message was sent in
 *
 * @returns {string} Prompt
 */
function getPrompt(promptIdx) {
  for (const [promptKey, promptValue] of Object.entries(prompts[promptIdx].prompt)) {
    if (promptKey === prompts[promptIdx].selectedPrompt) {
      return promptValue;
    }
  }
}

/**
 * @description Changes the default name throughout the prompts to the user's name
 *
 * @param {number} promptIdx Prompt index for the discord server the message was sent in
 * @param {string} name Name of the user to change the prompt to
 */
function changeNameOccurrences(promptIdx, name) {
  if (prompts[promptIdx].defaultNameNeedsChange) {
    for (const [promptKey, promptValue] of Object.entries(prompts[promptIdx].prompt)) {
      prompts[promptIdx].prompt[promptKey] = promptValue.replaceAll("You:", `${name}:`);
    }
    prompts[promptIdx].defaultNameNeedsChange = false;
  }
}

/**
 * @description Concatenates the specified prompt
 *
 * @param {number} promptIdx Prompt index for the discord server the message was sent in
 * @param {string} newPrompt New prompt to concatenate
 */
function concatPrompt(promptIdx, newPrompt) {
  for (const [promptKey, promptValue] of Object.entries(prompts[promptIdx].prompt)) {
    if (promptKey === prompts[promptIdx].selectedPrompt) {
      prompts[promptIdx].prompt[promptKey] = promptValue + newPrompt;
    }
  }
}

/**
 * @description Get the prompt object index if it exists or create a prompt object for the discord server
 *
 * @param {string} serverID ID of the server the message was sent in
 *
 * @returns {number} Return 0 if the prompt object is created or the prompt object index if it was already in the array
 */
function getPromptObjectIndex(serverID) {
  // Get index if prompt object already exists for the server
  const promptIdx = prompts.findIndex((prompt) => prompt.serverId === serverID)

  // If Prompt object already exists for the server, return the index
  if (promptIdx !== -1) {
    return promptIdx;
  }
  // Create a new prompt object for the server
  else {

    prompts.push({
      serverId: serverID, // Server ID of the server the message was sent in
      prompt: JSON.parse(JSON.stringify(promptsPreset)), // Create a new object from the prompts preset
      selectedPrompt: "normal", // Default prompt
      defaultNameNeedsChange: true, // If the default name in the prompts needs to be changed
    });
    return 0;
  }
}

/**
 * @description Resets the prompt to the default preset for the server and makes a new object in the prompts array
 * if the server is not found in the array
 *
 * @param {Message} message Server id to reset the prompt for
 */
function resetPromptStep(message) {
  // Replace the existing prompt with the preset prompt for the current discord server
  prompts[getPromptObjectIndex(message.guildId)].prompt = JSON.parse(JSON.stringify(promptsPreset));

  console.log(`\nReset prompt "${prompts[getPromptObjectIndex(message.guildId)].selectedPrompt}" for ${message.guildId}\n`);
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
  // Get the prompt object index for the current discord server
  const promptIdx = getPromptObjectIndex(message.guildId);
  // Change the default prompt name occurrences to either the server nickname or username
  if (prompts[promptIdx].defaultNameNeedsChange) {
    changeNameOccurrences(promptIdx, message.member.nickname || message.author.username);
  }

  const userPrompt = `${message.member.nickname || message.author.username}: ${message.content
    .replace("!ai", "")
    .trim()}\n`;

  // Case where the prompt is empty
  if (message.content.replace("!ai", "").trim().length === 0) {
    message.reply("`Empty prompt received\nType a valid prompt`");
    return;
  }

  // Add the user's message to the selected prompt
  concatPrompt(promptIdx,userPrompt + `AiBud: `);

  // Send the prompt to OpenAI and wait for the magic to happen 🪄
  GPT3(getPrompt(promptIdx)).then((gptResponse) => {
    const response  = gptResponse.data.choices[0]?.text.trim();
    // Check if response is empty and
    if(response.length === 0) {
      console.log("Empty response received from OpenAI complete engine");
      message.reply("`Empty response received\nTry again`");
    }
    else {
      concatPrompt(promptIdx, `${gptResponse.data.choices[0].text}\n`);
      console.log(userPrompt + `AiBud: ${response}`);
      message.reply(`${response}`);
    }
  }).catch((err) => {
    console.log(err);
    message.reply("`Error occurred while generating prompt\n`");
  });
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

  // Get the prompt object index for the current discord server
  const promptIdx = getPromptObjectIndex(message.guildId);

  // Check if the entered prompt exists and set it to the selected prompt if it does
  for (const [promptKey, promptValue] of Object.entries(prompts[promptIdx].prompt)) {
    if (promptKey === enteredPrompt) {
      if (prompts[promptIdx].selectedPrompt === enteredPrompt)
        message.reply(`\`Behavior prompt already set to ${enteredPrompt}\``);
      else {
        prompts[promptIdx].selectedPrompt = enteredPrompt;
        message.reply(`\`Behavior prompt set to ${enteredPrompt}\``);
      }
      return;
    }
  }
  message.reply(`\`Behavior prompt ${enteredPrompt} not found\``);
}

// Main program loop that gets triggered everytime someone sends a message in any channel
client.on("messageCreate", (message) => {
  if (message.author.bot) return; // Return if the message was sent by a bot including AiBud itself


  if (message.content.startsWith("!ai.")){
    // Reset prompt history case
    if (message.content.startsWith("!ai.reset")) {
      resetPromptStep(message);
    }
    // Set entered prompt case
    else if (message.content.startsWith("!ai.set")) {
      setEnteredPromptStep(message);
    }
    // Invalid prompt case
    else {
      message.reply(`\`Invalid option ${message.content.trim()} received\nType a valid option\``);
    }
  }
  // Prompt command case
  else if (message.content.startsWith("!ai")) {
    generatePromptStep(message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
