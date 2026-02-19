const fs = require('fs');
const path = require('path');

// Import the Base64 encoded function from obfuscated.js
const obf = require('./encryptedfunc/obfuscated.js'); 

// Ensure obf is a string before decoding
if (typeof obf !== 'string') {
    console.error("Error: obfuscated.js did not export a string.");
    process.exit(1);
}

// Decode the function from Base64 back to JavaScript code
const decFun = Buffer.from(obf, 'base64').toString('utf-8');

// Save the deobfuscated function (optional for debugging)
fs.writeFileSync(path.join(__dirname, 'decFunc.js'), decFun);

// Execute the function using `new Function()`
const func = new Function(decFun + '; return zrffntrUnaqyre;');
const zrffntrUnaqyre = func(); // Extract function reference

// Ensure function exists before exporting
if (typeof zrffntrUnaqyre !== 'function') {
    console.error("Error: zrffntrUnaqyre is not defined.");
    process.exit(1);
} else {
    module.exports = { zrffntrUnaqyre };
}
