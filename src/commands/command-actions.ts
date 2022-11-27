/*
  Steps used in the main aibud.js file for text completion and command execution.
*/

import { EmbedBuilder  } from "discord.js";
import {
  changeNameOccurrences,
  concatPrompt,
  getPrompt,
  getPromptObjectIndex,
  reducePrompt,
} from "./command-actions-util.js"; // Import utilities
import { GPT3 } from "../models.js"; // Import models
import { createMessageEmbed } from "./command-embeds.js"; // Import embeds to create messages

import promptsPreset from "../prompts.json" assert { type: "json" }; // Import prompts

// Server Object interface that contains all the aibud settings along with the prompts for the server
interface ServerObj {
  serverId: string;
  // Prompt JSON object with all the prompts
  prompt: Record<string, string>;
  selectedPrompt: string;
  selectedModel: string;
  defaultNameNeedsChange: boolean;
}

// Array singleton holding ServerObj objects for each server aibud is in
export const serverArr: Array<ServerObj> = [];

/**
 * @description Resets the prompt to the default preset for the server and makes a new object in the prompts array
 * if the server is not found
 */
export function resetPromptStep(serverID: string) {
  // Replace the existing prompt with the preset prompt for the current discord server
  serverArr[getPromptObjectIndex(serverID)].prompt = JSON.parse(
    JSON.stringify(promptsPreset)
  );

  console.log(
    `\nReset prompt "${
      serverArr[getPromptObjectIndex(serverID)].selectedPrompt
    }" for ${serverID}\n`
  );
  return createMessageEmbed("Prompt reset", "success");
}

/**
 * @description Completes the selected prompt using the specified AI model and engine
 */
export async function generatePromptStep(
  message: string,
  serverID: string,
  username: string
): Promise<EmbedBuilder | string> {
  // Get the server object index for the current discord server
  const serverIdx = getPromptObjectIndex(serverID);
  const selectedPrompt = serverArr[serverIdx].selectedPrompt;

  // Change the default prompt name occurrences to either the server nickname or username
  if (serverArr[serverIdx].defaultNameNeedsChange) {
    changeNameOccurrences(serverIdx, username);
  }

  // Ensure the prompt remains below a certain character limit
  serverArr[serverIdx].prompt[selectedPrompt] = reducePrompt(
    serverArr[serverIdx].prompt[selectedPrompt]
  );

  // Remove mention and any extra spaces from the message
  let userPrompt = message.replace(/\s+/g, " ").trim(); // Remove extra spaces and trim the message
  // Case where the prompt is empty
  if (userPrompt.length === 0) {
    return createMessageEmbed(
      "You sent an empty message\nMake sure your message does not only contain whitespace",
      "warning"
    );
  }
  userPrompt = `${username}: ${userPrompt}\n`;

  // Add the user's message to the selected prompt
  concatPrompt(serverIdx, userPrompt + "AiBud: ");

  // Send the prompt to OpenAI and wait for the magic to happen 🪄
  return await GPT3(
    getPrompt(serverIdx)!,
    80,
    0.75,
    1.0,
    1.7,
    serverArr[serverIdx].selectedModel
  )
    .then((gptResponse) => {
      const response = gptResponse.data.choices[0]?.text.trim();
      // Check if response is empty and
      if (response.length === 0) {
        console.log("Empty response received from OpenAI complete engine");
        return createMessageEmbed(
          "Empty response received from OpenAI complete engine",
          "warning"
        );
      } else {
        concatPrompt(serverIdx, `${gptResponse.data.choices[0].text}\n`);
        console.log("Response generated from OpenAI complete engine");
        return response;
      }
    })
    .catch((err) => {
      console.error(err);
      return createMessageEmbed(
        "Error occurred while generating the prompt\n",
        "error"
      );
    });
}

/**
 * @description Sets the prompt in the server object to the entered prompt
 */
export function setEnteredPromptStep(
  enteredPrompt: string,
  serverId: string
) {
  if (enteredPrompt.length === 0)
    return createMessageEmbed(
      "Empty or Invalid prompt name entered\nType a valid prompt name",
      "warning"
    );

  // Get the server object index for the current discord server
  const serverIdx = getPromptObjectIndex(serverId);

  // Check if the entered prompt exists and set it to the selected prompt if it does
  for (const [promptKey] of Object.entries(serverArr[serverIdx].prompt)) {
    if (promptKey === enteredPrompt) {
      if (serverArr[serverIdx].selectedPrompt === enteredPrompt)
        return createMessageEmbed(
          `Behavior prompt already set to ${enteredPrompt}`,
          "info"
        );
      else {
        serverArr[serverIdx].selectedPrompt = enteredPrompt;
        return createMessageEmbed(
          `Behavior prompt set to ${enteredPrompt}`,
          "success"
        );
      }
    }
  }
  return createMessageEmbed(
    `Behavior prompt ${enteredPrompt} not found`,
    "warning"
  );
}

/**
 * @description Sets the model to be used for the prompt
 */
export function setEnteredModelStep(
  enteredModel: string,
  serverID: string
) {
  if (enteredModel.length === 0)
    return createMessageEmbed(
      "Empty or Invalid model name entered\nType a valid model engine name",
      "warning"
    );

  // Get the server object index for the current discord server
  const serverIdx = getPromptObjectIndex(serverID);

  if (serverArr[serverIdx].selectedModel === enteredModel)
    return createMessageEmbed(`Model already set to ${enteredModel}`, "info");
  else {
    serverArr[serverIdx].selectedModel = enteredModel;
    resetPromptStep(serverID);
    return createMessageEmbed(`Model set to ${enteredModel}`, "success");
  }
}
