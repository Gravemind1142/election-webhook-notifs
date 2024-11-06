import { existsSync, writeFileSync, readFileSync } from 'fs';
import path, { join } from 'path';
import { fileURLToPath } from 'url';

// Define the path to the JSON file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const timestampFilePath = join(__dirname, "../", 'lastran.json');

// Function to ensure that the JSON file exists
function ensureTimestampFileExists() {
    if (!existsSync(timestampFilePath)) {
        // Initialize the file with an empty JSON object
        writeFileSync(timestampFilePath, JSON.stringify({}, null, 2), 'utf8');
    }
}

// Function to read the current timestamp from the file
export function loadTimestamp() {
    // Check if the file exists and create it if it doesn’t
    ensureTimestampFileExists();
    try {
        const data = readFileSync(timestampFilePath, 'utf8');
        const json = JSON.parse(data);
        return json.timestamp || new Date(0);
    } catch (error) {
        console.error('Could not read timestamp:', error);
        return new Date(0);
    }
}

// Function to save the current timestamp to the file
export function saveTimestamp() {
    const currentTime = new Date().toISOString();
    const json = { timestamp: currentTime };

    writeFileSync(timestampFilePath, JSON.stringify(json, null, 2), 'utf8');
}
