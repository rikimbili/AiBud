import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import ai from "./commands/command-declarations.js"; // Import commands

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_BOT_TOKEN);

await rest
  .put(Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID), {
    body: [ai], // Takes the command JSON object as an array
  })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
