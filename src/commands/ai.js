import { SlashCommandBuilder } from "@discordjs/builders";

const ai = {
  data: new SlashCommandBuilder()
    .setName("ai")
    .setDescription("Replies to the user based on their message"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};

export default ai;
