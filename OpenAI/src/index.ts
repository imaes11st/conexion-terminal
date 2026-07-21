import { Terminal } from "./cli/terminal.js";

async function main() {

    const terminal = new Terminal();

    await terminal.start();

}

main().catch(console.error);