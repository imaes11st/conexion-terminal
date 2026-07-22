import { NextRequest } from "next/server";
import { ChatService } from "@/application/services/chat.service";
import { JsonFileConversationRepository } from "@/infrastructure/persistence/json-file.repository";
import { OpenAIProvider } from "@/infrastructure/providers/openai.provider";
import { MockProvider } from "@/infrastructure/providers/mock.provider";
import { config } from "@/infrastructure/config/config";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { conversationId, message, provider: selectedProvider } = body;

        if (!conversationId || !message) {
            return new Response(
                JSON.stringify({ error: "conversationId y message son requeridos." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const repository = new JsonFileConversationRepository();
        
        const providerType = selectedProvider || config.app.provider;
        const provider = providerType === "openai"
            ? new OpenAIProvider()
            : new MockProvider();

        const chatService = new ChatService(provider, repository);
        
        const generator = await chatService.streamMessage(conversationId, message);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of generator) {
                        controller.enqueue(encoder.encode(chunk));
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            }
        });

    } catch (error: any) {
        console.error("[Route Handler Error]:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Error interno del servidor." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");

        const repository = new JsonFileConversationRepository();
        const provider = new MockProvider();
        const chatService = new ChatService(provider, repository);

        if (conversationId) {
            const history = await chatService.getHistory(conversationId);
            return new Response(JSON.stringify({ history }), {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            const list = await chatService.listConversations();
            return new Response(JSON.stringify({ conversations: list }), {
                headers: { "Content-Type": "application/json" }
            });
        }
    } catch (error: any) {
        console.error("[Route GET Error]:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Error interno al obtener conversaciones." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return new Response(
                JSON.stringify({ error: "conversationId es requerido para eliminar." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const repository = new JsonFileConversationRepository();
        const provider = new MockProvider();
        const chatService = new ChatService(provider, repository);
        
        await chatService.delete(conversationId);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        console.error("[Route DELETE Error]:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Error interno al eliminar conversación." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
