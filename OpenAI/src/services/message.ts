import { client } from "../openai.js";
import { config } from "../config.js";

export async function sendMessage(message: string): Promise<string> {

    const response = await client.responses.create({
        model: config.openai.model,
        input: message,
    });

    return response.output_text;
}