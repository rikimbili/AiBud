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
      .setDescription("Display commands and their usage")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("model")
      .setDescription("Model to use for text generation")
      .addStringOption((option) =>
        option
          .setName("engine")
          .setDescription("The name of the engine to use")
          .setRequired(true)
          .addChoice("GPT3-Davinci", "GPT3-Davinci")
          .addChoice("GPT3-Curie", "curie")
          .addChoice("GPT3-Babbage", "babbage")
      )
  );

export default ai;
