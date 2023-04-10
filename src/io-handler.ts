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
            let lines: string[] = [];

            rl.on('line', line => {
                if (line.trim() === '') {
                    rl.close();
                } else {
                    lines.push(line);
                    rl.prompt();
                }
            });

            rl.on('close', () => {
                resolve(lines.join('\n'));
            });

            rl.on('SIGINT', () => {
                lines = ['quit'];
                rl.close();
            });
        });
    }

    printWelcomeMessage() {
        console.log(chalk.bold('Welcome to the AISDE!'));
    }

    printAIResponse(response: string) {
        console.log(chalk.green(`\nAISDE: ${response}`));
    }

    showSpinner(show: boolean) {
        if (show) {
            this.spinner.start();
        } else {
            this.spinner.stop();
        }
    }

    printWarning(message: string) {
        console.log(chalk.yellow(`Warning: ${message}`));
    }

    printInfo(message: string) {
        console.log(chalk.cyan(`Info: ${message}`));
    }

    printError(error: any) {
        console.log(chalk.red(`Error message: ${error.message}`));
        if (error.response && error.response.data) {
            console.log(chalk.red('Error response data:'), error.response.data);
        } else {
            console.log(chalk.yellow('No additional error data available'));
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
                `Estimated cost for the current session: $${cost.toFixed(3)}`,
            ),
        );
    }
}

export default IOHandler;
