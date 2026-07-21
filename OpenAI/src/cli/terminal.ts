import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { ChatService } from "../application/services/chat.service.js";
import { executeCommand, isCommand } from "./commands.js";
import { getPrompt } from "./prompt.js";
import { showBanner } from "./banner.js";

export class Terminal {
    private readonly rl = readline.createInterface({
        input,
        output,
    });

    private readonly conversationId = "cli-session";

    constructor(
        private readonly chat: ChatService
    ) {}

    public async start(): Promise<void> {
        showBanner();

        while (true) {
            const message = await this.rl.question(getPrompt());

            if (!message.trim()) {
                continue;
            }

            if (isCommand(message)) {
                await executeCommand(message, this.chat, this.conversationId);
                continue;
            }

            try {
                const response = await this.chat.sendMessage(this.conversationId, message);

                console.log("");
                console.log("🤖 " + response);
                console.log("");
            } catch (error) {
                console.error("\n❌ Error:", error instanceof Error ? error.message : error);
                console.log("");
            }
        }
    }
}