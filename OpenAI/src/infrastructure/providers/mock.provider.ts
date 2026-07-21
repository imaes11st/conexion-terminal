import type { ChatMessage, AIResponse } from "../../core/types/chat.types.js";
import type { AIProvider } from "../../core/ports/provider.port.js";

export class MockProvider implements AIProvider {
    public async send(messages: ChatMessage[]): Promise<AIResponse> {
        const last = messages[messages.length - 1];
        const content = last.content.toLowerCase();

        let replyText = `Mock: recibí el mensaje "${last.content}".`;

        if (content.includes("hola")) {
            replyText = "Hola 👋 ¿Cómo estás?";
        } else if (content.includes("typescript")) {
            replyText = "TypeScript es un superconjunto tipado de JavaScript.";
        }

        return {
            text: replyText,
            responseId: `mock-response-${Date.now()}`,
        };
    }

    public async stream(messages: ChatMessage[]): Promise<AsyncGenerator<string, void, unknown>> {
        const response = await this.send(messages);
        const words = response.text.split(" ");
        
        async function* generator() {
            for (const word of words) {
                yield word + " ";
                await new Promise((resolve) => setTimeout(resolve, 60));
            }
        }
        
        return generator();
    }
}
