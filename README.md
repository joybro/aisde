# AISDE - AI Software Development Environment

AISDE is a GPT-powered AI tool that comprehends your codebase and assists you in the development process. The AI is designed to understand the codebase, help you fix errors, and suggest improvements to your code.

## Features

-   Understands your codebase
-   Provides assistance in fixing errors
-   Suggests improvements to your code

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

### Example Usage

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

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

ISC
