// Get roomId from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

const gameBoard = document.getElementById("gameBoard");
const gameStatus = document.getElementById("gameStatus");

let board = Array(9).fill(null);
let currentPlayer = null;
let mySymbol = null;
let isMyTurn = false;

// Generate game board UI
function renderBoard() {
  gameBoard.innerHTML = "";
  board.forEach((cell, index) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.textContent = cell || "";
    div.addEventListener("click", () => makeMove(index));
    gameBoard.appendChild(div);
  });
}

// Make move
function makeMove(index) {
  if (!isMyTurn || board[index]) return;

  board[index] = mySymbol;
  renderBoard();
  socket.emit("tictactoeMove", { roomId, index });
  isMyTurn = false;
  updateStatus("Waiting for opponent...");
}

// Update game status message
function updateStatus(message) {
  gameStatus.textContent = message;
}

// Socket events
socket.emit("joinRoom", { game: "tictactoe", roomId });

socket.on("tictactoeStart", ({ symbol, firstTurn }) => {
  mySymbol = symbol;
  isMyTurn = symbol === firstTurn;
  updateStatus(isMyTurn ? "Your turn!" : "Opponent's turn...");
  renderBoard();
});

socket.on("tictactoeMove", ({ index, symbol }) => {
  board[index] = symbol;
  renderBoard();
  if (checkWin(symbol)) {
    updateStatus(symbol === mySymbol ? "You win!" : "You lose!");
    isMyTurn = false;
  } else if (board.every(cell => cell)) {
    updateStatus("It's a draw!");
  } else {
    isMyTurn = true;
    updateStatus("Your turn!");
  }
});

socket.on("errorMsg", ({ message }) => {
  alert(message);
});
