import { ChatService } from "./services/chat.js";
import { sendMessage } from "./services/message.js";
import { streamMessage } from "./services/stream.js";

async function main() {

    const mode = process.argv[2];

    switch (mode) {

        case "stream":

            await streamMessage("Explícame TypeScript.");

            break;

        case "chat":

            const chat = new ChatService();

            console.log(await chat.send("Hola"));
            console.log(await chat.send("¿Cómo estás?"));
            console.log(await chat.send("¿Qué fue lo primero que te pregunté?"));

            break;

        default:

            console.log(await sendMessage("Hola, ¿funcionas?"));

    }

}

main().catch(console.error);