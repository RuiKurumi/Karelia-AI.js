const { makeMove, resetGame } = require('../chess');
const { generateReply, sendReply } = require('../src/kareliaReply.js');
const gifs = require('../learned_gifs_array.json');

function getRandomGif(category) {
  const arr = gifs[category];
  if (!arr?.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function handleChessMove(message, args = []) {
  const move = args.join(' ').trim();

  if (move?.toLowerCase() === 'reset') {
    resetGame(message.author.id);
    return message.reply('Your chess game has been reset.');
  }

  if (!move) {
    return message.reply(
      'Please send a move like `chessmove e2e4`, `chessmove Nf3`, `chessmove knight f3`, or `chessmove reset`.'
    );
  }

  makeMove(message.author.id, move, async (result, error) => {
    if (!result) {
      return message.reply(error || 'Warning: Unable to generate a move. Please try again.');
    }

    const lines = [
      `Your move: **${result.userSan || result.userMove}** (${result.userMove})`,
    ];

    if (result.aiMove) {
      lines.push(`Karelia moves: **${result.aiSan || result.aiMove}** (${result.aiMove})`);
    }

    if (result.gameOver) {
      lines.push(`Game over: **${result.gameOver}**`);

      if (result.gameOver === 'checkmate') {
        const gif = result.aiMove
          ? getRandomGif('karelia_wins')
          : getRandomGif('karelia_loses');
        const { replyText, gifUrl } = await generateReply(
          result.aiMove
            ? `You just beat this user in chess. Taunt them a little, you won.`
            : `The user just beat you in chess. You're upset and can't believe it.`,
          message.author.id
        );
        await message.reply(lines.join('\n'));
        await sendReply(message, replyText, gifUrl);
        if (gif) return message.channel.send(gif);
        return;
      } else if (result.gameOver === 'resignation') {
        const gif = getRandomGif('karelia_wins');
        const { replyText, gifUrl } = await generateReply(
          `The user just resigned from our chess game. Taunt them a little, you won.`,
          message.author.id
        );
        await message.reply(lines.join('\n'));
        await sendReply(message, replyText, gifUrl);
        if (gif) return message.channel.send(gif);
        return;
      } else if (result.gameOver === 'draw' || result.gameOver === 'stalemate') {
        const gif = getRandomGif('karelia_draw');
        const { replyText, gifUrl } = await generateReply(
          `You and the user drew in chess. Neither of you lost at least.`,
          message.author.id
        );
        await message.reply(lines.join('\n'));
        await sendReply(message, replyText, gifUrl);
        if (gif) return message.channel.send(gif);
        return;
      }
    }

    if (result.fen) {
      const fenPieces = result.fen.split(' ')[0];
      const lastMove = (result.aiMove || result.userMove || '').slice(0,4);
      const imageUrl = `https://chessboardimage.com/${fenPieces}${lastMove ? `-${lastMove}` : ''}.png`;
      lines.push(imageUrl);
    }

    return message.reply(lines.join('\n'));
  });
}

module.exports = {
  name: 'chessmove',
  description: 'Makes a chess move using UCI, SAN, or piece format, for example `e2e4`, `Nf3`, or `knight f3`.',
  execute: handleChessMove,
};
