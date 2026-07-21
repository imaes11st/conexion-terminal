import dotenv from "dotenv";

dotenv.config({
    path: ".env.local",
});

const provider = process.env.APP_MODE || "mock";
const apiKey = process.env.OPENAI_API_KEY;

if (provider === "openai" && !apiKey) {
    throw new Error("OPENAI_API_KEY no está definida.");
}

export const config = {
    openai: {
        apiKey: apiKey || "",
        model: "gpt-5-nano",
        temperature: 0.7,
        maxOutputTokens: 2048,
    },
    app: {
        name: "OpenAI CLI",
        version: "1.0.0",
        provider: provider as "mock" | "openai",
    },
} as const;
