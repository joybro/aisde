import * as fs from 'fs';
import * as glob from 'glob';
import IOHandler from './io-handler.js';
import VectorStore from './vector-store.js';

class CodebaseService {
    private vectorStore: VectorStore;
    private ioHandler: IOHandler;
    private filePaths: string[];

    constructor(
        vectorStore: VectorStore,
        ioHandler: IOHandler,
        filePaths: string[],
    ) {
        this.vectorStore = vectorStore;
        this.ioHandler = ioHandler;
        this.filePaths = filePaths;
    }

    async init(cleanStart: boolean): Promise<void> {
        if (cleanStart) {
            await this.refreshVectorStore();
        } else {
            try {
                await this.vectorStore.load();

                this.ioHandler.printInfo(
                    `Vector store successfully loaded from file with ${this.vectorStore.getVectorCount()} vectors.`,
                );
            } catch (error) {
                this.ioHandler.printWarning(
                    'Failed to load vector store from file. Creating a new one...',
                );
                await this.refreshVectorStore();
            }
        }

        // Periodically update the vector store
        setInterval(() => this.refreshVectorStore(), 10 * 60 * 1000); // Update every 10 minutes
    }

    find(patterns: string[]): string[] {
        return glob.sync(patterns);
    }

    readFileContent(filePath: string): string {
        return fs.readFileSync(filePath, 'utf-8');
    }

    async findRelevantFiles(query: string): Promise<string[]> {
        // Results are sorted by similarity
        const response = await this.vectorStore.similaritySearch(query, 10);
        return response.map(result => result.metadata.filePath);
    }

    private async refreshVectorStore(): Promise<void> {
        const filePaths = this.find(this.filePaths);
        const fileContents = filePaths.map(filePath =>
            this.readFileContent(filePath),
        );
        const metadata = filePaths.map(filePath => ({ filePath }));

        await this.vectorStore.recreateVectorsFromTexts(fileContents, metadata);

        this.ioHandler.printInfo(
            `Vector store successfully refreshed with ${this.vectorStore.getVectorCount()} vectors.`,
        );

        // Save the vector store to file. But we don't need to wait for it.
        this.vectorStore.save();
    }
}

export default CodebaseService;
