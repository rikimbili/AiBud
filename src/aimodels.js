import OpenAI from "openai-api";
import fetch from "node-fetch";

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Initialize OpenAI with your API key

export async function GPTJ() {
    return await fetch("https://api.neuro-ai.co.uk/SyncPredict?include_result=true", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEURO_API_KEY}`,
        },
        body: JSON.stringify({
            modelId: "60ca2a1e54f6ecb69867c72c",
            data: "When I visit Bath I will",
            input_kwargs: {response_length: 50, remove_input: true},
            // response_length = how many response tokens to generate
            // remove_input = whether to return your input
            // all params from the transformers library `generate` function are supported
        }),
    });
}

export async function GPT3(prompt, maxTokens=64,
                        temperature=0.8, presenceP=1.0, frequencyP=1.5, engine = "curie") {
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
