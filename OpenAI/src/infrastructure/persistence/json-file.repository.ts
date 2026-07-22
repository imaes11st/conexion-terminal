import fs from "node:fs/promises";
import path from "node:path";
import { Conversation } from "../../core/entities/conversation.js";
import type { ConversationRepository } from "../../core/ports/repository.port.js";
import type { ChatMessage } from "../../core/types/chat.types.js";

interface SerializedConversation {
    id: string;
    messages: ChatMessage[];
    previousResponseId?: string;
}

export class JsonFileConversationRepository implements ConversationRepository {
    private readonly filePath: string;
    private writePromiseChain: Promise<void> = Promise.resolve();

    constructor(fileName: string = "conversations.json") {
        this.filePath = path.resolve(process.cwd(), ".data", fileName);
    }

    private async ensureDir(): Promise<void> {
        const dir = path.dirname(this.filePath);
        await fs.mkdir(dir, { recursive: true });
    }

    private async readAll(): Promise<Record<string, SerializedConversation>> {
        try {
            await this.ensureDir();
            const data = await fs.readFile(this.filePath, "utf-8");
            
            if (!data.trim()) {
                return {};
            }
            
            return JSON.parse(data);
        } catch (error: any) {
            // Si el archivo no existe, es normal y retornamos un mapa vacío
            if (error.code === "ENOENT") {
                return {};
            }
            
            // Si hay errores de permisos (EACCES) o de formato JSON inválido, relanzamos el error
            console.error(`[JsonFileConversationRepository] Error crítico al leer ${this.filePath}:`, error);
            throw error;
        }
    }

    private async queueWrite(data: Record<string, SerializedConversation>): Promise<void> {
        // Encolamos secuencialmente las tareas de escritura para evitar condiciones de carrera locales
        this.writePromiseChain = this.writePromiseChain
            .catch(() => {}) // Recuperación de fallos previos para no congelar la cola
            .then(async () => {
                await this.ensureDir();
                await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
            });

        await this.writePromiseChain;
    }

    public async getById(id: string): Promise<Conversation | null> {
        const store = await this.readAll();
        const serialized = store[id];

        if (!serialized) {
            return null;
        }

        const conversation = new Conversation(serialized.id);
        
        if (serialized.previousResponseId) {
            conversation.setPreviousResponseId(serialized.previousResponseId);
        }

        for (const msg of serialized.messages) {
            if (msg.role === "system") {
                conversation.setSystemPrompt(msg.content);
            } else if (msg.role === "user") {
                conversation.addUserMessage(msg.content);
            } else if (msg.role === "assistant") {
                conversation.addAssistantMessage(msg.content);
            }
        }

        return conversation;
    }

    public async save(conversation: Conversation): Promise<void> {
        const store = await this.readAll();
        
        store[conversation.getId()] = {
            id: conversation.getId(),
            messages: conversation.getMessages(),
            previousResponseId: conversation.getPreviousResponseId(),
        };

        await this.queueWrite(store);
    }

    public async clear(id: string): Promise<void> {
        const store = await this.readAll();
        const serialized = store[id];
        
        if (serialized) {
            const conversation = new Conversation(serialized.id);
            for (const msg of serialized.messages) {
                if (msg.role === "system") {
                    conversation.setSystemPrompt(msg.content);
                }
            }
            
            store[id] = {
                id: conversation.getId(),
                messages: conversation.getMessages(),
                previousResponseId: undefined,
            };
            
            await this.queueWrite(store);
        }
    }

    public async delete(id: string): Promise<void> {
        const store = await this.readAll();
        if (store[id]) {
            delete store[id];
            await this.queueWrite(store);
        }
    }

    public async listIds(): Promise<string[]> {
        const store = await this.readAll();
        return Object.keys(store);
    }
}
