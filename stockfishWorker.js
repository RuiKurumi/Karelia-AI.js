const { parentPort } = require("worker_threads");
const { spawn } = require("child_process");
const path = require("path");

const stockfishPath = path.join(__dirname, "src", "stockfish-17-single.js");
const stockfish = spawn("node", [stockfishPath]);

console.log("Stockfish Worker Started");

process.stdin.resume();

parentPort.on("message", (msg) => {
    console.log(`Received message in Worker: ${msg}`);
    stockfish.stdin.write(msg + "\n");
});

stockfish.stdout.on("data", (data) => {
    const response = data.toString();
    console.log(`Stockfish Response: ${response}`);

    if (response.includes("bestmove")) {
        const match = response.match(/bestmove (\S+)/);
        if (match) {
            const bestMove = match[1];
            console.log(`Best move found: ${bestMove}`);
            parentPort.postMessage({ type: "bestmove", move: bestMove });
        }
    }
});

stockfish.stderr.on("data", (err) => {
    console.error(`Stockfish Error: ${err.toString()}`);
});

stockfish.on("exit", (code) => {
    if (code !== 0) {
        console.error(`Stockfish Worker exited with code ${code}`);
    }
});
