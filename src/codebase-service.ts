import * as fs from 'fs';
import * as glob from 'glob';

class CodebaseService {
    find(patterns: string[]): string[] {
        return glob.sync(patterns);
    }

    readFileContent(filePath: string): string {
        return fs.readFileSync(filePath, 'utf-8');
    }
}

export default CodebaseService;
