#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import { ChatOpenAI } from 'langchain/chat_models';
import {
    HumanChatMessage,
    AIChatMessage,
    SystemChatMessage,
} from 'langchain/schema';

function readConfig(): { [key: string]: string } {
    const configPath = '.aisderc';
    if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(configData);
    }
    return {};
}

async function main() {
    const config = readConfig();

    // Update API_KEY and API_ENDPOINT from config if they exist
    if (!config.api_key) {
        console.log('Please provide an API key in aisde.json');
        return;
    }

    const chat = new ChatOpenAI({ openAIApiKey: config.api_key });

    console.log('Welcome to the AISDE!');

    let messages = [
        new SystemChatMessage('You are an AI developer assistant.'),
    ];

    while (true) {
        const question = await getInput('Ask your question: ');

        if (question.toLowerCase() === 'quit') {
            break;
        }

        messages.push(new HumanChatMessage(question));

        const aiResponse = await chat.call(messages);
        const response = aiResponse.text;
        console.log(`AI Assistant: ${response}`);

        messages.push(new AIChatMessage(response));
    }
}

function getInput(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => {
        rl.question(prompt, input => {
            rl.close();
            resolve(input);
        });
    });
}

main();
