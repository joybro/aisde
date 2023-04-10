#!/usr/bin/env node

import { ChatOpenAI } from 'langchain/chat_models';
import { HumanChatMessage, AIChatMessage } from 'langchain/schema';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { program } from 'commander';

// Import with the .js extension, even though the actual file is a TypeScript file.
// This is because we have "type": "module" in package.json, and Node.js expects the final
// extension of the compiled JavaScript files in the import statement when using ES modules.
import config from './config.js';
import CodebaseService from './codebase-service.js';
import ChatHistory from './chat-history.js';
import IOHandler from './io-handler.js';
import AIInputGenerator from './ai-input-generator.js';
import VectorStore from './vector-store.js';

async function main(cleanVectorStore: boolean) {
    const chatHistory = new ChatHistory(200);
    const chat = new ChatOpenAI({
        openAIApiKey: config.api_key,
        temperature: config.temperature,
    });
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: config.api_key,
    });
    const ioHandler = new IOHandler();
    const codebase = new CodebaseService(
        new VectorStore(embeddings, config.vector_store_local_path),
        ioHandler,
        config.files,
    );
    await codebase.init(cleanVectorStore);

    const aiInputGenerator = new AIInputGenerator(
        codebase,
        chatHistory,
        ioHandler,
    );
    let totalTokensUsed = 0;

    ioHandler.printWelcomeMessage();

    while (true) {
        const userInput = await ioHandler.getUserInput(
            '\nAsk your question (Enter a blank line to finish input): ',
        );

        if (userInput.toLowerCase() === 'quit') {
            break;
        }

        chatHistory.addMessage(new HumanChatMessage(userInput));

        const messages = await aiInputGenerator.generateForChatModel(
            chat,
            userInput,
        );

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

            const gpt35TurboPrice = 0.002;
            const cost = (totalTokensUsed / 1000.0) * gpt35TurboPrice;

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

    process.exit(0);
}

program.option(
    '-c, --clean-vector-store',
    'Start with a new clean vector store',
);

program.parse();

main(program.opts().cleanVectorStore || false);
