import { MessageEmbed } from "discord.js";

export function createHelpEmbed() {
  return new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Help")
    .setDescription("Bot Usage and Commands Help")
    .addFields([
      { name: "\u200B", value: "\u200B" },
      {
        name: "Usage",
        value:
          "To chat, just send a message mentioning me. Try it! -> **`@AiBud Whats up?`**",
      },
      { name: "\u200B", value: "\u200B" },
      {
        name: "**Commands**",
        value:
          "All commands can be used through the slash command interface by typing `/ai` in a channel. Detailed commands description:\n",
      },
      {
        name: "/ai help",
        value: "Show this help message",
        inline: true,
      },
      {
        name: "/ai set-model",
        value:
          "Set the completion model to use for the bot\n" +
          "Available models:\n" +
          "`GPT3-Davinci`: Highest cost, most capable GPT3 model\n" +
          "`GPT3-Curie`: Low cost, capable GPT3 model\n" +
          "`GPT3-Babbage`: Lowest cost, limited GPT3 model",
        inline: true,
      },
      { name: "\u200B", value: "\u200B" },
    ])
    .setFooter({
      text: "Last Updated on March 19th, 2022",
    });
}
