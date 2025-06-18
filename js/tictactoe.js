const socket = io("https://mini-games-backend.onrender.com");

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

let currentPlayer = null;
let board = Array(9).fill(null);
let isMyTurn = false;

// DOM Elements
const statusText = document.getElementById("status");
const cells = document.querySelectorAll(".cell");

// Join room
socket.emit("joinRoom", { game: "tictactoe", roomId });

socket.on("startGame", (symbol) => {
  currentPlayer = symbol;
  isMyTurn = symbol === "X";
  statusText.textContent = isMyTurn ? "Your turn (You are X)" : "Waiting for opponent...";
});

socket.on("updateBoard", ({ board: newBoard, nextTurn }) => {
  board = newBoard;
  updateUI();
  isMyTurn = nextTurn === currentPlayer;
  statusText.textContent = isMyTurn ? "Your turn" : "Opponent's turn";
});

socket.on("gameOver", ({ winner }) => {
  if (winner === currentPlayer) {
    statusText.textContent = "You win!";
  } else if (winner === "draw") {
    statusText.textContent = "It's a draw!";
  } else {
    statusText.textContent = "You lose!";
  }
  isMyTurn = false;
});

socket.on("opponentDisconnected", () => {
  statusText.textContent = "Opponent disconnected.";
  isMyTurn = false;
});

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!isMyTurn || board[index]) return;
    socket.emit("makeMove", { roomId, index });
  });
});

function updateUI() {
  board.forEach((value, index) => {
    cells[index].textContent = value || "";
  });
}
