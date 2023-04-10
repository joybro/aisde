# AISDE - AI Software Development Engineer

AISDE is a GPT-powered AI tool that comprehends your codebase and assists you in the development process. The AI is designed to understand the codebase, help you fix errors, and suggest improvements to your code.

## Features

-   Comprehends your codebase and stores it in a local vector store (HNSWLib).
-   Provides assistance in fixing errors and suggests improvements to your code.
-   Sends relevant code snippets to the AI model along with your query to provide more accurate and useful responses.

## Installation

```sh
npm install --save-dev aisde
```

## Usage

In your project's root directory, create a .aisderc configuration file with the following content:

```
{
  "api_key": "your_OpenAI_API_key_here",
  "files": ["src/**/*.{ts,tsx}", "package.json", "README.md"],
}
```

Replace your_OpenAI_API_key_here with your OpenAI API key.

To start the AISDE, run the following command in your terminal:

```
npx aisde [-n|--clean-vector-store]
```

You can now interact with the AISDE by asking questions or requesting assistance. Enter a blank line to finish the input and receive a response from the AI.

### Options

-   `-c, --clean-vector-store`: Create a new vector store. By default, AISDE loads the vector store from a file, but this option allows you to create a new vector store from scratch.

### Example Usage 1

```
➜  hello-world git:(master) ✗ npx aisde
Welcome to the AISDE!

Ask your question (Enter a blank line to finish input):
> would you write README.md for this project?
>

AISDE: Sure, here's a basic README.md that you can use as a starting point:

# Hello World

This is a simple "Hello World" application built with Next.js and deployed to AWS using AWS CDK.

## Getting Started

To run this application locally, you'll need to have Node.js installed on your machine. Then, you can follow these steps:

1. Clone the repository to your local machine
2. Run `npm install` to install the dependencies
3. Run `npm run dev` to start the development server

...
```

### Example Usage 2

```
Ask your question (Enter a blank line to finish input):
> would you find all TODOs in source files and suggest code changes for each of them?
>

AISDE: Sure, here are the TODOs in the source files and my suggested code changes:

1. In `src/codebase-service.ts`:

    - TODO: Periodically update the vector store.

        - Suggested code change: The code already has a setInterval function that updates the vector store every 10 minutes. However, you could add a configuration option to allow the user to customize the update interval.

2. In `src/ai-input-generator.ts`:

    - TODO: Send the last 1000 tokens of chat history to the AI.

        - Suggested code change: The code already has a function that retrieves the last 1000 tokens of chat history. However, you could add a configuration option to allow the user to customize the number of tokens to retrieve.

3. In `src/config.ts`:

    - TODO: Change the path of the configuration file.

        - Suggested code change: You could add a configuration option to allow the user to specify the path of the configuration file.

I hope this helps! Let me know if you have any other questions.
```

## Cost

AISDE uses OpenAI's `GPT-3.5-turbo` model for chat and the Embedding API to search for relevant source code. Here's a breakdown of the costs associated with each API:

-   GPT-3.5-turbo Chat API: $0.002 / 1K tokens
-   Embedding API: $0.0004 / 1K tokens

(as of April 2023, https://openai.com/pricing)

While interacting with AISDE, you will consume tokens from both APIs. Please be aware of these costs and manage your API usage accordingly.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

ISC
