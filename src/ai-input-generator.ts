import { ChatOpenAI } from 'langchain/chat_models';
import { SystemChatMessage } from 'langchain/schema';
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
const TOEKN_LIMIT_FOR_FILE_CONTENTS = 2500;

class AIInputGenerator {
    private codebaseService: CodebaseService;
    private chatHistory: ChatHistory;
    private ioHandler: IOHandler;

    constructor(
        codebaseService: CodebaseService,
        chatHistory: ChatHistory,
        ioHandler: IOHandler,
    ) {
        this.codebaseService = codebaseService;
        this.chatHistory = chatHistory;
        this.ioHandler = ioHandler;
    }

    async generateForChatModel(chatModel: ChatOpenAI, userInput: string) {
        // Find relevant files and read their contents
        const relevantFilePaths = await this.codebaseService.findRelevantFiles(
            userInput,
        );
        const fileContentMessages = await this.getMessagesForTokenLimit(
            chatModel,
            relevantFilePaths,
            TOEKN_LIMIT_FOR_FILE_CONTENTS,
        );

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

    private async getMessagesForTokenLimit(
        chatModel: ChatOpenAI,
        filePaths: string[],
        tokenLimit: number,
    ): Promise<SystemChatMessage[]> {
        let tokens = 0;
        const messages: SystemChatMessage[] = [];

        for (const filePath of filePaths) {
            const content = this.codebaseService.readFileContent(filePath);
            const tokensUsed = await chatModel.getNumTokens(content);

            if (tokens + tokensUsed <= tokenLimit) {
                tokens += tokensUsed;
                messages.push(
                    new SystemChatMessage(
                        `\nHere is the content of ${filePath}:\n\n${content}`,
                    ),
                );
            } else {
                break;
            }
        }

        return messages;
    }
}

export default AIInputGenerator;
