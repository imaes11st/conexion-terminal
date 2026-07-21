export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface AIResponse {
    text: string;
    responseId?: string;
    toolCalls?: any[];
}
