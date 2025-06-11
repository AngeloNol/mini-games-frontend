// Connect 4 frontend logic with room, player count, and falling disc animation

const socket = io("https://mini-games-backend.onrender.com"); // change URL accordingly

const ROWS = 6;
const COLS = 7;

let roomId = null;
let playerCount = 2;
let board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
let players = [];
let currentPlayerIndex = 0;

const gameDiv = document.getElementById('game');
const turnMessage = document.getElementById('turnMessage');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomInput = document.getElementById('roomInput');
const playerCountSelect = document.getElementById('playerCount');

createRoomBtn.onclick = () => {
  playerCount = parseInt(playerCountSelect.value);
  socket.emit('connect4-create-room', { playerCount });
};

joinRoomBtn.onclick = () => {
  const inputRoom = roomInput.value.trim();
  if (inputRoom) {
    socket.emit('connect4-join-room', { roomId: inputRoom });
  }
};

socket.on('connect4-room-created', (data) => {
  roomId = data.roomId;
  alert(`Room created! Share this ID to join: ${roomId}`);
  resetGame();
});

socket.on('connect4-room-joined', (data) => {
  roomId = data.roomId;
  resetGame();
  alert(`Joined room: ${roomId}`);
});

socket.on('connect4-error', (msg) => {
  alert(`Error: ${msg}`);
});

// Animate disc dropping into the row and column
function animateDiscDrop(row, col, color) {
  const boardEl = document.querySelector('.connect4-board');
  if (!boardEl) return;
  const rowEl = boardEl.children[row];
  const cellEl = rowEl.children[col];

  const disc = document.createElement('div');
  disc.className = 'disc falling-disc';
  disc.style.backgroundColor = color;
  disc.style.top = '-50px';

  cellEl.appendChild(disc);

  requestAnimationFrame(() => {
    disc.style.top = '0px';
  });

  disc.addEventListener('transitionend', () => {
    disc.classList.remove('falling-disc');
    disc.style.top = '';
  });
}

function playMove(col) {
  if (!roomId) {
    alert("Join or create a room first!");
    return;
  }
  socket.emit('connect4-move', { roomId, col });
}

function renderBoard() {
  gameDiv.innerHTML = '';

  const boardEl = document.createElement('div');
  boardEl.className = 'connect4-board';

  for (let r = 0; r < ROWS; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'connect4-row';

    for (let c = 0; c < COLS; c++) {
      const cellEl = document.createElement('div');
      cellEl.className = 'connect4-cell';

      if (board[r][c] !== null) {
        const disc = document.createElement('div');
        disc.className = 'disc';
        disc.style.backgroundColor = board[r][c];
        cellEl.appendChild(disc);
      }

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

socket.on('connect4-update', (data) => {
  if (board.length > 0) {
    outer:
    for (let r = ROWS - 1; r >= 0; r--) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] !== data.board[r][c]) {
          animateDiscDrop(r, c, data.board[r][c]);
          break outer;
        }
      }
    }
  }

  board = data.board;
  players = data.players;
  currentPlayerIndex = data.currentPlayerIndex;

  renderBoard();

  if (players[currentPlayerIndex] === socket.id) {
    turnMessage.textContent = "It's your turn!";
  } else {
    turnMessage.textContent = "Waiting for opponent...";
  }
});

socket.on('connect4-game-over', (data) => {
  alert(data.message);
  turnMessage.textContent = "Game Over";
});

function resetGame() {
  board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  players = [];
  currentPlayerIndex = 0;
  renderBoard();
  turnMessage.textContent = '';
}
