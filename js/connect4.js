// connect4.js

// Initialize socket connection (from socket-init.js)
const socket = io("https://mini-games-backend.onrender.com");

const roomInput = document.getElementById('roomIdInput');
const playerCountSelect = document.getElementById('playerCountSelect');
const joinBtn = document.getElementById('joinBtn');
const gameDiv = document.getElementById('game');
const setupDiv = document.getElementById('setup');

let roomId = null;
let playerCount = 2;  // default to 2 players

// Game state
let board = [];
const ROWS = 6;
const COLS = 7;
let currentPlayerIndex = 0;
let players = [];  // Array of player socket IDs or colors

// Create empty board
function initBoard() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(null);
    }
    board.push(row);
  }
}

// Render the Connect 4 board with discs
function renderBoard() {
  gameDiv.innerHTML = ''; // Clear previous

  const boardEl = document.createElement('div');
  boardEl.className = 'connect4-board';

  for (let r = 0; r < ROWS; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'connect4-row';
    for (let c = 0; c < COLS; c++) {
      const cellEl = document.createElement('div');
      cellEl.className = 'connect4-cell';
      if (board[r][c] !== null) {
        cellEl.style.backgroundColor = board[r][c];
      }
      // Add click listener only if it's current player's turn
      cellEl.addEventListener('click', () => {
        if (players[currentPlayerIndex] === socket.id) {
          playMove(c);
        }
      });
      rowEl.appendChild(cellEl);
    }
    boardEl.appendChild(rowEl);
  }

  gameDiv.appendChild(boardEl);
}

// Send move to backend
function playMove(col) {
  socket.emit('connect4-move', { roomId, col });
}

// Handle join button click
joinBtn.addEventListener('click', () => {
  roomId = roomInput.value.trim();
  playerCount = parseInt(playerCountSelect.value);
  if (!roomId) {
    alert('Please enter a room ID');
    return;
  }
  // Emit joinRoom with playerCount for room creation
  socket.emit('joinRoom', { roomId, game: 'connect4', playerCount });
  setupDiv.style.display = 'none';
  gameDiv.style.display = 'block';
  initBoard();
  renderBoard();
});

// Listen for updates from server
socket.on('connect4-update', (data) => {
  board = data.board;
  currentPlayerIndex = data.currentPlayerIndex;
  players = data.players;

  renderBoard();

  if (players[currentPlayerIndex] === socket.id) {
    alert("It's your turn!");
  }
});

socket.on('connect4-game-over', (data) => {
  alert(`Game over! Winner: ${data.winner ? data.winner : 'No one (Draw)'}`);
  setupDiv.style.display = 'block';
  gameDiv.style.display = 'none';
});

socket.on('error', (message) => {
  alert('Error: ' + message);
});
