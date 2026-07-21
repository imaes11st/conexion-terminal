import { client } from "../core/openai.js";
import { config } from "../config/config.js";
import { SYSTEM_PROMPT } from "../prompts/system.prompt.js";
import type { ChatMessage } from "../types/chat.types.js";
import { MockChatService } from "../mocks/mock-chat.js";

export class ChatService {
    private history: ChatMessage[] = [];
    private previousResponseId?: string;
    private readonly mock = new MockChatService();
    constructor() {
        this.history.push({
            role: "system",
            content: SYSTEM_PROMPT,
        });
    }

    public async send(message: string): Promise<string> {

        if (config.app.mode === "mock") {

            this.history.push({
                role: "user",
                content: message,
            });

            const response = await this.mock.send(message);

            this.history.push({
                role: "assistant",
                content: response,
            });

            return response;

        }

        this.history.push({
            role: "user",
            content: message,
        });

        const response = await client.responses.create({
            model: config.openai.model,
            input: this.history,
            previous_response_id: this.previousResponseId,
        });

        this.previousResponseId = response.id;

        this.history.push({
            role: "assistant",
            content: response.output_text,
        });

        return response.output_text;
    }

}