import { Terminal } from "./cli/terminal.js";
import { ChatService } from "./application/services/chat.service.js";
import { MemoryConversationRepository } from "./infrastructure/persistence/memory.repository.js";
import { OpenAIProvider } from "./infrastructure/providers/openai.provider.js";
import { MockProvider } from "./infrastructure/providers/mock.provider.js";
import { config } from "./infrastructure/config/config.js";

async function main() {
    const repository = new MemoryConversationRepository();
    
    const provider = config.app.provider === "openai" 
        ? new OpenAIProvider() 
        : new MockProvider();

    const chat = new ChatService(provider, repository);
    const terminal = new Terminal(chat);

    await terminal.start();
}

main().catch(console.error);