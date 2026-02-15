const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'bot.log');

class logger {
    constructor() {
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
            gray: '\x1b[90m'
        };

        this.errorText = `${this.colors.red}ERROR${this.colors.reset}`;
        this.warnText = `${this.colors.yellow}WARN${this.colors.reset}`;
        this.infoText = `${this.colors.cyan}INFO${this.colors.reset}`;
        this.debugText = `${this.colors.magenta}DEBUG${this.colors.reset}`;

        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }
    }

    getTimestamp() {
        const now = new Date();
        const date = now.toLocaleDateString('cs-CZ');
        const time = now.toLocaleTimeString('cs-CZ');
        return `${date} ${time}`;
    }

    format(level, message, data) {
        const timestamp = this.getTimestamp();
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level}] ${message}${dataStr}`;
    }

    writeToFile(message) {
        try {
            fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    info(message, data) {
        const logMessage = this.format('INFO', message, data);
        const colorMessage = `${this.colors.gray}[${this.getTimestamp()}]${this.colors.reset} ${this.infoText} ${message}`;
        console.log(colorMessage);
        this.writeToFile(logMessage);
    }

    warn(message, data) {
        const logMessage = this.format('WARN', message, data);
        const colorMessage = `${this.colors.gray}[${this.getTimestamp()}]${this.colors.reset} ${this.warnText} ${message}`;
        console.warn(colorMessage);
        this.writeToFile(logMessage);
    }

    error(message, data) {
        const logMessage = this.format('ERROR', message, data);
        const colorMessage = `${this.colors.gray}[${this.getTimestamp()}]${this.colors.reset} ${this.errorText} ${message}`;
        console.error(colorMessage);
        this.writeToFile(logMessage);
    }

    debug(message, data) {
        const logMessage = this.format('DEBUG', message, data);
        const colorMessage = `${this.colors.gray}[${this.getTimestamp()}]${this.colors.reset} ${this.debugText} ${message}`;
        console.log(colorMessage);
        this.writeToFile(logMessage);
    }

    success(message, data) {
        const logMessage = this.format('SUCCESS', message, data);
        const colorMessage = `${this.colors.gray}[${this.getTimestamp()}]${this.colors.reset} ${this.colors.green}SUCCESS${this.colors.reset} ${message}`;
        console.log(colorMessage);
        this.writeToFile(logMessage);
    }

    clear() {
        try {
            if (fs.existsSync(LOG_FILE)) {
                fs.unlinkSync(LOG_FILE);
            }
        } catch (error) {
            console.error('Failed to clear log file:', error);
        }
    }
}

module.exports = new logger();
