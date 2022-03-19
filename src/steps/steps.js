/*
  Steps used in the main aibud.js file for text completion and command execution.
*/

import { GPT3 } from "./aimodels.js"; // Import models
import {
  changeNameOccurrences,
  concatPrompt,
  createMessageObject,
  getPrompt,
  getPromptObjectIndex,
} from "./utils.js"; // Import utilities

import promptsPreset from "../../prompts.json" assert { type: "json" }; // Import prompts

/**
 * @description prompts array singleton holding the prompt objects for all the servers AiBud is in
 * @type {Array<Object>}
 */
export const prompts = [];

/**
 * @description Resets the prompt to the default preset for the server and makes a new object in the prompts array
 * if the server is not found
 *
 * @param {string} serverID server ID of the server the message was sent in
 *
 * @returns {Object} Message object for the bot to send
 */
export function resetPromptStep(serverID) {
  // Replace the existing prompt with the preset prompt for the current discord server
  prompts[getPromptObjectIndex(serverID)].prompt = JSON.parse(
    JSON.stringify(promptsPreset)
  );

  console.log(
    `\nReset prompt "${
      prompts[getPromptObjectIndex(serverID)].selectedPrompt
    }" for ${serverID}\n`
  );
  return createMessageObject("🪄`Prompt Reset`🪄", "success");
}

/**
 * @description Completes the selected prompt using the specified AI model and engine
 *
 * @param {string} message Message sent by the user
 * @param {string} serverID Server ID of the server the message was sent in
 * @param {string} userNickname Server nickname of the user
 * @param {string} username Username of the user
 *
 * @returns {Promise<Object>} Message object for the bot to send
 */
export async function generatePromptStep(
  message,
  serverID,
  userNickname,
  username
) {
  // Get the prompt object index for the current discord server
  const promptIdx = getPromptObjectIndex(serverID);
  // Change the default prompt name occurrences to either the server nickname or username
  if (prompts[promptIdx].defaultNameNeedsChange) {
    changeNameOccurrences(promptIdx, userNickname || username);
  }
  // Remove !ai and any extra spaces from the message
  let userPrompt = message.replace("!ai", "").replace(/\s+/g, " ").trim(); // Remove extra spaces and trim the message
  // Case where the prompt is empty
  if (userPrompt.length === 0) {
    return createMessageObject(
      "Empty prompt entered\nType a valid prompt",
      "warning"
    );
  }
  userPrompt = `${userNickname || username}: ${userPrompt}\n`;

  // Add the user's message to the selected prompt
  concatPrompt(promptIdx, userPrompt + "AiBud: ");

  // Send the prompt to OpenAI and wait for the magic to happen 🪄
  return await GPT3(
    getPrompt(promptIdx),
    64,
    0.7,
    1.0,
    1.5,
    prompts[promptIdx].selectedEngine
  )
    .then((gptResponse) => {
      const response = gptResponse.data.choices[0]?.text.trim();
      // Check if response is empty and
      if (response.length === 0) {
        console.log("Empty response received from OpenAI complete engine");
        return createMessageObject(
          "Empty response received from OpenAI complete engine",
          "warning"
        );
      } else {
        concatPrompt(promptIdx, `${gptResponse.data.choices[0].text}\n`);
        console.log(userPrompt + `AiBud: ${response}`);
        return createMessageObject(`${response}`, "success");
      }
    })
    .catch((err) => {
      console.log(err);
      return createMessageObject(
        "Error occurred while generating the prompt\n",
        "error"
      );
    });
}

/**
 * @description Sets the prompt to the entered prompt
 *
 * @param {string} enteredPrompt Prompt to change the selected prompt to
 * @param {string} serverID Server ID of the server the message was sent in
 *
 * @returns {Object} Message object for the bot to send
 */
export function setEnteredPromptStep(enteredPrompt, serverID) {
  if (enteredPrompt.length === 0)
    return createMessageObject(
      "Empty or Invalid prompt name entered\nType a valid prompt name",
      "warning"
    );

  // Get the prompt object index for the current discord server
  const promptIdx = getPromptObjectIndex(serverID);

  // Check if the entered prompt exists and set it to the selected prompt if it does
  for (const [promptKey] of Object.entries(prompts[promptIdx].prompt)) {
    if (promptKey === enteredPrompt) {
      if (prompts[promptIdx].selectedPrompt === enteredPrompt)
        return createMessageObject(
          `Behavior prompt already set to ${enteredPrompt}`,
          "info"
        );
      else {
        prompts[promptIdx].selectedPrompt = enteredPrompt;
        return createMessageObject(
          `Behavior prompt set to ${enteredPrompt}`,
          "success"
        );
      }
    }
  }
  return createMessageObject(
    `Behavior prompt ${enteredPrompt} not found`,
    "warning"
  );
}

/**
 * @description Sets the model to be used for the prompt
 *
 * @param {string} enteredModel Model to change the selected model to
 * @param {string} serverID Server ID of the server the message was sent in
 *
 * @returns {Object} Message object for the bot to send
 */
export function setEnteredModelStep(enteredModel, serverID) {
  if (enteredModel.length === 0)
    return createMessageObject(
      "Empty or Invalid model name entered\nType a valid model engine name",
      "warning"
    );

  // Get the prompt object index for the current discord server
  const promptIdx = getPromptObjectIndex(serverID);

  if (prompts[promptIdx].selectedModel === enteredModel)
    return createMessageObject(`Model already set to ${enteredModel}`, "info");
  else {
    prompts[promptIdx].selectedModel = enteredModel;
    resetPromptStep(serverID);
    return createMessageObject(`Model set to ${enteredModel}`, "success");
  }
}

/**
 * @description Sets the model to be used for the prompt
 *
 * @param {string} enteredEngine Engine to change the selected engine to
 * @param {string} serverID Server ID of the server the message was sent in
 *
 * @returns {Object} Message object for the bot to send
 */
export function setEnteredEngineStep(enteredEngine, serverID) {
  if (enteredEngine.length === 0)
    return createMessageObject(
      "Empty or Invalid engine name entered\nType a valid engine name",
      "warning"
    );

  // Get the prompt object index for the current discord server
  const promptIdx = getPromptObjectIndex(serverID);

  if (prompts[promptIdx].selectedEngine === enteredEngine)
    return createMessageObject(
      `Engine already set to ${enteredEngine}`,
      "info"
    );
  else {
    prompts[promptIdx].selectedEngine = enteredEngine;
    return createMessageObject(`Engine set to ${enteredEngine}`, "success");
  }
}
