import { EmbedBuilder  } from "discord.js";

const SUCCESS_COLOR = "#00cc00";
const INFO_COLOR = "#0077cc";
const WARN_COLOR = "#cc7700";
const ERROR_COLOR = "#cc0000";

export function createHelpEmbed() {
  return new EmbedBuilder()
    .setColor(INFO_COLOR)
    .addFields([
      {
        name: "Usage",
        value:
          "To chat with AiBud, just send a message mentioning it in a server channel.\nTry it -> **`@AiBud Whats up?`**",
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
        name: "/ai reset",
        value:
          "Reset the conversation state. This will erase any memory it had of previous conversations.",
        inline: true,
      },
      {
        name: "/ai set-personality",
        value:
          "Set the personality of AiBud. It will respond to you based on this behavior/personality context.\n" +
          "Available personalities: `Normal`, `Street`, `Sarcastic`, `Programmer`",
        inline: true,
      },
      {
        name: "/ai set-model",
        value:
          "Set the completion model to use.\n" +
          "Available models:\n" +
          "`GPT3-Davinci`: Highest cost, most capable GPT3 model\n" +
          "`GPT3-Curie`: Low cost, capable GPT3 model\n" +
          "`GPT3-Babbage`: Lowest cost, limited GPT3 model",
        inline: true,
      },
      { name: "\u200B", value: "\u200B" },
    ])
    .setFooter({
      text: "Last Updated on March 26th, 2022",
    });
}

export function createMessageEmbed(
  message: string,
  type: string
) {
  const templateEmbed = new EmbedBuilder().setDescription(
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
