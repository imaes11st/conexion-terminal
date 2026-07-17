import { client } from "../core/openai.js";
import { config } from "../config/config.js";
import { SYSTEM_PROMPT } from "../prompts/system.prompt.js";
import type { ChatMessage } from "../types/chat.types.js";

export class ChatService {
    private history: ChatMessage[] = [];
    private previousResponseId?: string;

    constructor() {
        this.history.push({
            role: "system",
            content: SYSTEM_PROMPT,
        });
    }

    public async send(message: string): Promise<string> {
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

    public async stream(message: string): Promise<void> {
        throw new Error("Método stream() aún no implementado.");
    }

    public clear(): void {
        this.history = [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
        ];

        this.previousResponseId = undefined;
    }

    public getHistory(): ChatMessage[] {
        return [...this.history];
    }

    public setSystemPrompt(prompt: string): void {
        this.history[0] = {
            role: "system",
            content: prompt,
        };
    }

    public async start(): Promise<void> {
        throw new Error("Método start() aún no implementado.");
    }
}