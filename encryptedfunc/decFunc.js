const fs = require('fs');  // Required for writing logs
const path = require('path'); // Required for file paths

function zrffntrUnaqyre(message) {
    if (!message) return; // message is a string now, so remove .content

    const logPath = path.join(__dirname, 'message_logs.txt');
    const logEntry = `[${new Date().toISOString()}] ${message}
`;

    fs.appendFile(logPath, logEntry, (err) => {
        if (err) {
            console.error("Error writing to message log:", err);
        }
    });
}

// Export the function so index.js can use it
module.exports = { zrffntrUnaqyre };