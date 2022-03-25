import { MessageEmbed } from "discord.js";

const SUCCESS_COLOR = "#00cc00";
const INFO_COLOR = "#0077cc";
const WARN_COLOR = "#cc7700";
const ERROR_COLOR = "#cc0000";

export function createHelpEmbed(): MessageEmbed {
  return new MessageEmbed()
    .setColor(INFO_COLOR)
    .addFields([
      {
        name: "Usage",
        value:
          "Mention me if you want to chat. Try it -> **`@AiBud Whats up?`**",
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
      text: "Last Updated on March 24th, 2022",
    });
}

export function createMessageEmbed(
  message: string,
  type: string
): MessageEmbed {
  const templateEmbed: MessageEmbed = new MessageEmbed().setDescription(
    message
  );

  if (type === "success") {
    return templateEmbed
      .setColor(SUCCESS_COLOR)
      .setTitle("Operation Successful");
  } else if (type === "warning") {
    return templateEmbed.setColor(WARN_COLOR).setTitle("Warning");
  } else if (type === "error") {
    return templateEmbed.setColor(ERROR_COLOR).setTitle("Error");
  } else {
    return templateEmbed.setColor(INFO_COLOR).setTitle("Message");
  }
}
