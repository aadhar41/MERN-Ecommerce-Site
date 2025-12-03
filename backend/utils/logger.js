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
        },
        success: (...args) => {
            console.log(...args); // Print to console
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            accessLogStream.write(`[SUCCESS] ${new Date().toISOString()} ${message}\n`);
        },
        warn: (...args) => {
            console.warn(...args); // Print to console
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            accessLogStream.write(`[WARNING] ${new Date().toISOString()} ${message}\n`);
        },
        info: (...args) => {
            console.info(...args); // Print to console
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            accessLogStream.write(`[INFO] ${new Date().toISOString()} ${message}\n`);
        },
        debug: (...args) => {
            console.debug(...args); // Print to console
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            accessLogStream.write(`[DEBUG] ${new Date().toISOString()} ${message}\n`);
        },
        verbose: (...args) => {
            console.verbose(...args); // Print to console
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            accessLogStream.write(`[VERBOSE] ${new Date().toISOString()} ${message}\n`);
        },
        silly: (...args) => {
            console.silly(...args); // Print to console
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            accessLogStream.write(`[SILLY] ${new Date().toISOString()} ${message}\n`);
        }
    };
};

module.exports = createLogger;
