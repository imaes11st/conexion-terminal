import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({
    path: ".env.local",
});

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("OPENAI_API_KEY no está definida.");
}

export const client = new OpenAI({
    apiKey,
});