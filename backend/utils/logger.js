const fs = require('fs');
const path = require('path');

const createLogger = (fileNamePrefix) => {
    const logDirectory = path.join(__dirname, '../../logs');
    const logFile = path.join(logDirectory, `${fileNamePrefix}-${new Date().toISOString().split('T')[0]}.log`);

    // Ensure the log directory exists
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, { recursive: true });
    }

    // Create a write stream for appending logs
    const accessLogStream = fs.createWriteStream(logFile, { flags: 'a' });

    return {
        log: (...args) => {
            console.log(...args); // Print to console
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            accessLogStream.write(`[INFO] ${new Date().toISOString()} ${message}\n`);
        },
        error: (...args) => {
            console.error(...args); // Print to console
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            accessLogStream.write(`[ERROR] ${new Date().toISOString()} ${message}\n`);
        }
    };
};

module.exports = createLogger;
