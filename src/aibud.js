/*
  TODO
  - Handle massive prompt sizes as a result of big conversation histories
  - Add Search, Image Classification/Creation and question/answer functionality
  - Discord status
*/
import "dotenv/config";
import { Client, Intents, Collection } from "discord.js";
import * as steps from "./steps/steps.js";
import * as deploy from "./deploy-commands.js";
import promptsPreset from "../prompts.json" assert { type: "json" };

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}); // Initialize the discord bot client with the right permissions

client.commands = new Collection();

// Display only once upon startup
client.once("ready", () => {
  console.log("AiBud is Online!");
});

// On each message, check if it is a command and run the main function if it is
client.on("interactionCreate", (interaction) => {
  if (!interaction.isCommand()) return; // Return if the message is not a bot command

  AiBud(interaction).catch((err) => {
    console.error(err);
    interaction.channel.send("`An error occurred`");
  }); // Run the AiBud function
});

/**
 * @description Main function that gets called whenever a message is sent in any channel of the server the bot has access to
 *
 * @param {Message<boolean>} message Discord message object that contains the message sent by the user
 *
 * @returns {Promise<void>}
 */
async function AiBud(message) {
  if (message.content.startsWith("!ai.")) {
    // Reset prompt history case
    if (message.content.startsWith("!ai.reset")) {
      await message.reply(steps.resetPromptStep(message.guildId));
    }
    // Set entered prompt case
    else if (message.content.startsWith("!ai.set ")) {
      await message.reply(
        steps.setEnteredPromptStep(message.content, message.guildId)
      );
    }
    // Set model engine
    else if (message.content.startsWith("!ai.setmodel")) {
      await message.reply(
        steps.setEnteredModelStep(message.content, message.guildId)
      );
    } else if (message.content.startsWith("!ai.setengine")) {
      steps.setEnteredEngineStep(message.content, message.guildId);
    }
    // Help Case
    else if (message.content.startsWith("!ai.help")) {
      // Generic help message
      if ("!ai.help" === message.content.trim()) {
        await message.reply(
          "`!ai.reset` - Resets the prompt history and returns it to default\n" +
            "`!ai.set [prompt name]` - Sets the prompt to the entered prompt.\n" +
            "`!ai [prompt]` - Generates a prompt using the entered prompt\n" +
            "`!ai.setmodel [model name]` - Sets the model to be used for processing the prompt\n" +
            "`!ai.setengine [engine name]` - Sets the engine to be used for processing the prompt\n" +
            "`!ai.help` - Shows this help message\n" +
            "`!ai.help set` - Shows all the prompt names you can choose from\n"
        );
      }
      // Help message for the set command
      else if ("!ai.help set" === message.content.trim()) {
        await message.reply(
          `\`Prompts you can choose from:\n${Object.keys(promptsPreset)
            .toString()
            .replaceAll(",", ", ")}\``
        );
      }
      // The help command is invalid
      else {
        await message.reply(
          `\`Invalid help command ${message.content
            .replace("!ai.help", "")
            .trim()} entered \``
        );
      }
    } else {
      await message.reply(
        `\`Invalid command ${message.content.trim()} entered\nType !ai.help for help\``
      );
    }
  }
  // Prompt command case
  else if (message.content.startsWith("!ai ")) {
    // Show the bot as typing in the channel while the prompt is being generated
    await message.channel.sendTyping();

    // Send the generated prompt as a reply message
    await message.reply(
      await steps.generatePromptStep(
        message.content,
        message.guildId,
        message.member.nickname,
        message.author.username
      )
    );
  }
  // Invalid command case
  else if (message.content.startsWith("!ai")) {
    await message.reply(
      `\`Invalid command ${message.content.trim()} entered\nType !ai.help for help\``
    );
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);
