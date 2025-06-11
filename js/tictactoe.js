// Connect 4 frontend logic

const gameContainer = document.getElementById('game');
const ROWS = 6;
const COLS = 7;
let roomId = null;
let board = [];
let currentPlayer = null;

// Render Connect 4 board with discs and falling animation
function renderBoard() {
  gameContainer.innerHTML = '';

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${COLS}, 60px)`;
  grid.style.gridGap = '5px';
  grid.style.justifyContent = 'center';

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.style.width = '60px';
      cell.style.height = '60px';
      cell.style.border = '2px solid blue';
      cell.style.borderRadius = '50%';
      cell.style.backgroundColor = '#eee';
      cell.style.position = 'relative';
      cell.style.cursor = 'pointer';

      // Add disc if present
      if (board[r] && board[r][c]) {
        const disc = document.createElement('div');
        disc.style.width = '50px';
        disc.style.height = '50px';
        disc.style.borderRadius = '50%';
        disc.style.position = 'absolute';
        disc.style.top = '5px';
        disc.style.left = '5px';
        disc.style.transition = 'top 0.5s ease-out';

        if (board[r][c] === 'player1') {
          disc.style.backgroundColor = 'red';
        } else if (board[r][c] === 'player2') {
          disc.style.backgroundColor = 'yellow';
        } else if (board[r][c] === 'player3') {
          disc.style.backgroundColor = 'green';
        } else if (board[r][c] === 'player4') {
          disc.style.backgroundColor = 'purple';
        }
        cell.appendChild(disc);
      }

      // On top row only, clicking triggers a move in that column
      if (r === 0) {
        cell.addEventListener('click', () => {
          socket.emit('connect4-move', { roomId, column: c });
        });
      }

      grid.appendChild(cell);
    }
  }

  gameContainer.appendChild(grid);
}

function getRoomId() {
  const urlParams = new URLSearchParams(window.location.search);
  let room = urlParams.get('room');
  if (!room) {
    room = prompt("Enter room ID for Connect 4:");
  }
  return room;
}

function setupSocketListeners() {
  socket.on('connect4-update', ({ board: newBoard, currentPlayer: nextPlayer }) => {
    board = newBoard;
    currentPlayer = nextPlayer;
    renderBoard();
  });
}

function init() {
  roomId = getRoomId();
  if (!roomId) {
    gameContainer.textContent = 'Room ID is required to play.';
    return;
  }
  socket.emit('connect4-join', { roomId });
  setupSocketListeners();
}

init();
