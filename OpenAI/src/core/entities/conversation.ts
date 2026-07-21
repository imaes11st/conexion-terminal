import type { ChatMessage } from "../types/chat.types.js";

export class Conversation {
    private readonly messages: ChatMessage[] = [];
    private previousResponseId?: string;

    constructor(
        private readonly id: string,
        systemPrompt?: string
    ) {
        if (systemPrompt) {
            this.messages.push({
                role: "system",
                content: systemPrompt,
            });
        }
    }

    public getId(): string {
        return this.id;
    }

    public addUserMessage(content: string): void {
        this.messages.push({
            role: "user",
            content,
        });
    }

    public addAssistantMessage(content: string): void {
        this.messages.push({
            role: "assistant",
            content,
        });
    }

    public getMessages(): ChatMessage[] {
        return [...this.messages];
    }

    public clear(): void {
        const system = this.messages.find(m => m.role === "system");
        this.messages.length = 0;
        if (system) {
            this.messages.push(system);
        }
        this.previousResponseId = undefined;
    }

    public getPreviousResponseId(): string | undefined {
        return this.previousResponseId;
    }

    public setPreviousResponseId(id: string | undefined): void {
        this.previousResponseId = id;
    }

    public setSystemPrompt(prompt: string): void {
        const index = this.messages.findIndex(m => m.role === "system");
        if (index !== -1) {
            this.messages[index] = {
                role: "system",
                content: prompt,
            };
        } else {
            this.messages.unshift({
                role: "system",
                content: prompt,
            });
        }
    }
}
