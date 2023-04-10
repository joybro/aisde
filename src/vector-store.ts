import { HNSWLib } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings';

class VectorStore {
    private vectorStore: HNSWLib | undefined;
    private embeddings: OpenAIEmbeddings;
    private localStoragePath: string;

    constructor(embeddings: OpenAIEmbeddings, localStoragePath: string) {
        this.embeddings = embeddings;
        this.localStoragePath = localStoragePath;
    }

    async similaritySearch(query: string, k: number) {
        if (!this.vectorStore) {
            throw new Error('Vector store is undefined');
        }

        // Results are sorted by similarity
        return await this.vectorStore.similaritySearch(query, k);
    }

    async load(): Promise<void> {
        this.vectorStore = await HNSWLib.load(
            this.localStoragePath,
            this.embeddings,
        );
    }

    async save(): Promise<void> {
        if (!this.vectorStore) {
            throw new Error('Vector store is undefined');
        }

        await this.vectorStore.save(this.localStoragePath);
    }

    getVectorCount(): number {
        if (!this.vectorStore) {
            throw new Error('Vector store is undefined');
        }
        return this.vectorStore.index.getCurrentCount();
    }

    async recreateVectorsFromTexts(
        texts: string[],
        metadatas: object[] | object,
    ): Promise<void> {
        this.vectorStore = await HNSWLib.fromTexts(
            texts,
            metadatas,
            this.embeddings,
        );
    }
}

export default VectorStore;
