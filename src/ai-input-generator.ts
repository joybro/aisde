import { BaseChatModel } from 'langchain/chat_models';
import { SystemChatMessage } from 'langchain/schema';
import config from './config.js';
import CodebaseService from './codebase-service.js';
import ChatHistory from './chat-history.js';

const roleDescription =
    'You are an AI developer assistant assisting the user in developing and ' +
    "enhancing a software package. The package's code is provided below, " +
    'and when suggesting changes or improvements to the code, ' +
    'it is important to highlight the differences using +/- notation, ' +
    'similar to the git diff format. This will help the user easily ' +
    'understand which lines of code have been added, deleted, or modified';

class AIInputGenerator {
    private codebaseService: CodebaseService;
    private chatHistory: ChatHistory;
    private source_code_path: string[];
    private include_files: string[];

    constructor(codebaseService: CodebaseService, chatHistory: ChatHistory) {
        this.codebaseService = codebaseService;
        this.chatHistory = chatHistory;
        this.source_code_path = config.source_code_path || [
            'src/**/*.{ts,tsx}',
        ];
        this.include_files = config.include_files || ['package.json'];
    }

    async generateForChatModel(chatModel: BaseChatModel) {
        // Find all source files and read their contents
        const filepaths = this.codebaseService
            .find(this.source_code_path)
            .concat(this.include_files);
        const sourceCodeMessages = filepaths.map(path => {
            const content = this.codebaseService.readFileContent(path);
            return new SystemChatMessage(
                `\nHere is the content of ${path}:\n\n${content}`,
            );
        });

        // Send the last 1000 tokens of chat history to the AI
        const chatMessages = await this.chatHistory.getMessagesForTokenLimit(
            chatModel,
            1000,
        );
        const messages = [
            new SystemChatMessage(roleDescription),
            ...sourceCodeMessages,
            ...chatMessages,
        ];

        return messages;
    }
}

export default AIInputGenerator;
