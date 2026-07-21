import type { Conversation } from "../entities/conversation.js";

export interface ConversationRepository {
    getById(id: string): Promise<Conversation | null>;
    save(conversation: Conversation): Promise<void>;
    clear(id: string): Promise<void>;
}
