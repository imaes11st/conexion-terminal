import { config } from "../infrastructure/config/config.js";

export function showBanner(): void {
    console.clear();

    console.log("╔══════════════════════════════════════╗");
    console.log(`║ ${config.app.name} v${config.app.version}`.padEnd(39) + "║");
    console.log("╚══════════════════════════════════════╝");
    console.log("");

    console.log(`Modelo : ${config.openai.model}`);
    console.log("Escribe /help para ver los comandos.");
    console.log("");
}