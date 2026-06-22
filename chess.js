const { Worker } = require("worker_threads");
const path = require("path");
const { Chess } = require("chess.js");


const workerPath = path.join(__dirname, "stockfishWorker.js");
const games = new Map();
const PIECES = {
    pawn: "p",
    p: "p",
    knight: "n",
    horse: "n",
    n: "n",
    bishop: "b",
    b: "b",
    rook: "r",
    r: "r",
    queen: "q",
    q: "q",
    king: "k",
    k: "k",
};      


function makeMove(userId, moveInput, callback) {
    const game = getGame(userId);
    const parsedMove = applyUserMove(game, moveInput);

    if (parsedMove.error) {
        callback(null, parsedMove.error);
        return;
    }
    if (parsedMove.resign) {
        const fen = game.fen();
        resetGame(userId);
        callback({ userMove: 'resign', aiMove: null, gameOver: 'resignation', fen });
        return;
    }

    const userMove = parsedMove.move;
    const userMoveUci = toUci(userMove);

    console.log(`Processing move for user: ${userId}, Move: ${userMoveUci}`);

    if (game.isGameOver()) {
        callback({ userMove: userMoveUci, aiMove: null, gameOver: getGameOverReason(game) });
        return;
    }

    const stockfishWorker = new Worker(workerPath);
    const timeout = setTimeout(() => {
        game.undo();
        stockfishWorker.terminate();
        callback(null, "Stockfish took too long to respond.");
    }, 15000);

    stockfishWorker.on("message", (msg) => {
        console.log(`Worker Response: ${JSON.stringify(msg)}`);

        if (msg.type !== "bestmove") return;

        clearTimeout(timeout);
        const aiMove = applyUciMove(game, msg.move);

        if (!aiMove) {
            game.undo();
            callback(null, `Stockfish returned an illegal move: ${msg.move}`);
            stockfishWorker.terminate();
            return;
        }

        callback({
            userMove: userMoveUci,
            userSan: userMove.san,
            aiMove: toUci(aiMove),
            aiSan: aiMove.san,
            gameOver: game.isGameOver() ? getGameOverReason(game) : null,
            fen: game.fen(),
        });
        stockfishWorker.terminate();
    });

    stockfishWorker.on("error", (err) => {
        clearTimeout(timeout);
        console.error(`Stockfish Worker Error: ${err.message}`);
        game.undo();
        callback(null, "Stockfish failed while generating a move.");
        stockfishWorker.terminate();
    });

    stockfishWorker.on("exit", (code) => {
        if (code !== 0) {
            console.log(`Stockfish Worker exited with code ${code}`);
        }
    });

    stockfishWorker.postMessage(`position fen ${game.fen()}`);
    stockfishWorker.postMessage("go depth 15");
}

function resetGame(userId) {
    games.delete(userId);
}

function getGame(userId) {
    if (!games.has(userId)) {
        games.set(userId, new Chess());
    }

    return games.get(userId);
}

function applyUserMove(game, input) {
    const rawInput = input.trim();

    if (!rawInput) {
        return { error: "Please provide a move." };
    }

    if (rawInput.toLowerCase() === 'resign') {
        return { resign: true };
    }
    const uciMatch = rawInput.toLowerCase().match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
    if (uciMatch) {
        const move = applyUciMove(game, rawInput.toLowerCase());
        return move ? { move } : { error: `Illegal move: ${rawInput}` };
    }

    const sanMove = trySanMove(game, rawInput);
    if (sanMove) {
        return { move: sanMove };
    }

    return applyPieceMove(game, rawInput);
}

function applyPieceMove(game, input) {
    const tokens = input
        .toLowerCase()
        .replace(/[-_]/g, " ")
        .replace(/\bto\b/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    const piece = PIECES[tokens[0]];
    const destination = tokens.findLast(token => /^[a-h][1-8]$/.test(token));
    const from = tokens.find((token, index) => index > 0 && /^[a-h][1-8]$/.test(token) && token !== destination);

    if (!piece || !destination) {
        return {
            error: "Use `chessmove e2e4`, SAN like `Nf3`, or piece format like `chessmove knight f3`."
        };
    }

    const candidates = game.moves({ verbose: true })
        .filter(move => move.piece === piece && move.to === destination && (!from || move.from === from));

    if (candidates.length === 0) {
        return { error: `No legal ${tokens[0]} move to ${destination}.` };
    }

    const preferredMove = candidates.find(move => move.promotion === "q") || candidates[0];
    const sameDestinationCandidates = candidates.filter(move => move.promotion === preferredMove.promotion);

    if (!from && sameDestinationCandidates.length > 1) {
        const choices = sameDestinationCandidates.map(move => `${move.from}${move.to}`).join(", ");
        return { error: `That move is ambiguous. Try one of: ${choices}.` };
    }

    const move = game.move({
        from: preferredMove.from,
        to: preferredMove.to,
        promotion: preferredMove.promotion,
    });

    return move ? { move } : { error: `Illegal move: ${input}` };
}

function trySanMove(game, input) {
    try {
        return game.move(input);
    } catch (error) {
        return null;
    }
}

function applyUciMove(game, uciMove) {
    try {
        return game.move({
            from: uciMove.slice(0, 2),
            to: uciMove.slice(2, 4),
            promotion: uciMove[4],
        });
    } catch (error) {
        return null;
    }
}

function toUci(move) {
    return `${move.from}${move.to}${move.promotion || ""}`;
}

function getGameOverReason(game) {
    if (game.isCheckmate()) return "checkmate";
    if (game.isStalemate()) return "stalemate";
    if (game.isDraw()) return "draw";
    return "game over";
}

module.exports = { makeMove, resetGame };
