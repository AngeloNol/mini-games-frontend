const gameContainer = document.getElementById('game');
const ROWS = 6;
const COLS = 7;
let roomId = null;
let board = [];
let currentPlayer = null;
let gameOver = false;

function renderBoard() {
  gameContainer.innerHTML = '';

  const status = document.createElement('div');
  status.style.marginBottom = '1em';
  if (gameOver) {
    status.textContent = `Game Over! ${currentPlayer ? 'Winner: ' + currentPlayer : 'It\'s a draw!'}`;
  } else {
    status.textContent = `Current Turn: ${currentPlayer}`;
  }
  gameContainer.appendChild(status);

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
      cell.style.cursor = (!gameOver && r === 0) ? 'pointer' : 'default';

      if (board[r] && board[r][c]) {
        const disc = document.createElement('div');
        disc.style.width = '50px';
        disc.style.height = '50px';
        disc.style.borderRadius = '50%';
        disc.style.position = 'absolute';
        disc.style.top = '5px';
        disc.style.left = '5px';
        disc.style.transition = 'top 0.5s ease-out';

        if (board[r][c] === 'player1') disc.style.backgroundColor = 'red';
        else if (board[r][c] === 'player2') disc.style.backgroundColor = 'yellow';
        else if (board[r][c] === 'player3') disc.style.backgroundColor = 'green';
        else if (board[r][c] === 'player4') disc.style.backgroundColor = 'purple';

        cell.appendChild(disc);
      }

      if (!gameOver && r === 0) {
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
  socket.on('connect4-update', ({ board: newBoard, currentPlayer: nextPlayer, winner }) => {
    board = newBoard;
    currentPlayer = nextPlayer;
    gameOver = !!winner || board.flat().every(cell => !cell);
    renderBoard();

    if (winner) {
      alert(`Player ${winner} wins!`);
    } else if (gameOver) {
      alert("It's a draw!");
    }
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
