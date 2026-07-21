import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { ChatService } from "../services/chat.service.js";
import { executeCommand, isCommand } from "./commands.js";
import { getPrompt } from "./prompt.js";
import { showBanner } from "./banner.js";

export class Terminal {

    private readonly chat = new ChatService();

    private readonly rl = readline.createInterface({
        input,
        output,
    });

    public async start(): Promise<void> {

        showBanner();

        while (true) {

            const message = await this.rl.question(getPrompt());

            if (!message.trim()) {
                continue;
            }

            if (isCommand(message)) {

                executeCommand(message);

                continue;

            }

            try {

                const response = await this.chat.send(message);

                console.log("");
                console.log("🤖 " + response);
                console.log("");

            } catch (error) {

                console.error(error);

            }

        }

    }

}