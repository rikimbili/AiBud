import { GPT3 } from "./aimodels.js"; // Import models
import promptsPreset from "../prompts.json" assert { type: "json" }; // Import prompts

// prompts array singleton holding the prompt objects for all the servers AiBud is in
// This array will hold different prompt objects for each server AiBud is in
export const prompts = [];

/**
 * @description Gets the specified prompt
 *
 * @param {number} promptIdx Prompt index for the discord server the message was sent in
 *
 * @returns {string} Prompt
 */
function getPrompt(promptIdx) {
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
function changeNameOccurrences(promptIdx, name) {
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
function concatPrompt(promptIdx, newPrompt) {
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
function getPromptObjectIndex(serverID) {
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
      selectedModel: "GPT3", // AI model to use
      selectedEngine: "curie", // Model specific engine to use
      defaultNameNeedsChange: true, // If the default name in the prompts needs to be changed
    });
    return 0;
  }
}

/**
 * @description Resets the prompt to the default preset for the server and makes a new object in the prompts array
 * if the server is not found
 *
 * @param {string} serverID server ID of the server the message was sent in
 *
 * @returns {string} Return a message for the bot to send
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
  return "🪄`Prompt Reset`🪄";
}

/**
 * @description Completes the selected prompt using the specified AI model and engine
 *
 * @param {string} message Message sent by the user
 * @param {string} serverID Server ID of the server the message was sent in
 * @param {string} userNickname Server nickname of the user
 * @param {string} username Username of the user
 *
 * @returns {Promise<string>} Return a prompt for the bot to send
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
    return "Empty prompt entered\nType a valid prompt";
  }
  userPrompt = `${userNickname || username}: ${userPrompt}`;

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
        return "Empty response received from model :(";
      } else {
        concatPrompt(promptIdx, `${gptResponse.data.choices[0].text}\n`);
        console.log(userPrompt + `AiBud: ${response}`);
        return `${response}`;
      }
    })
    .catch((err) => {
      console.log(err);
      return "Error occurred while generating prompt\n";
    });
}

/**
 * @description Sets the prompt to the entered prompt
 *
 * @param {string} message Message sent by the user
 * @param {string} serverID Server ID of the server the message was sent in
 *
 * @returns {string} Return a message for the bot to send
 */
export function setEnteredPromptStep(message, serverID) {
  const enteredPrompt = message.replace("!ai.set", "").trim();

  if (enteredPrompt.length === 0)
    return "Empty or Invalid prompt name entered\nType a valid prompt name";

  // Get the prompt object index for the current discord server
  const promptIdx = getPromptObjectIndex(serverID);

  // Check if the entered prompt exists and set it to the selected prompt if it does
  for (const [promptKey] of Object.entries(prompts[promptIdx].prompt)) {
    if (promptKey === enteredPrompt) {
      if (prompts[promptIdx].selectedPrompt === enteredPrompt)
        return `\`Behavior prompt already set to ${enteredPrompt}\``;
      else {
        prompts[promptIdx].selectedPrompt = enteredPrompt;
        return `\`Behavior prompt set to ${enteredPrompt}\``;
      }
    }
  }
  return `\`Behavior prompt ${enteredPrompt} not found\``;
}

/**
 * @description Sets the model to be used for the prompt
 *
 * @param {string} message Message object from Discord
 * @param {string} serverID Server ID of the server the message was sent in
 *
 * @returns {string} Return a message for the bot to send
 */
export function setEnteredModelStep(message, serverID) {
  const enteredModel = message.replace("!ai.setmodel", "").trim();

  if (enteredModel.length === 0)
    return "`Empty or Invalid model name entered\nType a valid model engine name`";

  // Get the prompt object index for the current discord server
  const promptIdx = getPromptObjectIndex(serverID);

  if (prompts[promptIdx].selectedModel === enteredModel)
    return `\`Model already set to ${enteredModel}\``;
  else {
    prompts[promptIdx].selectedModel = enteredModel;
    resetPromptStep(serverID);
    return `\`Model set to ${enteredModel}\``;
  }
}

/**
 * @description Sets the model to be used for the prompt
 *
 * @param {string} message Message object from Discord
 * @param {string} serverID Server ID of the server the message was sent in
 *
 * @returns {string} Return a message for the bot to send
 */
export function setEnteredEngineStep(message, serverID) {
  const enteredEngine = message.replace("!ai.setengine", "").trim();

  if (enteredEngine.length === 0)
    return "`Empty or Invalid engine name entered\nType a valid engine name`";

  // Get the prompt object index for the current discord server
  const promptIdx = getPromptObjectIndex(serverID);

  if (prompts[promptIdx].selectedEngine === enteredEngine)
    return `\`Engine already set to ${enteredEngine}\``;
  else {
    prompts[promptIdx].selectedEngine = enteredEngine;
    return `\`Engine set to ${enteredEngine}\``;
  }
}
