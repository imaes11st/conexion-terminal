import type { Conversation } from "../../core/entities/conversation.js";
import type { ConversationRepository } from "../../core/ports/repository.port.js";

export class MemoryConversationRepository implements ConversationRepository {
    private readonly store = new Map<string, Conversation>();

    public async getById(id: string): Promise<Conversation | null> {
        return this.store.get(id) || null;
    }

    public async save(conversation: Conversation): Promise<void> {
        this.store.set(conversation.getId(), conversation);
    }

    public async clear(id: string): Promise<void> {
        const conversation = this.store.get(id);
        if (conversation) {
            conversation.clear();
        }
    }
}
