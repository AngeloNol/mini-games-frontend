const socket = io("https://mini-games-backend.onrender.com");
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

let symbol = null;
let myTurn = false;

const cells = document.querySelectorAll(".cell");
const statusDiv = document.getElementById("status");
const board = Array(9).fill(null);

socket.emit("joinRoom", { game: "tictactoe", roomId });

socket.on("startGame", (data) => {
  symbol = data.symbol;
  myTurn = symbol === "X";
  updateStatus(`Game started! You are ${symbol}. ${myTurn ? "Your turn." : "Waiting for opponent..."}`);
});

socket.on("moveMade", ({ index, symbol: moveSymbol, board: newBoard }) => {
  board[index] = moveSymbol;
  cells[index].textContent = moveSymbol;
  myTurn = (symbol !== moveSymbol); // It's my turn if opponent just moved
  updateStatus(myTurn ? "Your turn." : "Opponent's turn.");
});

socket.on("gameOver", ({ winner }) => {
  if (winner) {
    updateStatus(winner === symbol ? "You win!" : "You lose.");
  } else {
    updateStatus("It's a draw!");
  }
  disableBoard();
});

socket.on("opponentDisconnected", () => {
  updateStatus("Opponent disconnected.");
  disableBoard();
});

function handleClick(e) {
  const index = parseInt(e.target.dataset.index);
  if (!myTurn || board[index]) return;

  socket.emit("makeMove", { index });
}

cells.forEach((cell) => {
  cell.addEventListener("click", handleClick);
});

function updateStatus(message) {
  statusDiv.textContent = message;
}

function disableBoard() {
  cells.forEach((cell) => {
    cell.removeEventListener("click", handleClick);
  });
}
