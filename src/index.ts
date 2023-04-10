#!/usr/bin/env node

import ora from 'ora';
import readline from 'readline';
import chalk from 'chalk';
import { ChatOpenAI } from 'langchain/chat_models';
import {
    HumanChatMessage,
    AIChatMessage,
    SystemChatMessage,
} from 'langchain/schema';
import CodebaseService from './codebase-service.js';

// Import with the .js extension, even though the actual file is a TypeScript file.
// This is because we have "type": "module" in package.json, and Node.js expects the final
// extension of the compiled JavaScript files in the import statement when using ES modules.
import config from './config.js';

async function main() {
    const source_code_path = config.source_code_path || ['src/**/*.{ts,tsx}'];
    const include_files = config.include_files || ['package.json'];

    const chat = new ChatOpenAI({ openAIApiKey: config.api_key });
    let totalTokensUsed = 0;

    console.log('Welcome to the AISDE!');

    const codebase = new CodebaseService();

    // Find all source files and read their contents
    const filepaths = codebase.find(source_code_path).concat(include_files);
    const codeChatMessages = filepaths
        .map(path => [path, codebase.readFileContent(path)])
        .map(
            ([path, content]) =>
                new SystemChatMessage(
                    `Here is the content of ${path}:\n${content}`,
                ),
        );

    let messages = [
        new SystemChatMessage(
            'You are an AI developer assistant assisting the user in developing and ' +
                "enhancing a software package. The package's code is provided below, " +
                'and when suggesting changes or improvements to the code, ' +
                'it is important to highlight the differences using +/- notation, ' +
                'similar to the git diff format. This will help the user easily ' +
                'understand which lines of code have been added, deleted, or modified',
        ),
        ...codeChatMessages,
    ];

    while (true) {
        const question = await getInput(
            chalk.blue(
                '\nAsk your question (Enter a blank line to finish input): ',
            ),
        );

        if (question.toLowerCase() === 'quit') {
            break;
        }

        messages.push(new HumanChatMessage(question));

        const spinner = ora('Thinking...').start();
        const aiResponse = await chat.call(messages);
        spinner.stop();

        const response = aiResponse.text;
        console.log(chalk.green(`\nAI Assistant: ${response}`));

        messages.push(new AIChatMessage(response));

        const tokensUsed = await chat.getNumTokensFromMessages(messages);
        totalTokensUsed += tokensUsed.totalCount;

        const gpt_3_5_turbo_price = 0.0002;

        console.log(
            chalk.magenta(
                `\nTokens used in the previous Q/A: ${tokensUsed.totalCount}`,
            ),
        );
        console.log(
            chalk.magenta(`Total tokens used so far: ${totalTokensUsed}`),
        );
        console.log(
            chalk.yellow(
                `Estimated cost for the current session: ${(
                    (totalTokensUsed / 1000.0) *
                    gpt_3_5_turbo_price
                ).toFixed(4)}$`,
            ),
        );
    }
}

function getInput(promptMessage: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> ',
    });

    console.log(promptMessage);
    rl.prompt();

    return new Promise(resolve => {
        const lines: string[] = [];

        rl.on('line', line => {
            if (line.trim() === '') {
                rl.close();
                resolve(lines.join('\n'));
            } else {
                lines.push(line);
                rl.prompt();
            }
        });
    });
}

main();
