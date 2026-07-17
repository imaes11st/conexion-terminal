import OpenAI from "openai";
import { config } from "../config/config.js";

export const client = new OpenAI({
    apiKey: config.openai.apiKey
});