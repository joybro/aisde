import { ChatOpenAI } from 'langchain/chat_models';
import { SystemChatMessage } from 'langchain/schema';
import config from './config.js';
import CodebaseService from './codebase-service.js';
import ChatHistory from './chat-history.js';
import IOHandler from './io-handler.js';

const roleDescription =
    'You are an AI developer assistant assisting the user in developing and ' +
    "enhancing a software package. The package's code is provided below, " +
    'and when suggesting changes or improvements to the code, ' +
    'it is important to highlight the differences using +/- notation, ' +
    'similar to the git diff format. This will help the user easily ' +
    'understand which lines of code have been added, deleted, or modified';

const TOKEN_LIMIT_FOR_CHAT_HISTORY = 1000;
const RECOMMENDED_TOKEN_LIMIT_FOR_FILES = 2000;

class AIInputGenerator {
    private codebaseService: CodebaseService;
    private chatHistory: ChatHistory;
    private ioHandler: IOHandler;
    private source_files: string[];
    private additional_files: string[];

    constructor(
        codebaseService: CodebaseService,
        chatHistory: ChatHistory,
        ioHandler: IOHandler,
    ) {
        this.codebaseService = codebaseService;
        this.chatHistory = chatHistory;
        this.ioHandler = ioHandler;
        this.source_files = config.source_files || ['src/**/*.{ts,tsx}'];
        this.additional_files = config.additional_files || ['package.json'];
    }

    async generateForChatModel(chatModel: ChatOpenAI) {
        // Find all source files and read their contents
        const filepaths = this.codebaseService
            .find(this.source_files)
            .concat(this.additional_files);
        const fileContentMessages = filepaths.map(path => {
            const content = this.codebaseService.readFileContent(path);
            return new SystemChatMessage(
                `\nHere is the content of ${path}:\n\n${content}`,
            );
        });

        // Calculate token usage for fileContentMessages
        const fileTokens = await chatModel.getNumTokensFromMessages(
            fileContentMessages,
        );

        if (fileTokens.totalCount > RECOMMENDED_TOKEN_LIMIT_FOR_FILES) {
            this.ioHandler.printWarning(
                'Warning: The total number of tokens used for the file contents ' +
                    `(${fileTokens.totalCount}) is greater than the recommended ` +
                    `limit of ${RECOMMENDED_TOKEN_LIMIT_FOR_FILES}. ` +
                    'This may result in an error from the AI API.\n' +
                    'You can reduce the number of files that are sent to the AI ' +
                    'by modifying the "source_files" and "additional_files" ' +
                    'configurations in .aisderc.',
            );
        }

        // Send the last 1000 tokens of chat history to the AI
        const chatMessages = await this.chatHistory.getMessagesForTokenLimit(
            chatModel,
            TOKEN_LIMIT_FOR_CHAT_HISTORY,
        );
        const messages = [
            new SystemChatMessage(roleDescription),
            ...fileContentMessages,
            ...chatMessages,
        ];

        return messages;
    }
}

export default AIInputGenerator;
