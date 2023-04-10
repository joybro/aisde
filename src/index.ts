#!/usr/bin/env node

import { ChatOpenAI } from 'langchain/chat_models';
import {
    HumanChatMessage,
    AIChatMessage,
    SystemChatMessage,
    BaseChatMessage,
} from 'langchain/schema';

// Import with the .js extension, even though the actual file is a TypeScript file.
// This is because we have "type": "module" in package.json, and Node.js expects the final
// extension of the compiled JavaScript files in the import statement when using ES modules.
import config from './config.js';
import CodebaseService from './codebase-service.js';
import ChatHistory from './chat-history.js';
import IOHandler from './io-handler.js';

async function main() {
    const source_code_path = config.source_code_path || ['src/**/*.{ts,tsx}'];
    const include_files = config.include_files || ['package.json'];

    const chatHistory = new ChatHistory(200);
    const chat = new ChatOpenAI({ openAIApiKey: config.api_key });
    const codebase = new CodebaseService();
    const ioHandler = new IOHandler();
    let totalTokensUsed = 0;

    ioHandler.printWelcomeMessage();

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

    while (true) {
        const question = await ioHandler.getUserInput(
            '\nAsk your question (Enter a blank line to finish input): ',
        );

        if (question.toLowerCase() === 'quit') {
            break;
        }

        chatHistory.addMessage(new HumanChatMessage(question));

        // Send the last 1000 tokens of chat history to the AI
        const chatMsgs = await chatHistory.getMessagesForTokenLimit(chat, 1000);

        const messages: BaseChatMessage[] = [
            new SystemChatMessage(
                'You are an AI developer assistant assisting the user in developing and ' +
                    "enhancing a software package. The package's code is provided below, " +
                    'and when suggesting changes or improvements to the code, ' +
                    'it is important to highlight the differences using +/- notation, ' +
                    'similar to the git diff format. This will help the user easily ' +
                    'understand which lines of code have been added, deleted, or modified',
            ),
            ...codeChatMessages,
            ...chatMsgs,
        ];

        ioHandler.showSpinner(true);
        const aiResponse = await chat.call(messages);
        ioHandler.showSpinner(false);

        const response = aiResponse.text;
        ioHandler.printAIResponse(response);

        chatHistory.addMessage(new AIChatMessage(response));

        const tokensUsed = await chat.getNumTokensFromMessages(messages);
        totalTokensUsed += tokensUsed.totalCount;

        const gpt_3_5_turbo_price = 0.0002;
        const cost = (totalTokensUsed / 1000.0) * gpt_3_5_turbo_price;

        ioHandler.printTokenUsage(tokensUsed.totalCount, totalTokensUsed, cost);
    }
}

main();
