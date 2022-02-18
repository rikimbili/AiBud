/*
  TODO
  - Handle massive prompt sizes as a result of big conversation histories
  - Add Search, Image Classification/Creation and question/answer functionality
  - Discord status
*/
import 'dotenv/config'
import { Client, Intents } from 'discord.js';
import * as steps from './steps.js';

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}); // Initialize the discord client with the right permissions


// Main program loop that gets triggered everytime someone sends a message in any channel of the server the bot has access to
client.on("messageCreate", (message) => {
  if (message.author.bot) return; // Return if the message was sent by a bot including AiBud itself


  if (message.content.startsWith("!ai.")){
    // Reset prompt history case
    if (message.content.startsWith("!ai.reset")) {
      steps.resetPromptStep(message);
    }
    // Set entered prompt case
    else if (message.content.startsWith("!ai.set ")) {
      steps.setEnteredPromptStep(message);
    }
    // Set model engine
    else if (message.content.startsWith("!ai.setmodel")) {
      steps.setEnteredModelStep(message);
    }
    else if (message.content.startsWith("!ai.setengine")) {
      steps.setEnteredEngineStep(message);
    }
    // Help Case
    else if (message.content.startsWith("!ai.help")) {
      if ("!ai.help" === message.content.trim())
        message.reply(
            "`!ai.reset` - Resets the prompt history and returns it to default\n" +
            "`!ai.set [prompt name]` - Sets the prompt to the entered prompt.\n" +
            "`!ai [prompt]` - Generates a prompt using the entered prompt\n" +
            "`!ai.setmodel [model name]` - Sets the model to be used for processing the prompt\n" +
            "`!ai.setengine [engine name]` - Sets the engine to be used for processing the prompt\n" +
            "`!ai.help` - Shows this help message\n" +
            "`!ai.help set` - Shows all the prompt names you can choose from\n"
        );
      else if ("!ai.help set" === message.content.trim())
        message.reply(
            `\`Prompts you can choose from:\n${Object.keys(promptsPreset).toString().replaceAll(",", ", ")}\``
        );
      else
        message.reply(`\`Invalid help command ${message.content.replace("!ai.help", "").trim()} entered \``);
    }
    else {
      message.reply(`\`Invalid command ${message.content.trim()} entered\nType !ai.help for help\``);
    }
  }
  // Prompt command case
  else if (message.content.startsWith("!ai ")) {
    generatePromptStep(message);
  }
  // Invalid command case
  else if (message.content.startsWith("!ai")) {
    message.reply(`\`Invalid command ${message.content.trim()} entered\nType !ai.help for help\``);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
