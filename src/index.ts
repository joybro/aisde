#!/usr/bin/env node

import readline from "readline";
import fs from "fs";

function readConfig(): { [key: string]: string } {
    const configPath = "aisde.json";
    if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, "utf-8");
        return JSON.parse(configData);
    }
    return {};
}

async function main() {
    const config = readConfig();

    // Update API_KEY and API_ENDPOINT from config if they exist
    if (!config.api_key) {
        console.log("Please provide an API key in aisde.json");
        return;
    }

    console.log("Welcome to the AISDE!");
    let chatHistory = "";

    while (true) {
        const question = await getInput("Ask your question: ");

        if (question.toLowerCase() === "quit") {
            break;
        }

        const response = "TODO";
        console.log(`AI Assistant: ${response}`);

        chatHistory += `User: ${question}\nAI Assistant: ${response}\n`;
    }
}

function getInput(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(prompt, (input) => {
            rl.close();
            resolve(input);
        });
    });
}

main();
