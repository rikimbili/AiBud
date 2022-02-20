/*
  Contains all command declarations
*/
import { SlashCommandBuilder } from "@discordjs/builders";

const ai = new SlashCommandBuilder()
  .setName("ai")
  .setDescription("Interact with AiBud")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("help")
      .setDescription("Display commands and usage")
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("Message to send to AiBud")
          .setRequired(true)
      )
  );

export default ai;
