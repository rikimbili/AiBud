import { SlashCommandBuilder } from "@discordjs/builders";

const ai = new SlashCommandBuilder()
  .setName("ai")
  .setDescription("Interact with AiBud")
  .addSubcommand((subcommand) =>
    subcommand.setName("reset").setDescription("Reset the chat prompt history")
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
          .addChoice("GPT3-Davinci", "davinci")
          .addChoice("GPT3-Curie", "curie")
          .addChoice("GPT3-Babbage", "babbage")
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("set-personality")
      .setDescription("Set the personality of AiBud")
      .addStringOption((option) =>
        option
          .setName("personality")
          .setDescription("The name of the engine to use")
          .setRequired(true)
          .addChoice("Normal", "normal")
          .addChoice("Street", "street")
          .addChoice("Sarcastic", "sarcastic")
          .addChoice("Programmer", "programmer")
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("help")
      .setDescription("Display commands and their usage")
  );

export default ai;
