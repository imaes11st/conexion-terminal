import { sendMessage } from "./services/message.js";

async function main(): Promise<void> {
    const response = await sendMessage("Hola, ¿funcionas?");
    console.log(response);
}

main().catch(console.error);