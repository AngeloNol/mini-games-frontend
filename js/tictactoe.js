// js/tictactoe.js

const socket = io("https://mini-games-backend.onrender.com"); // Replace with your backend URL

const board = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const turnMessage = document.getElementById("turnMessage");
const roomInfo = document.getElementById("roomInfo");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomInput = document.getElementById("roomInput");

let roomId = null;
let playerSymbol = null; // "X" or "O"
let myTurn = false;
let gameActive = false;

// Create room handler
createRoomBtn.addEventListener("click", () => {
  socket.emit("createRoom", { game: "tictactoe" });
});

// Join room handler
joinRoomBtn.addEventListener("click", () => {
  const id = roomInput.value.trim();
  if (!id) {
    alert("Please enter a valid room ID");
    return;
  }
  socket.emit("joinRoom", { game: "tictactoe", roomId: id });
});

// When room is created
socket.on("roomCreated", ({ game, roomId: id }) => {
  if (game !== "tictactoe") return;
  roomId = id;
  roomInfo.textContent = `Room ID: ${roomId}`;
  turnMessage.textContent = "Waiting for opponent to join...";
  resetBoard();
});

// When successfully joined a room
socket.on("roomJoined", ({ game, roomId: id, symbol }) => {
  if (game !== "tictactoe") return;
  roomId = id;
  playerSymbol = symbol; // assigned by server: "X" or "O"
  roomInfo.textContent = `Room ID: ${roomId} | You are "${playerSymbol}"`;
  turnMessage.textContent = playerSymbol === "X" ? "Your turn" : "Opponent's turn";
  gameActive = true;
  myTurn = playerSymbol === "X";
  resetBoard();
});

// When opponent makes a move
socket.on("moveMade", ({ game, index, symbol }) => {
  if (game !== "tictactoe" || !gameActive) return;
  cells[index].textContent = symbol;
  cells[index].classList.add("disabled");

  if (symbol !== playerSymbol) {
    myTurn = true;
    turnMessage.textContent = "Your turn";
  } else {
    myTurn = false;
    turnMessage.textContent = "Opponent's turn";
  }
});

// When game ends (win or draw)
socket.on("gameOver", ({ game, winner }) => {
  if (game !== "tictactoe") return;
  gameActive = false;
  if (winner === playerSymbol) {
    turnMessage.textContent = "You win! 🎉";
  } else if (winner === null) {
    turnMessage.textContent = "Draw game!";
  } else {
    turnMessage.textContent = "You lose!";
  }
});

// Cell click handler
cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!gameActive) return;
    if (!myTurn) return;
    if (cell.textContent !== "") return;

    const index = parseInt(cell.getAttribute("data-index"));
    socket.emit("makeMove", { game: "tictactoe", roomId, index });
  });
});

function resetBoard() {
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("disabled");
  });
}
