import { Conversation } from "../../core/entities/conversation.js";
import type { AIProvider } from "../../core/ports/provider.port.js";
import type { ConversationRepository } from "../../core/ports/repository.port.js";
import type { ChatMessage } from "../../core/types/chat.types.js";
import { SYSTEM_PROMPT } from "../../prompts/system.prompt.js";

export class ChatService {
    constructor(
        private readonly provider: AIProvider,
        private readonly repository: ConversationRepository,
        private readonly systemPrompt: string = SYSTEM_PROMPT
    ) {}

    public async sendMessage(conversationId: string, message: string): Promise<string> {
        let conversation = await this.repository.getById(conversationId);
        
        if (!conversation) {
            conversation = new Conversation(conversationId, this.systemPrompt);
        }

        const activeConversation = conversation;

        activeConversation.addUserMessage(message);

        const response = await this.provider.send(activeConversation.getMessages(), {
            previousResponseId: activeConversation.getPreviousResponseId(),
        });

        activeConversation.addAssistantMessage(response.text);
        
        if (response.responseId) {
            activeConversation.setPreviousResponseId(response.responseId);
        }

        await this.repository.save(activeConversation);

        return response.text;
    }

    public async streamMessage(
        conversationId: string,
        message: string
    ): Promise<AsyncGenerator<string, void, unknown>> {
        let conversation = await this.repository.getById(conversationId);
        
        if (!conversation) {
            conversation = new Conversation(conversationId, this.systemPrompt);
        }

        const activeConversation = conversation;

        activeConversation.addUserMessage(message);

        const generator = await this.provider.stream(activeConversation.getMessages(), {
            previousResponseId: activeConversation.getPreviousResponseId(),
        });

        const self = this;
        async function* streamWrapper() {
            let fullText = "";
            for await (const chunk of generator) {
                fullText += chunk;
                yield chunk;
            }
            activeConversation.addAssistantMessage(fullText);
            activeConversation.setPreviousResponseId(`stream-response-${Date.now()}`);
            await self.repository.save(activeConversation);
        }

        return streamWrapper();
    }

    public async clear(conversationId: string): Promise<void> {
        await this.repository.clear(conversationId);
    }

    public async getHistory(conversationId: string): Promise<ChatMessage[]> {
        const conversation = await this.repository.getById(conversationId);
        return conversation ? conversation.getMessages() : [];
    }
}
