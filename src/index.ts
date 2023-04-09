#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import path from 'path';
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

    // Read API_KEY from config file
    if (!config.api_key) {
        console.log('Please provide an API key in aisde.json');
        return;
    }

    const chat = new ChatOpenAI({ openAIApiKey: config.api_key });

    console.log('Welcome to the AISDE!');

    // Read index.ts and package.json contents
    const packageJsonContent = fs.readFileSync('package.json', 'utf-8');

    const srcDir = 'src';

    // Find all ts files in the src directory and read their contents
    const tsFiles = fs
        .readdirSync(srcDir)
        .filter(file => path.extname(file) === '.ts')
        .map(file => {
            const path = `${srcDir}/${file}`;
            return [path, fs.readFileSync(path, 'utf-8')];
        })
        .map(
            ([path, content]) =>
                new SystemChatMessage(
                    `Here is the content of ${path}:\n${content}`,
                ),
        );

    let messages = [
        new SystemChatMessage('You are an AI developer assistant.'),
        new SystemChatMessage(
            `Here is the content of package.json:\n${packageJsonContent}`,
        ),
        ...tsFiles,
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
