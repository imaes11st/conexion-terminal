export enum Command {
    HELP = "/help",
    CLEAR = "/clear",
    EXIT = "/exit",
}

export function isCommand(input: string): boolean {
    return input.startsWith("/");
}

export function executeCommand(command: string): boolean {

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

            console.clear();
            return true;

        case Command.EXIT:

            console.log("\nHasta luego 👋");
            process.exit(0);

        default:

            console.log(`Comando desconocido: ${command}`);
            return true;

    }

}