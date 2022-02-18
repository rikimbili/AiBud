import OpenAI from "openai-api";
import fetch from "node-fetch";

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Initialize OpenAI with your API key

export async function GPTJ() {
    return;
}

export async function GPTNeoX() {
    return;
}

export async function GPT3(prompt, maxTokens=64,
                        temperature=0.7, presenceP=1.0, frequencyP=1.5, engine = "davinci") {
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
