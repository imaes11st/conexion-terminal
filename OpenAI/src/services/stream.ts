import { client } from "../openai.js";
import { config } from "../config.js";

export async function streamMessage(message: string): Promise<void> {

    const stream = await client.responses.stream({
        model: config.openai.model,
        input: message,
    });

    for await (const event of stream) {

        if (event.type === "response.output_text.delta") {
            process.stdout.write(event.delta);
        }

    }

    process.stdout.write("\n");

}