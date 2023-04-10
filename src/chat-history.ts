import { BaseChatModel } from 'langchain/chat_models';
import { BaseChatMessage } from 'langchain/schema';

export class ChatHistory {
    private limit: number;
    private messages: BaseChatMessage[];

    constructor(limit: number) {
        this.limit = limit;
        this.messages = [];
    }

    addMessage(message: BaseChatMessage): void {
        this.messages.push(message);
        if (this.messages.length > this.limit) {
            this.messages.shift();
        }
    }

    async getMessagesForTokenLimit(
        chatModel: BaseChatModel,
        tokenLimit: number,
    ): Promise<BaseChatMessage[]> {
        let tokens = 0;
        let index = this.messages.length;

        while (index > 0 && tokens < tokenLimit) {
            index -= 1;
            const tokensUsed = await chatModel.getNumTokens(
                this.messages[index].text,
            );
            tokens += tokensUsed;
        }

        return this.messages.slice(index);
    }
}

export default ChatHistory;
