import OpenAI, { Completion } from "openai-api";

const openai = new OpenAI(process.env.OPENAI_API_KEY!); // Initialize OpenAI

export async function GPTJ() {
  return;
}

export async function GPTNeoX() {
  return;
}

/**
 * @description Generate a response using the OpenAI API. More info about the parameters here: https://beta.openai.com/docs/api-reference/completions/create
 * @param prompt The prompt to be completed by the model
 * @param maxTokens The maximum number of tokens to generate
 * @param temperature Values closer to 1 mean that the model will be more creative with the generated text
 * @param presenceP Number between -2.0 and 2.0. Higher values increase the model's likelihood to talk about new topics.
 * @param frequencyP Number between -2.0 and 2.0. Higher values decrease the model's likelihood to repeat the same line verbatim.
 * @param engine The engine to use
 */
export async function GPT3(
  prompt: string,
  maxTokens: number = 64,
  temperature: number = 0.7,
  presenceP: number = 1.5,
  frequencyP: number = 2.0,
  engine: string = "davinci"
): Promise<Completion> {
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
