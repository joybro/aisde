#!/usr/bin/env node

import { ChatOpenAI } from 'langchain/chat_models';
import { HumanChatMessage, AIChatMessage } from 'langchain/schema';

// Import with the .js extension, even though the actual file is a TypeScript file.
// This is because we have "type": "module" in package.json, and Node.js expects the final
// extension of the compiled JavaScript files in the import statement when using ES modules.
import config from './config.js';
import CodebaseService from './codebase-service.js';
import ChatHistory from './chat-history.js';
import IOHandler from './io-handler.js';
import AIInputGenerator from './ai-input-generator.js';

async function main() {
    const chatHistory = new ChatHistory(200);
    const chat = new ChatOpenAI({
        openAIApiKey: config.api_key,
        temperature: 0.4,
    });
    const codebase = new CodebaseService();
    const ioHandler = new IOHandler();
    const aiInputGenerator = new AIInputGenerator(
        codebase,
        chatHistory,
        ioHandler,
    );
    let totalTokensUsed = 0;

    ioHandler.printWelcomeMessage();

    while (true) {
        const question = await ioHandler.getUserInput(
            '\nAsk your question (Enter a blank line to finish input): ',
        );

        if (question.toLowerCase() === 'quit') {
            break;
        }

        chatHistory.addMessage(new HumanChatMessage(question));

        const messages = await aiInputGenerator.generateForChatModel(chat);

        try {
            ioHandler.showSpinner(true);
            const aiResponse = await chat.call(messages);
            ioHandler.showSpinner(false);

            const response = aiResponse.text;
            ioHandler.printAIResponse(response);
            chatHistory.addMessage(new AIChatMessage(response));

            // report token usage
            const tokensUsed = await chat.getNumTokensFromMessages(messages);
            totalTokensUsed += tokensUsed.totalCount;

            const gpt_3_5_turbo_price = 0.0002;
            const cost = (totalTokensUsed / 1000.0) * gpt_3_5_turbo_price;

            ioHandler.printTokenUsage(
                tokensUsed.totalCount,
                totalTokensUsed,
                cost,
            );
        } catch (error: any) {
            ioHandler.showSpinner(false);
            ioHandler.printError(error);
        }
    }
}

main();
