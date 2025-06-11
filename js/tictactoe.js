const socket = io("https://mini-games-backend.onrender.com"); // Update with your backend URL

const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomInput = document.getElementById('roomInput');
const roomInfo = document.getElementById('roomInfo');
const turnMessage = document.getElementById('turnMessage');

let roomId = null;
let playerSymbol = null; // 'X' or 'O'
let myTurn = false;

// Clear board UI
function clearBoard() {
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('disabled');
  });
}

// Disable all cells
function disableBoard() {
  cells.forEach(cell => cell.classList.add('disabled'));
}

// Update board UI with current state
function updateBoard(boardState) {
  boardState.forEach((cellVal, idx) => {
    cells[idx].textContent = cellVal || '';
    if (cellVal) cells[idx].classList.add('disabled');
    else cells[idx].classList.remove('disabled');
  });
}

function setTurnMessage(message) {
  turnMessage.textContent = message;
}

createRoomBtn.addEventListener('click', () => {
  socket.emit('tictactoe-create-room');
});

joinRoomBtn.addEventListener('click', () => {
  const input = roomInput.value.trim();
  if (input) {
    socket.emit('tictactoe-join-room', { roomId: input });
  }
});

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (!myTurn || cell.textContent !== '') return;
    const index = cell.getAttribute('data-index');
    socket.emit('tictactoe-make-move', { roomId, index: parseInt(index) });
  });
});

socket.on('tictactoe-room-created', (data) => {
  roomId = data.roomId;
  playerSymbol = 'X'; // Creator always 'X'
  roomInfo.textContent = `Room created: ${roomId} (You are 'X')`;
  clearBoard();
  setTurnMessage("Your turn!");
  myTurn = true;
});

socket.on('tictactoe-room-joined', (data) => {
  roomId = data.roomId;
  playerSymbol = 'O'; // Joiner is 'O'
  roomInfo.textContent = `Joined room: ${roomId} (You are 'O')`;
  clearBoard();
  setTurnMessage("Opponent's turn...");
  myTurn = false;
});

socket.on('tictactoe-update', (data) => {
  updateBoard(data.board);
  if (data.currentPlayer === socket.id) {
    setTurnMessage("Your turn!");
    myTurn = true;
  } else {
    setTurnMessage("Opponent's turn...");
    myTurn = false;
  }
});

socket.on('tictactoe-game-over', (data) => {
  updateBoard(data.board);
  if (data.winner === playerSymbol) {
    setTurnMessage("You win! 🎉");
  } else if (data.winner === null) {
    setTurnMessage("It's a tie!");
  } else {
    setTurnMessage("You lose!");
  }
  disableBoard();
});

socket.on('tictactoe-error', (msg) => {
  alert(msg);
});
