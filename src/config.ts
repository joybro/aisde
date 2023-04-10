import * as fs from 'fs';
import * as path from 'path';

const defaultConfig = {
    api_key: 'your_API_key_here',
    temperature: 0.4,
    files: ['src/**/*.{ts,tsx}', 'package.json'],
    vector_store_local_path: '.vector_store',
};

type Config = typeof defaultConfig;

const getConfig = (): Config => {
    const configFile = path.resolve('.aisderc'); // Change the path of config file
    if (!fs.existsSync(configFile)) {
        console.error(
            `${configFile} not found. Please place a valid configuration file inside the project root directory.`,
        );
        process.exit(1);
    }

    try {
        const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
        if (!configData.api_key) {
            console.error(
                "API key not found!. Please define 'api_key' in configuration file.",
            );
            process.exit(1);
        }
        return { ...defaultConfig, ...configData };
    } catch (err) {
        console.error(`Error parsing ${configFile}:`, err);
        process.exit(1);
    }
};

export default getConfig();
