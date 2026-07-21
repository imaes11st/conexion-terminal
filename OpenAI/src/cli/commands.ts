import { ChatService } from "../application/services/chat.service.js";

export enum Command {
    HELP = "/help",
    CLEAR = "/clear",
    EXIT = "/exit",
}

export function isCommand(input: string): boolean {
    return input.startsWith("/");
}

export async function executeCommand(
    command: string,
    chat: ChatService,
    conversationId: string
): Promise<boolean> {
    switch (command.trim()) {
        case Command.HELP:
            console.log("");
            console.log("Comandos disponibles:");
            console.log("/help   Mostrar ayuda");
            console.log("/clear  Limpiar conversación");
            console.log("/exit   Salir");
            console.log("");
            return true;

        case Command.CLEAR:
            await chat.clear(conversationId);
            console.clear();
            console.log("\nConversación reiniciada.\n");
            return true;

        case Command.EXIT:
            console.log("\nHasta luego 👋");
            process.exit(0);

        default:
            console.log(`Comando desconocido: ${command}`);
            return true;
    }
}