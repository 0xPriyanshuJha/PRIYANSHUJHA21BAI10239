import React, { useState, useEffect } from 'react';

const Grid = () => {
  const [gameState, setGameState] = useState({
    grid: [
      ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3'],
    ],
    currentPlayer: 'A',
    winner: null,
  });

  const [selected, setSelected] = useState('A-P2');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');

    websocket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'game_state') {
        setGameState(message.gameState);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const handleDirectionClick = (direction) => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'make_move',
        player: gameState.currentPlayer,
        direction,
        selected,
      }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">Current Player: {gameState.currentPlayer}</h1>
      <div className="grid grid-cols-5 gap-2">
        {gameState.grid.flat().map((item, index) => (
          <div
            key={index}
            className={`w-20 h-20 flex items-center justify-center border ${
              selected === item ? 'bg-blue-500' : 'bg-gray-800'
            }`}
            onClick={() => setSelected(item)}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h2 className="mb-2">Selected: {selected}</h2>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-gray-700 rounded"
            onClick={() => handleDirectionClick('L')}
          >
            L
          </button>
          <button
            className="px-4 py-2 bg-gray-700 rounded"
            onClick={() => handleDirectionClick('R')}
          >
            R
          </button>
          <button
            className="px-4 py-2 bg-gray-700 rounded"
            onClick={() => handleDirectionClick('F')}
          >
            F
          </button>
          <button
            className="px-4 py-2 bg-gray-700 rounded"
            onClick={() => handleDirectionClick('B')}
          >
            B
          </button>
        </div>
      </div>
      {gameState.winner && (
        <div className="mt-4">
          <h2 className="text-2xl">Winner: {gameState.winner}</h2>
        </div>
      )}
    </div>
  );
};

export default Grid;
