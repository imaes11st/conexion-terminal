import OpenAI from "openai";
import { config } from "../config/config.js";
import type { ChatMessage, AIResponse } from "../../core/types/chat.types.js";
import type { AIProvider } from "../../core/ports/provider.port.js";

export class OpenAIProvider implements AIProvider {
    private readonly client: OpenAI;
    private readonly model: string;

    constructor() {
        this.client = new OpenAI({
            apiKey: config.openai.apiKey,
        });
        this.model = config.openai.model;
    }

    public async send(
        messages: ChatMessage[],
        options?: { previousResponseId?: string }
    ): Promise<AIResponse> {
        const response = await (this.client as any).responses.create({
            model: this.model,
            input: messages,
            previous_response_id: options?.previousResponseId,
        });

        return {
            text: response.output_text,
            responseId: response.id,
        };
    }

    public async stream(
        messages: ChatMessage[],
        options?: { previousResponseId?: string }
    ): Promise<AsyncGenerator<string, void, unknown>> {
        try {
            const responseStream = await (this.client as any).responses.create({
                model: this.model,
                input: messages,
                previous_response_id: options?.previousResponseId,
                stream: true,
            });

            async function* generator() {
                for await (const chunk of responseStream) {
                    yield chunk.choices?.[0]?.delta?.content || "";
                }
            }
            return generator();
        } catch (error) {
            // Fallback robusto de simulación si la API "responses" no soporta streaming nativo
            const response = await this.send(messages, options);
            const text = response.text;
            
            async function* generator() {
                const chunks = text.match(/.{1,4}/g) || [text];
                for (const chunk of chunks) {
                    yield chunk;
                    await new Promise((resolve) => setTimeout(resolve, 25));
                }
            }
            return generator();
        }
    }
}
