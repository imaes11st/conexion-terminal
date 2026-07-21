import type { ChatMessage, AIResponse } from "../types/chat.types.js";

export interface AIProvider {
    send(messages: ChatMessage[], options?: { previousResponseId?: string }): Promise<AIResponse>;
    stream(messages: ChatMessage[], options?: { previousResponseId?: string }): Promise<AsyncGenerator<string, void, unknown>>;
}
