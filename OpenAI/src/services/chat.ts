import { client } from "../openai.js";
import { config } from "../config.js";

export class ChatService {

    private previousResponseId?: string;

    async send(message: string): Promise<string> {

        const response = await client.responses.create({

            model: config.openai.model,

            input: message,

            previous_response_id: this.previousResponseId,

        });

        this.previousResponseId = response.id;

        return response.output_text;

    }

    reset() {

        this.previousResponseId = undefined;

    }

}