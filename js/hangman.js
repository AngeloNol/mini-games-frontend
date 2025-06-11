const socket = io("https://mini-games-backend.onrender.com"); // update URL accordingly

let roomId = null;
let isPlayerTurn = false;

const wordDiv = document.getElementById('word');
const incorrectLettersSpan = document.getElementById('incorrectLetters');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const turnMessage = document.getElementById('turnMessage');
const roomInfo = document.getElementById('roomInfo');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomInput = document.getElementById('roomInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let incorrectGuesses = 0;
const maxIncorrect = 6;

// Drawing steps for the hangman figure
function drawHangman(step) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gallows
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(10, 230);
  ctx.lineTo(190, 230);
  ctx.moveTo(40, 230);
  ctx.lineTo(40, 20);
  ctx.lineTo(120, 20);
  ctx.lineTo(120, 40);
  ctx.stroke();

  if (step > 0) {
    // Head
    ctx.beginPath();
    ctx.arc(120, 60, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (step > 1) {
    // Body
    ctx.beginPath();
    ctx.moveTo(120, 80);
    ctx.lineTo(120, 140);
    ctx.stroke();
  }
  if (step > 2) {
    // Left arm
    ctx.beginPath();
    ctx.moveTo(120, 90);
    ctx.lineTo(90, 120);
    ctx.stroke();
  }
  if (step > 3) {
    // Right arm
    ctx.beginPath();
    ctx.moveTo(120, 90);
    ctx.lineTo(150, 120);
    ctx.stroke();
  }
  if (step > 4) {
    // Left leg
    ctx.beginPath();
    ctx.moveTo(120, 140);
    ctx.lineTo(90, 180);
    ctx.stroke();
  }
  if (step > 5) {
    // Right leg
    ctx.beginPath();
    ctx.moveTo(120, 140);
    ctx.lineTo(150, 180);
    ctx.stroke();
  }
}

function updateWordDisplay(word, guessedLetters) {
  let display = '';
  for (const letter of word) {
    if (guessedLetters.includes(letter.toLowerCase())) {
      display += letter.toUpperCase() + ' ';
    } else {
      display += '_ ';
    }
  }
  wordDiv.textContent = display.trim();
}

guessBtn.onclick = () => {
  const guess = guessInput.value.trim().toLowerCase();
  if (!guess || guess.length !== 1 || !/[a-z]/.test(guess)) {
    alert("Please enter a valid letter");
    return;
  }
  if (!isPlayerTurn) {
    alert("Not your turn!");
    return;
  }
  socket.emit('hangman-guess', { roomId, guess });
  guessInput.value = '';
};

createRoomBtn.onclick = () => {
  socket.emit('hangman-create-room');
};

joinRoomBtn.onclick = () => {
  const inputRoom = roomInput.value.trim();
  if (inputRoom) {
    socket.emit('hangman-join-room', { roomId: inputRoom });
  }
};

socket.on('hangman-room-created', (data) => {
  roomId = data.roomId;
  roomInfo.textContent = `Room created: ${roomId}`;
  resetGame();
});

socket.on('hangman-room-joined', (data) => {
  roomId = data.roomId;
  roomInfo.textContent = `Joined room: ${roomId}`;
  resetGame();
});

socket.on('hangman-error', (msg) => {
  alert(msg);
});

socket.on('hangman-update', (data) => {
  updateWordDisplay(data.word, data.guessedLetters);
  incorrectLettersSpan.textContent = data.incorrectLetters.join(', ').toUpperCase();
  incorrectGuesses = data.incorrectLetters.length;
  drawHangman(incorrectGuesses);
  isPlayerTurn = data.currentPlayer === socket.id;
  turnMessage.textContent = isPlayerTurn ? "It's your turn!" : "Waiting for opponent...";
});

socket.on('hangman-game-over', (data) => {
  alert(data.message);
  turnMessage.textContent = "Game Over";
});

function resetGame() {
  wordDiv.textContent = '';
  incorrectLettersSpan.textContent = '';
  drawHangman(0);
  turnMessage.textContent = '';
}
