import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const Grid = () => {
  const [gameState, setGameState] = useState({
    grid: [
        ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
      ],
    currentPlayer: 'A',
    winner: null
  });

  const [selected, setSelected] = useState('A-P1');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000');

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    socketInstance.on('game_state', (newGameState) => {
      console.log('Game state updated:', newGameState);
      setGameState(newGameState);
    });

    socketInstance.on('invalid_move', () => {
      console.warn('Invalid move attempted');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  const handleDirectionClick = (direction) => {
    if (socket) {
      socket.emit('make_move', {
        player: gameState.currentPlayer,
        selected,
        direction
      });
    } else {
      console.warn('Socket is not connected');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">
        Current Player: {gameState.currentPlayer}
      </h1>
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
            onClick={() => handleDirectionClick("L")}
          >
            L
          </button>
          <button
            className="px-4 py-2 bg-gray-700 rounded"
            onClick={() => handleDirectionClick("R")}
          >
            R
          </button>
          <button
            className="px-4 py-2 bg-gray-700 rounded"
            onClick={() => handleDirectionClick("F")}
          >
            F
          </button>
          <button
            className="px-4 py-2 bg-gray-700 rounded"
            onClick={() => handleDirectionClick("B")}
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
