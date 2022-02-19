import { REST } from "@discordjs/rest";
import { ai } from "./commands/index.js"; // Import commands

const commands = [ai];

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
