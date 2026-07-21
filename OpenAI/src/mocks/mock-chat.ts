export class MockChatService {

    public async send(message: string): Promise<string> {

        await new Promise(resolve => setTimeout(resolve, 500));

        const text = message.toLowerCase();

        if (text.includes("hola")) {
            return "Hola 👋 ¿Cómo estás?";
        }

        if (text.includes("typescript")) {
            return "TypeScript es un superconjunto de JavaScript que añade tipado estático.";
        }

        return `Mock: recibí el mensaje "${message}".`;
    }

}