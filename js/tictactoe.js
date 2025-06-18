const socket = io("https://mini-games-backend.onrender.com");

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

let currentPlayer = null;
let board = Array(9).fill(null);
let isMyTurn = false;

// DOM Elements
const statusText = document.getElementById("status");
const cells = document.querySelectorAll(".cell");

// Emit joinRoom event
socket.emit("joinRoom", { game: "tictactoe", roomId });

// Handle game start
socket.on("startGame", ({ symbol, turn }) => {
  currentPlayer = symbol;
  isMyTurn = turn;
  statusText.textContent = isMyTurn
    ? `Your turn (You are ${currentPlayer})`
    : `Opponent's turn (You are ${currentPlayer})`;
});

// Handle board updates
socket.on("updateBoard", ({ board: newBoard, nextTurn }) => {
  board = newBoard;
  updateBoardUI();
  isMyTurn = (nextTurn === (currentPlayer === "X" ? 0 : 1));
  statusText.textContent = isMyTurn ? "Your turn" : "Opponent's turn";
});

// Handle opponent disconnect
socket.on("opponentDisconnected", () => {
  statusText.textContent = "Opponent disconnected.";
  isMyTurn = false;
});

// Handle waiting message
socket.on("waitingForOpponent", () => {
  statusText.textContent = "Waiting for opponent...";
});

// Handle move clicks
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!isMyTurn || board[index]) return;
    socket.emit("makeMove", { roomId, index });
  });
});

// Update the UI
function updateBoardUI() {
  board.forEach((val, i) => {
    cells[i].textContent = val || "";
  });
}