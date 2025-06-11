const socket = io("https://your-backend-url.onrender.com");

let roomId = null;
let playerNumber = null;
let board = [];
let currentPlayerIndex = null;
let gameOver = false;

const gameDiv = document.getElementById("game");

// Initial UI to create/join room
function createInitialUI() {
  gameDiv.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Connect 4 - Multiplayer";
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

  // Join room input/button
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
  socket.emit("joinRoom", { game: "connect4", roomId });
  createBoard();
}

// Create Connect 4 board UI
function createBoard() {
  gameDiv.innerHTML = "";

  const boardEl = document.createElement("div");
  boardEl.id = "connect4-board";
  boardEl.style.display = "grid";
  boardEl.style.gridTemplateColumns = "repeat(7, 60px)";
  boardEl.style.gridGap = "5px";
  boardEl.style.margin = "auto";

  // 6 rows x 7 cols
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.style.width = "60px";
      cell.style.height = "60px";
      cell.style.border = "2px solid #0000FF"; // blue border
      cell.style.borderRadius = "50%";
      cell.style.backgroundColor = "white";
      cell.style.boxSizing = "border-box";
      cell.style.cursor = "pointer";

      // Clicking a column triggers a move
      if (row === 0) { // top row clickable to drop disc in that column
        cell.style.cursor = "pointer";
        cell.addEventListener("click", () => {
          if (gameOver || currentPlayerIndex !== playerNumber) return;
          socket.emit("connect4Move", { roomId, col });
        });
      }

      boardEl.appendChild(cell);
    }
  }

  gameDiv.appendChild(boardEl);

  const info = document.createElement("div");
  info.id = "info";
  info.style.marginTop = "15px";
  gameDiv.appendChild(info);

  updateBoardUI();
}

// Update board UI from board array (2D 6x7)
function updateBoardUI() {
  const boardEl = document.getElementById("connect4-board");
  if (!boardEl) return;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (!cell) continue;

      if (board[row] && board[row][col] === 0) {
        cell.style.backgroundColor = "red";
      } else if (board[row] && board[row][col] === 1) {
        cell.style.backgroundColor = "yellow";
      } else {
        cell.style.backgroundColor = "white";
      }
    }
  }

  const info = document.getElementById("info");
  if (gameOver) {
    info.textContent = currentPlayerIndex === playerNumber ? "Game Over - You played" : "Game Over";
  } else {
    info.textContent = currentPlayerIndex === playerNumber ? "Your turn" : `Waiting for Player ${currentPlayerIndex + 1}`;
  }
}

// Socket events
socket.on("connect4Init", data => {
  playerNumber = data.playerNumber;
  board = data.board;
  currentPlayerIndex = data.currentPlayerIndex;
  gameOver = data.gameOver;
  createBoard();
});

socket.on("connect4Update", data => {
  board = data.board;
  currentPlayerIndex = data.currentPlayerIndex;
  gameOver = data.gameOver;
  updateBoardUI();
});

socket.on("connect4Error", data => {
  alert(`Error: ${data.message}`);
});

window.onload = createInitialUI;
