/*
  Utilities for command actions
*/

import { serverArr } from "./command-actions.js";

import promptsPreset from "../prompts.json" assert { type: "json" };

/**
 * @description Gets the specified prompt
 */
export function getPrompt(promptIdx: number): string | void {
  for (const [promptKey, promptValue] of Object.entries(
    serverArr[promptIdx].prompt
  )) {
    if (promptKey === serverArr[promptIdx].selectedPrompt) {
      return promptValue;
    }
  }
}

/**
 * @description Changes the default name throughout the prompts to the user's name
 */
export function changeNameOccurrences(promptIdx: number, name: string) {
  if (serverArr[promptIdx].defaultNameNeedsChange) {
    for (const [promptKey, promptValue] of Object.entries(
      serverArr[promptIdx].prompt
    )) {
      serverArr[promptIdx].prompt[promptKey] = promptValue.replaceAll(
        "You:",
        `${name}:`
      );
    }
    serverArr[promptIdx].defaultNameNeedsChange = false;
  }
}

/**
 * @description Concatenates the specified prompt
 * @param {number} promptIdx Prompt index for the discord server the message was sent in
 * @param {string} newPrompt New prompt to concatenate
 */
export function concatPrompt(promptIdx: number, newPrompt: string): void {
  for (const [promptKey, promptValue] of Object.entries(
    serverArr[promptIdx].prompt
  )) {
    if (promptKey === serverArr[promptIdx].selectedPrompt) {
      serverArr[promptIdx].prompt[promptKey] = promptValue + newPrompt;
    }
  }
}

/**
 * @description Get the server object index if it exists or create a server object for the discord server
 * @returns 0 if the server object did not already exist and is created or the server object index if it was already in the array
 */
export function getPromptObjectIndex(serverId: string): number {
  // Get index if server object already exists for the server
  const promptIdx = serverArr.findIndex(
    (prompt) => prompt.serverId === serverId
  );

  // If Server object already exists for the server, return the index
  if (promptIdx !== -1) {
    return promptIdx;
  }
  // Create a new server object for the server
  else {
    serverArr.push({
      serverId: serverId,
      prompt: JSON.parse(JSON.stringify(promptsPreset)),
      selectedPrompt: "normal",
      selectedModel: "davinci",
      defaultNameNeedsChange: true,
    });
    return 0;
  }
}
