const socket = io("https://mini-games-backend.onrender.com"); // replace with your actual backend URL

const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomInput = document.getElementById("roomInput");
const playerCountSelect = document.getElementById("playerCount");
const turnMessage = document.getElementById("turnMessage");
const gameDiv = document.getElementById("game");

let roomId = null;
let playerId = null;
let currentTurn = null;
let board = [];
let columns = 7;
let rows = 6;

// Join Room Button
joinRoomBtn.addEventListener("click", () => {
  const room = roomInput.value.trim();
  const numPlayers = parseInt(playerCountSelect.value);

  if (!room) {
    alert("Enter a room ID");
    return;
  }

  socket.emit("joinRoom", { game: "connect4", roomId: room, playerCount: numPlayers });
});

// Socket listeners
socket.on("roomJoined", ({ game, roomId: id, playerId: pid }) => {
  if (game !== "connect4") return;
  roomId = id;
  playerId = pid;
  turnMessage.textContent = `Joined room ${roomId}. Waiting for others...`;
});

socket.on("gameStart", ({ board: b, currentTurn: ct }) => {
  board = b;
  currentTurn = ct;
  renderBoard();
  updateTurnMessage();
});

socket.on("gameUpdate", ({ board: b, currentTurn: ct }) => {
  board = b;
  currentTurn = ct;
  renderBoard();
  updateTurnMessage();
});

socket.on("gameOver", ({ winner }) => {
  if (winner === null) {
    turnMessage.textContent = "It's a draw!";
  } else if (winner === playerId) {
    turnMessage.textContent = "You win! 🎉";
  } else {
    turnMessage.textContent = `Player ${winner + 1} wins!`;
  }
});

function updateTurnMessage() {
  if (playerId === currentTurn) {
    turnMessage.textContent = "Your turn!";
  } else {
    turnMessage.textContent = `Player ${currentTurn + 1}'s turn`;
  }
}

// Render the Connect 4 board
function renderBoard() {
  gameDiv.innerHTML = "";
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.margin = "auto";

  for (let r = 0; r < rows; r++) {
    const row = document.createElement("tr");

    for (let c = 0; c < columns; c++) {
      const cell = document.createElement("td");
      cell.dataset.col = c;
      cell.style.width = "60px";
      cell.style.height = "60px";
      cell.style.border = "2px solid #555";
      cell.style.borderRadius = "50%";
      cell.style.backgroundColor = getColor(board[r][c]);
      cell.style.cursor = "pointer";

      if (r === 0) {
        cell.addEventListener("click", () => {
          if (playerId !== currentTurn) return;
          socket.emit("makeMove", { game: "connect4", roomId, column: c });
        });
      }

      row.appendChild(cell);
    }

    table.appendChild(row);
  }

  gameDiv.appendChild(table);
}

function getColor(val) {
  const colors = ["#e7eaf0", "#ff4d4d", "#4da6ff", "#32cd32", "#ffcc00"];
  return colors[val] || "#ccc";
}
