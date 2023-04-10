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
  "source_code_path": ["src/**/*.{ts,tsx}"],
  "include_files": ["package.json"]
}
```

Replace your_OpenAI_API_key_here with your OpenAI API key.

To start the AISDE, run the following command in your terminal:

```
npx aisde
```

You can now interact with the AISDE by asking questions or requesting assistance. Enter a blank line to finish the input and receive a response from the AI.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

ISC
