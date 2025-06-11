const socket = io("https://your-backend-url.onrender.com");

let roomId = null;
let playerNumber = null;
let currentPlayerIndex = null;
let board = [];
let gameOver = false;
let winner = null;

const gameDiv = document.getElementById("game");

// Show UI to create or join room on page load
function createInitialUI() {
  gameDiv.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Tic Tac Toe - Multiplayer";
  gameDiv.appendChild(title);

  // Create room button
  const createBtn = document.createElement("button");
  createBtn.textContent = "Create New Room";
  createBtn.onclick = () => {
    roomId = generateRoomId();
    alert(`Room created! Share this ID: ${roomId}`);
    joinRoom(roomId);
  };
  gameDiv.appendChild(createBtn);

  // Join room input and button
  const joinDiv = document.createElement("div");
  joinDiv.style.marginTop = "10px";

  const input = document.createElement("input");
  input.placeholder = "Enter Room ID to Join";
  input.style.marginRight = "10px";
  joinDiv.appendChild(input);

  const joinBtn = document.createElement("button");
  joinBtn.textContent = "Join Room";
  joinBtn.onclick = () => {
    const id = input.value.trim();
    if (!id) {
      alert("Please enter a Room ID");
      return;
    }
    joinRoom(id);
  };
  joinDiv.appendChild(joinBtn);

  gameDiv.appendChild(joinDiv);
}

function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function joinRoom(id) {
  roomId = id;
  socket.emit("joinRoom", { game: "tictactoe", roomId });
  createBoard();
}

// Build the 3x3 game board UI
function createBoard() {
  gameDiv.innerHTML = "";

  const boardEl = document.createElement("div");
  boardEl.id = "board";
  boardEl.style.display = "grid";
  boardEl.style.gridTemplateColumns = "repeat(3, 100px)";
  boardEl.style.gridGap = "5px";
  boardEl.style.margin = "auto";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.style.width = "100px";
    cell.style.height = "100px";
    cell.style.border = "2px solid #333";
    cell.style.display = "flex";
    cell.style.justifyContent = "center";
    cell.style.alignItems = "center";
    cell.style.fontSize = "3em";
    cell.style.cursor = "pointer";

    cell.addEventListener("click", () => {
      if (!gameOver && currentPlayerIndex === playerNumber && !board[i]) {
        socket.emit("tictactoeMove", { roomId, index: i });
      }
    });

    boardEl.appendChild(cell);
  }

  gameDiv.appendChild(boardEl);

  const info = document.createElement("div");
  info.id = "info";
  info.style.marginTop = "15px";
  gameDiv.appendChild(info);

  updateBoardUI();
}

function updateBoardUI() {
  const boardEl = document.getElementById("board");
  if (!boardEl) return;

  for (let i = 0; i < 9; i++) {
    const cell = boardEl.querySelector(`[data-index="${i}"]`);
    cell.textContent = board[i] === 0 ? "X" : board[i] === 1 ? "O" : "";
  }

  const info = document.getElementById("info");
  if (gameOver) {
    if (winner === null) info.textContent = "It's a tie!";
    else if (winner === playerNumber) info.textContent = "You won! 🎉";
    else info.textContent = `Player ${winner + 1} won.`;
  } else {
    info.textContent = currentPlayerIndex === playerNumber ? "Your turn" : `Waiting for Player ${currentPlayerIndex + 1}`;
  }
}

// Socket event handlers

socket.on("tictactoeInit", data => {
  playerNumber = data.playerNumber;
  currentPlayerIndex = data.currentPlayerIndex;
  board = data.board;
  gameOver = data.gameOver;
  winner = data.winner;
  createBoard();
});

socket.on("tictactoeUpdate", data => {
  currentPlayerIndex = data.currentPlayerIndex;
  board = data.board;
  gameOver = data.gameOver;
  winner = data.winner;
  updateBoardUI();
});

socket.on("tictactoeError", data => {
  alert(`Error: ${data.message}`);
});

window.onload = createInitialUI;
