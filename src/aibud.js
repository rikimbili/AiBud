/*
  TODO
  - Handle massive prompt sizes
  - Add Search, Image Classification/Creation and question/answer functionality
*/
import "dotenv/config";
import { Client, Intents, Collection } from "discord.js";
import {
  generatePromptStep,
  resetPromptStep,
  setEnteredModelStep,
} from "./commands/command-actions.js";
import "./commands/deploy-commands.js"; // Initializes the commands
import { createHelpEmbed } from "./commands/command-embeds.js"; // Import the embeds

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
}); // Initialize the discord bot client with the right permissions
await client.login(process.env.DISCORD_BOT_TOKEN);

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
    const reply = await generatePromptStep(
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
      case "reset":
        await interaction.reply({
          embeds: [resetPromptStep(interaction.guildId)],
        });
        break;
      case "set-model":
        await interaction.reply({
          embeds: [
            setEnteredModelStep(
              options.getString("model"),
              interaction.guildId
            ),
          ],
        });
        break;
      default:
        interaction.reply(
          "Invalid subcommand. Use `/ai help` to see the available commands."
        );
    }
  }
});
