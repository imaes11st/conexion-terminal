import { ChatService } from "./services/chat.service.js";

async function main() {
    const chat = new ChatService();

    const response = await chat.send("Hola");

    console.log(response);
}

main().catch(console.error);