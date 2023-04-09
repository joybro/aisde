#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
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
    const source_code_path = config.source_code_path || 'src/**/*.ts';
    const include_files = config.include_files || ['package.json'];

    const chat = new ChatOpenAI({ openAIApiKey: config.api_key });
    let totalTokensUsed = 0;

    console.log('Welcome to the AISDE!');

    // Find all source files and read their contents
    const files = glob.sync(source_code_path).concat(include_files);

    const codeChatMessages = files
        .map(file => {
            const path = `${file}`;
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
        ...codeChatMessages,
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

        const tokensUsed = await chat.getNumTokensFromMessages(messages);
        totalTokensUsed += tokensUsed.totalCount;

        console.log(
            `Tokens used in the previous Q/A: ${tokensUsed.totalCount}`,
        );
        console.log(`Total tokens used so far: ${totalTokensUsed}`);
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
