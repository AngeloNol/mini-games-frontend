// Connect to Socket.io server
const socket = io("https://mini-games-backend.onrender.com");

// UI elements
const statusText = document.getElementById("status");
const boardCells = Array.from(document.querySelectorAll(".cell"));
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");

let roomId = null;
let mySymbol = null;
let myTurn = false;

// Join room button
joinBtn.addEventListener("click", () => {
  roomId = roomInput.value.trim();
  if (!roomId) {
    alert("Please enter a room ID");
    return;
  }
  socket.emit("joinRoom", { roomId });
  statusText.textContent = `Joined room: ${roomId}. Waiting for opponent...`;
});

// Listen for waiting message
socket.on("waitingForOpponent", () => {
  statusText.textContent = "Waiting for opponent to join...";
});

// When game starts
socket.on("startGame", ({ board, turn, symbols }) => {
  mySymbol = symbols[socket.id];
  myTurn = (turn === socket.id);
  updateBoard(board);
  updateStatus();
});

// Update board UI
socket.on("updateBoard", ({ board, turn }) => {
  updateBoard(board);
  myTurn = (turn === socket.id);
  updateStatus();
});

// Game over event
socket.on("gameOver", ({ winner, board }) => {
  updateBoard(board);
  if (winner === null) {
    statusText.textContent = "Game Over! It's a draw.";
  } else if (winner === socket.id) {
    statusText.textContent = "Game Over! You win! 🎉";
  } else {
    statusText.textContent = "Game Over! You lose.";
  }
  myTurn = false;
});

// Room full
socket.on("roomFull", () => {
  alert("Room is full. Please try another room.");
});

// Handle clicking on cells
boardCells.forEach((cell, idx) => {
  cell.addEventListener("click", () => {
    if (!myTurn) return;
    if (cell.textContent !== "") return;
    if (!roomId) return;

    socket.emit("makeMove", { roomId, index: idx });
  });
});

// Helper to update board UI
function updateBoard(board) {
  board.forEach((symbol, idx) => {
    boardCells[idx].textContent = symbol || "";
  });
}

// Helper to update status text
function updateStatus() {
  if (myTurn) {
    statusText.textContent = `Your turn (${mySymbol})`;
  } else {
    statusText.textContent = `Opponent's turn (${mySymbol === "X" ? "O" : "X"})`;
  }
}
