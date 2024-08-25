const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let gameState = {
    grid: [
        ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3'],
    ],
    currentPlayer: 'A',
    winner: null
};

server.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'game_state', gameState }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'make_move') {
            handleMove(data.player, data.direction, data.selected);
            server.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'game_state', gameState }));
                }
            });
        }
    });
});

function handleMove(player, direction, selected) {
    const indexMapping = {
        'A-P1': [0, 0],
        'A-P2': [0, 1],
        'A-H1': [0, 2],
        'A-H2': [0, 3],
        'A-P3': [0, 4],
        'B-P1': [4, 0],
        'B-P2': [4, 1],
        'B-H1': [4, 2],
        'B-H2': [4, 3],
        'B-P3': [4, 4],
    };

    let [row, col] = indexMapping[selected];
    let newRow = row;
    let newCol = col;

    if (player !== gameState.currentPlayer) {
        return;
    }

    switch (direction) {
        case 'L':
            newCol = col > 0 ? col - 1 : col;
            break;
        case 'R':
            newCol = col < 4 ? col + 1 : col;
            break;
        case 'F':
            newRow = row > 0 ? row - 1 : row;
            break;
        case 'B':
            newRow = row < 4 ? row + 1 : row;
            break;
        default:
            return;
    }

    if (gameState.grid[newRow][newCol] === '') {
        gameState.grid[row][col] = '';
        gameState.grid[newRow][newCol] = selected;
        gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';

        const aPieces = gameState.grid.flat().filter(item => item.startsWith('A-')).length;
        const bPieces = gameState.grid.flat().filter(item => item.startsWith('B-')).length;

        if (aPieces === 0) {
            gameState.winner = 'B';
        } else if (bPieces === 0) {
            gameState.winner = 'A';
        }
    }
}

console.log('WebSocket successfully running on localhost:8080 :)');
