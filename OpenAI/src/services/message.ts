import { client } from "../openai.js";

export async function sendMessage(message: string): Promise<string> {
    const response = await client.responses.create({
        model: "gpt-5-nano",
        input: message,
    });

    return response.output_text;
}