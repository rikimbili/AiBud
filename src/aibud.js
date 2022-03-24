/*
  TODO
  - Handle massive prompt sizes
  - Add Search, Image Classification/Creation and question/answer functionality
*/
import "dotenv/config";
import { Client, Intents, Collection } from "discord.js";
import * as steps from "./steps/steps.js"; // Import all steps
import "./commands/deploy-commands.js"; // Initializes the commands
import { createHelpEmbed } from "./commands/command-embeds.js"; // Import the embeds

import promptsPreset from "../prompts.json" assert { type: "json" }; // Import prompts

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}); // Initialize the discord bot client with the right permissions

client.commands = new Collection();

// Do only once upon startup
client.once("ready", () => {
  console.log("AiBud is Ready to Chat!");
});

// Run this on every message received from a server channel
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Dont do anything if the message is from a bot

  // Check if the message sent is mentioning the bot
  if (message.content.trim().startsWith("<@!935964380779134986>")) {
    // Show the bot as typing in the channel while the prompt is being generated
    message.channel.sendTyping();

    // Generate a reply prompt
    const reply = await steps.generatePromptStep(
      message.content
        .replace("<@!935964380779134986>", "") // Remove the bot mention
        .replace(/\s+/g, " ") // Remove extra spaces
        .trim(),
      message.guildId,
      message.member.nickname,
      message.author.username
    );

    // Send the generated prompt as a reply message. An embed with description will be sent in case of a warning or error
    await message.reply(reply.type === "rich" ? { embeds: [reply] } : reply);
  }
});

// Run this on every command received
client.on("interactionCreate", async (interaction) => {
  // Dont do anything if the interaction is not a bot command or if it doesnt come from a server
  if (!interaction.isCommand() || !interaction.inGuild()) return;

  const { commandName, options } = interaction;

  if (commandName === "ai") {
    switch (options.getSubcommand()) {
      case "help":
        await interaction.reply({ embeds: [createHelpEmbed()] });
        break;
      case "set-model":
        await interaction.reply({
          embeds: [
            steps.setEnteredModelStep(
              options.getString("model"),
              interaction.guildId
            ),
          ],
        });
        break;
      default:
        interaction.reply(
          "Invalid subcommand. Use `ai help` to see the available commands."
        );
    }
  }

  // AiBud(interaction).catch((err) => {
  //   console.error(err);
  //   interaction.channel.send("`An error occurred`");
  // }); // Run the AiBud function
});

/**
 * @description Main function that gets called whenever an interaction command is triggered
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
  }
  // Invalid command case
  else if (message.content.startsWith("!ai")) {
    await message.reply(
      `\`Invalid command ${message.content.trim()} entered\nType !ai.help for help\``
    );
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);
