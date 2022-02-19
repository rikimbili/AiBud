import OpenAI from "openai-api";
import fetch from "node-fetch";

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Initialize OpenAI with your API key

export async function GPTJ() {
  return;
}

export async function GPTNeoX() {
  return;
}

/**
 * @description Generate a response using the OpenAI API. More info about the parameters here:
 * https://beta.openai.com/docs/api-reference/completions/create
 *
 * @param prompt string The prompt to be completed by the model
 * @param maxTokens The maximum number of tokens to generate
 * @param temperature Values closer to 1 mean that the model will be more creative with the generated text
 * @param presenceP Number between -2.0 and 2.0. Higher values increase the model's likelihood to talk about new topics.
 * @param frequencyP Number between -2.0 and 2.0. Higher values decrease the model's likelihood to repeat the same line verbatim.
 * @param engine The engine to use
 *
 * @returns {Promise<Completion>} OpenAI response object with the completed prompt
 */
export async function GPT3(
  prompt,
  maxTokens = 64,
  temperature = 0.7,
  presenceP = 1.0,
  frequencyP = 1.5,
  engine = "curie"
) {
  return await openai.complete({
    engine: engine,
    prompt: prompt,
    maxTokens: maxTokens,
    temperature: temperature,
    presencePenalty: presenceP,
    frequencyPenalty: frequencyP,
    stop: ["\n", "\n\n"],
  });
}
