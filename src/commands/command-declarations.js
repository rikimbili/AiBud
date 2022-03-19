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
      .setName("set-model")
      .setDescription("Model to use for text generation")
      .addStringOption((option) =>
        option
          .setName("model")
          .setDescription("The name of the engine to use")
          .setRequired(true)
          .addChoice("GPT3-Davinci", "gpt3-davinci")
          .addChoice("GPT3-Curie", "gpt3-curie")
          .addChoice("GPT3-Babbage", "gpt3-babbage")
      )
  );

export default ai;
