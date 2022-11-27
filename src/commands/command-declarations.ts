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
          .addChoices({name: "GPT3-Davinci", value: "davinci"}, {name: "GPT3-Curie", value: "curie"}, {name: "GPT3-Babbage", value: "babbage"}),
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
          .addChoices({name: "Normal", value: "normal"}, {name: "Street", value: "street"}, {name: "Sarcastic", value: "sarcastic"}, {name: "Programmer", value: "programmer"}),
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("help")
      .setDescription("Display commands and their usage")
  );

export default ai;
