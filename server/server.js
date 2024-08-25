const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app's origin
    methods: ["GET", "POST"]
  }
});

let gameState = {
    grid: [
        ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
      ],
  currentPlayer: 'A',
  winner: null
};

const characterMoves = {
  'P': { 'L': [-1, 0], 'R': [1, 0], 'F': [0, -1], 'B': [0, 1] },
  'H1': { 'L': [-2, 0], 'R': [2, 0], 'F': [0, -2], 'B': [0, 2] },
  'H2': { 'FL': [-2, -2], 'FR': [2, -2], 'BL': [-2, 2], 'BR': [2, 2] }
};

function initializeGame(playerASetup, playerBSetup) {
  gameState.grid[0] = playerASetup.map((char, i) => `A-${char}`);
  gameState.grid[4] = playerBSetup.map((char, i) => `B-${char}`);
  gameState.currentPlayer = 'A';
  gameState.winner = null;
  io.emit('game_state', gameState);
}

function getPosition(character) {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (gameState.grid[i][j] === character) {
        return [i, j];
      }
    }
  }
  return null;
}

function isOutOfBounds(row, col) {
  return row < 0 || row >= 5 || col < 0 || col >= 5;
}

function makeMove(player, selected, move) {
  const position = getPosition(`${player}-${selected}`);
  if (!position) return false;

  const [row, col] = position;
  const moveDelta = characterMoves[selected[0]][move];
  const newRow = row + moveDelta[1];
  const newCol = col + moveDelta[0];

  if (isOutOfBounds(newRow, newCol)) return false;

  const targetCell = gameState.grid[newRow][newCol];
  if (targetCell.startsWith(player)) return false;

  if (selected.startsWith('H1') || selected.startsWith('H2')) {
    const path = [];
    for (let i = 1; i <= Math.abs(moveDelta[0]); i++) {
      path.push([row + (i * Math.sign(moveDelta[1])), col + (i * Math.sign(moveDelta[0]))]);
    }
    for (const [pathRow, pathCol] of path) {
      if (gameState.grid[pathRow][pathCol].startsWith(player === 'A' ? 'B' : 'A')) {
        gameState.grid[pathRow][pathCol] = '';
      }
    }
  }

  gameState.grid[newRow][newCol] = `${player}-${selected}`;
  gameState.grid[row][col] = '';
  gameState.currentPlayer = player === 'A' ? 'B' : 'A';

  checkForWinner();
  return true;
}

function checkForWinner() {
  const aPieces = gameState.grid.flat().filter(cell => cell.startsWith('A')).length;
  const bPieces = gameState.grid.flat().filter(cell => cell.startsWith('B')).length;

  if (aPieces === 0) {
    gameState.winner = 'B';
  } else if (bPieces === 0) {
    gameState.winner = 'A';
  }
}

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('game_state', gameState);

  socket.on('initialize_game', (playerASetup, playerBSetup) => {
    initializeGame(playerASetup, playerBSetup);
  });

  socket.on('make_move', (data) => {
    const { player, selected, move } = data;
    if (player !== gameState.currentPlayer || gameState.winner) {
      return;
    }

    const validMove = makeMove(player, selected, move);
    if (validMove) {
      io.emit('game_state', gameState);
    } else {
      socket.emit('invalid_move');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running at :3000 :D');
});
