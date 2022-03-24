import { prompts } from "./command-actions.js";

import promptsPreset from "../../prompts.json" assert { type: "json" };

/**
 * @description Gets the specified prompt
 *
 * @param {number} promptIdx Prompt index for the discord server the message was sent in
 *
 * @returns {string} Prompt
 */
export function getPrompt(promptIdx) {
  for (const [promptKey, promptValue] of Object.entries(
    prompts[promptIdx].prompt
  )) {
    if (promptKey === prompts[promptIdx].selectedPrompt) {
      return promptValue;
    }
  }
}

/**
 * @description Changes the default name throughout the prompts to the user's name
 *
 * @param {number} promptIdx Prompt index for the discord server the message was sent in
 * @param {string} name Name of the user to change the prompt to
 */
export function changeNameOccurrences(promptIdx, name) {
  if (prompts[promptIdx].defaultNameNeedsChange) {
    for (const [promptKey, promptValue] of Object.entries(
      prompts[promptIdx].prompt
    )) {
      prompts[promptIdx].prompt[promptKey] = promptValue.replaceAll(
        "You:",
        `${name}:`
      );
    }
    prompts[promptIdx].defaultNameNeedsChange = false;
  }
}

/**
 * @description Concatenates the specified prompt
 *
 * @param {number} promptIdx Prompt index for the discord server the message was sent in
 * @param {string} newPrompt New prompt to concatenate
 */
export function concatPrompt(promptIdx, newPrompt) {
  for (const [promptKey, promptValue] of Object.entries(
    prompts[promptIdx].prompt
  )) {
    if (promptKey === prompts[promptIdx].selectedPrompt) {
      prompts[promptIdx].prompt[promptKey] = promptValue + newPrompt;
    }
  }
}

/**
 * @description Get the prompt object index if it exists or create a prompt object for the discord server
 *
 * @param {string} serverID ID of the server the message was sent in
 *
 * @returns {number} Return 0 if the prompt object is created or the prompt object index if it was already in the array
 */
export function getPromptObjectIndex(serverID) {
  // Get index if prompt object already exists for the server
  const promptIdx = prompts.findIndex((prompt) => prompt.serverId === serverID);

  // If Prompt object already exists for the server, return the index
  if (promptIdx !== -1) {
    return promptIdx;
  }
  // Create a new prompt object for the server
  else {
    prompts.push({
      serverId: serverID, // Server ID of the server the message was sent in
      prompt: JSON.parse(JSON.stringify(promptsPreset)), // Create a new object from the prompts preset
      selectedPrompt: "normal", // Prompt to use
      selectedModel: "davinci", // AI model to use
      defaultNameNeedsChange: true, // If the default name in the prompts needs to be changed
    });
    return 0;
  }
}
