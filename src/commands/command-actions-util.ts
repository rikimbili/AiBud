/*
  Utilities for command actions
*/

import { serverArr } from "./command-actions.js";

import promptsPreset from "../prompts.json" assert { type: "json" };

/**
 * @description Get the specified prompt
 */
export function getPrompt(serverIdx: number): string | void {
  for (const [promptKey, promptValue] of Object.entries(
    serverArr[serverIdx].prompt
  )) {
    if (promptKey === serverArr[serverIdx].selectedPrompt) {
      return promptValue;
    }
  }
}

/**
 * @description Change the default name throughout the prompts to the user's name
 */
export function changeNameOccurrences(serverIdx: number, name: string) {
  if (serverArr[serverIdx].defaultNameNeedsChange) {
    for (const [promptKey, promptValue] of Object.entries(
      serverArr[serverIdx].prompt
    )) {
      serverArr[serverIdx].prompt[promptKey] = promptValue.replaceAll(
        "You:",
        `${name}:`
      );
    }
    serverArr[serverIdx].defaultNameNeedsChange = false;
  }
}

/**
 * @description Concatenate the specified prompt
 */
export function concatPrompt(serverIdx: number, newPrompt: string): void {
  for (const [promptKey, promptValue] of Object.entries(
    serverArr[serverIdx].prompt
  )) {
    if (promptKey === serverArr[serverIdx].selectedPrompt) {
      serverArr[serverIdx].prompt[promptKey] = promptValue + newPrompt;
    }
  }
}

/**
 * @description Get the server object index if it exists or create a server object for the discord server
 * @returns 0 if the server object did not already exist and is created or the server object index if it was already in the array
 */
export function getPromptObjectIndex(serverId: string): number {
  // Get index if server object already exists for the server
  const serverIdx = serverArr.findIndex(
    (prompt) => prompt.serverId === serverId
  );

  // If Server object already exists for the server, return the index
  if (serverIdx !== -1) {
    return serverIdx;
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

/*
  @description Limit prompt to a certain amount of characters by removing the oldest conversation lines
*/
export function reducePrompt(prompt: string, charLimit: number = 1000): string {
  if (prompt.length < charLimit) return prompt;

  let promptArr: string[] = prompt.split("\n");
  let length: number = prompt.length;

  // Remove the oldest conversation line while the prompt is over the character limit
  while (length > charLimit) {
    // Note: Index 1 is the first conversation line of the prompt, Index 0 is the prompt description and should not be removed
    promptArr.splice(1, 1);
    length -= promptArr[1].length; // This doesn't factor in the new line character but it should be fine
  }

  // Return reducedPrompt
  return promptArr.join("\n");
}
