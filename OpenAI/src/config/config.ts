import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("OPENAI_API_KEY no está definida.");
}

export const config = {
    openai: {
        apiKey,
        model: "gpt-5-nano",
        temperature: 0.7,
        maxOutputTokens: 2048,
    },

    chat: {
        stream: true,
        maxHistory: 20,
    },

    app: {
        debug: true,
    },
} as const;