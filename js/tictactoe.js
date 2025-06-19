const socket = io("https://mini-games-backend.onrender.com"); // Replace with your Render backend URL

const boardDiv = document.getElementById("board");
const turnDisplay = document.getElementById("turnDisplay");
const roomDisplay = document.getElementById("roomDisplay");

let myTurn = false;
let mySymbol = null;
let currentRoomId = null;

function createRoom() {
  socket.emit("createRoom", { game: "tictactoe" });
}

function joinRoom() {
  const roomId = document.getElementById("roomIdInput").value.trim();
  if (roomId) {
    socket.emit("joinRoom", { roomId });
  }
}

socket.on("roomCreated", ({ roomId }) => {
  roomDisplay.textContent = `Room ID: ${roomId}`;
});

socket.on("startGame", ({ symbol, turn, roomId }) => {
  mySymbol = symbol;
  myTurn = turn;
  currentRoomId = roomId;
  initBoard();
  updateTurnDisplay();
});

socket.on("updateBoard", ({ board, turn }) => {
  updateBoard(board);
  myTurn = turn;
  updateTurnDisplay();
});

socket.on("opponentDisconnected", () => {
  alert("Opponent disconnected");
  location.reload();
});

function initBoard() {
  boardDiv.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    boardDiv.appendChild(cell);
  }
}

function handleClick(e) {
  if (!myTurn) return;
  const index = e.target.dataset.index;
  if (!e.target.textContent) {
    socket.emit("makeMove", { roomId: currentRoomId, index });
  }
}

function updateBoard(board) {
  const cells = boardDiv.querySelectorAll(".cell");
  board.forEach((val, i) => {
    cells[i].textContent = val;
  });
}

function updateTurnDisplay() {
  turnDisplay.textContent = myTurn ? "Your Turn" : "Opponent's Turn";
}
