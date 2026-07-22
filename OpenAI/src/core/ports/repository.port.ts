import type { Conversation } from "../entities/conversation.js";

export interface ConversationRepository {
    getById(id: string): Promise<Conversation | null>;
    save(conversation: Conversation): Promise<void>;
    clear(id: string): Promise<void>;
    delete(id: string): Promise<void>;
    listIds(): Promise<string[]>;
}
