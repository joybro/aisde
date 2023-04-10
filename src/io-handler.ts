import chalk from 'chalk';
import readline from 'readline';
import ora from 'ora';

class IOHandler {
    private spinner;

    constructor() {
        this.spinner = ora('Thinking...');
    }

    async getUserInput(promptMessage: string): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> ',
        });

        console.log(chalk.blue(promptMessage));
        rl.prompt();

        return new Promise(resolve => {
            const lines: string[] = [];

            rl.on('line', line => {
                if (line.trim() === '') {
                    rl.close();
                    resolve(lines.join('\n'));
                } else {
                    lines.push(line);
                    rl.prompt();
                }
            });
        });
    }

    printWelcomeMessage() {
        console.log(chalk.bold('Welcome to the AISDE!'));
    }

    printAIResponse(response: string) {
        console.log(chalk.green(`\nAI Assistant: ${response}`));
    }

    showSpinner(show: boolean) {
        if (show) {
            this.spinner.start();
        } else {
            this.spinner.stop();
        }
    }

    printTokenUsage(tokensUsed: number, totalTokensUsed: number, cost: number) {
        console.log(
            chalk.magenta(`\nTokens used in the previous Q/A: ${tokensUsed}`),
        );
        console.log(
            chalk.magenta(`Total tokens used so far: ${totalTokensUsed}`),
        );
        console.log(
            chalk.yellow(
                `Estimated cost for the current session: ${cost.toFixed(4)}$`,
            ),
        );
    }
}

export default IOHandler;