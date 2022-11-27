/*
  TODO
  - Add Search, Image Classification/Creation and question/answer functionality
  - Dockerize it?
  - Implement reply, whenever a user replies to a message sent by aibud (even after the bot being restarted) it should
  have the context of that message and reply accordingly
*/
import "dotenv/config";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import {
  generatePromptStep,
  resetPromptStep,
  setEnteredModelStep,
  setEnteredPromptStep,
} from "./commands/command-actions.js";
import "./commands/deploy-commands.js"; // Initializes the commands
import { createHelpEmbed } from "./commands/command-embeds.js"; // Import the embeds

const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}); // Initialize the discord bot client with the right permissions
await client.login(process.env.DISCORD_BOT_TOKEN); // Log in to the bot
// @ts-ignore
client.commands = new Collection(); // Initialize the commands collection

// Do only once upon startup
client.once("ready", () => {
  console.log("AiBud is Ready to Chat!");
});

// Run this on every message received from a server channel
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Dont do anything if the message is from a bot
  // Check if the message sent is mentioning the bot
  if (message.mentions.has(client.user!)) {
    // Show the bot as typing in the channel while the prompt is being generated
    message.channel.sendTyping();

    // Generate a reply prompt
    const reply = await generatePromptStep(
      message.cleanContent,
      message.guildId!,
      message.member?.nickname || message.author.username
    );

    // Send the generated prompt as a reply message. An embed with description will be sent in case of a warning or error
    if (typeof reply === "string") {
      await message.reply(reply);
    } else {
      await message.reply({ embeds: [reply] });
    }
  }
});

// Run this on every command received
client.on("interactionCreate", async (interaction) => {
  // Dont do anything if the interaction is not a bot command or if it doesnt come from a server
  if (!interaction.isCommand() || !interaction.inGuild()) return;

  const { commandName, options } = interaction;

  if (commandName === "ai") {
    // Check subcommand and execute the appropriate action
    // @ts-ignore
    switch (options.getSubcommand()) {
      case "help":
        await interaction.reply({ embeds: [createHelpEmbed()] });
        break;
      case "reset":
        await interaction.reply({
          embeds: [resetPromptStep(interaction.guildId)],
        });
        break;
      case "set-personality":
        await interaction.reply({
          embeds: [
            setEnteredPromptStep(
              options.get("personality")?.value as string,
              interaction.guildId
            ),
          ],
        });
        break;
      case "set-model":
        await interaction.reply({
          embeds: [
            setEnteredModelStep(
              options.get("model")?.value as string,
              interaction.guildId
            ),
          ],
        });
        break;
      default:
        await interaction.reply(
          "Invalid subcommand. Use `/ai help` to see the available commands."
        );
    }
  }
});
