// js/hangman.js

const socket = io("https://mini-games-backend.onrender.com"); // replace with your backend URL

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomInput = document.getElementById("roomInput");
const roomInfo = document.getElementById("roomInfo");

const wordDiv = document.getElementById("word");
const incorrectLettersSpan = document.getElementById("incorrectLetters");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const turnMessage = document.getElementById("turnMessage");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let roomId = null;
let gameActive = false;

// Hangman drawing steps
const drawSteps = [
  () => { /* base */ 
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(10, 240);
    ctx.lineTo(190, 240);
    ctx.stroke();
  },
  () => { /* pole */
    ctx.beginPath();
    ctx.moveTo(40, 240);
    ctx.lineTo(40, 20);
    ctx.stroke();
  },
  () => { /* beam */
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(130, 20);
    ctx.stroke();
  },
  () => { /* rope */
    ctx.beginPath();
    ctx.moveTo(130, 20);
    ctx.lineTo(130, 40);
    ctx.stroke();
  },
  () => { /* head */
    ctx.beginPath();
    ctx.arc(130, 60, 20, 0, Math.PI * 2);
    ctx.stroke();
  },
  () => { /* body */
    ctx.beginPath();
    ctx.moveTo(130, 80);
    ctx.lineTo(130, 140);
    ctx.stroke();
  },
  () => { /* left arm */
    ctx.beginPath();
    ctx.moveTo(130, 100);
    ctx.lineTo(100, 120);
    ctx.stroke();
  },
  () => { /* right arm */
    ctx.beginPath();
    ctx.moveTo(130, 100);
    ctx.lineTo(160, 120);
    ctx.stroke();
  },
  () => { /* left leg */
    ctx.beginPath();
    ctx.moveTo(130, 140);
    ctx.lineTo(110, 180);
    ctx.stroke();
  },
  () => { /* right leg */
    ctx.beginPath();
    ctx.moveTo(130, 140);
    ctx.lineTo(150, 180);
    ctx.stroke();
  },
];

// Draw hangman up to given step (number of incorrect guesses)
function drawHangman(step) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < step && i < drawSteps.length; i++) {
    drawSteps[i]();
  }
}

// Create room
createRoomBtn.addEventListener("click", () => {
  socket.emit("createRoom", { game: "hangman" });
});

// Join room
joinRoomBtn.addEventListener("click", () => {
  const id = roomInput.value.trim();
  if (!id) {
    alert("Please enter a room ID");
    return;
  }
  socket.emit("joinRoom", { game: "hangman", roomId: id });
});

// Guess letter
guessBtn.addEventListener("click", () => {
  const guess = guessInput.value.trim().toUpperCase();
  if (!guess || guess.length !== 1 || !/[A-Z]/.test(guess)) {
    alert("Please enter a valid letter");
    guessInput.value = "";
    return;
  }
  if (!gameActive || !roomId) {
    alert("You must be in a game room to guess");
    return;
  }
  socket.emit("guessLetter", { game: "hangman", roomId, letter: guess });
  guessInput.value = "";
});

// Handle room created
socket.on("roomCreated", ({ game, roomId: id }) => {
  if (game !== "hangman") return;
  roomId = id;
  roomInfo.textContent = `Room ID: ${roomId}`;
  turnMessage.textContent = "Waiting for opponent to join...";
  resetGame();
});

// Handle room joined
socket.on("roomJoined", ({ game, roomId: id }) => {
  if (game !== "hangman") return;
  roomId = id;
  roomInfo.textContent = `Room ID: ${roomId}`;
  turnMessage.textContent = "Game started! Make your guess.";
  gameActive = true;
  resetGame();
});

// Update word display
socket.on("updateWord", ({ game, word, guessedLetters }) => {
  if (game !== "hangman") return;
  let display = "";
  for (const char of word) {
    display += guessedLetters.includes(char.toUpperCase()) ? char.toUpperCase() + " " : "_ ";
  }
  wordDiv.textContent = display.trim();
});

// Update incorrect letters and draw hangman
socket.on("updateIncorrectLetters", ({ game, incorrectLetters }) => {
  if (game !== "hangman") return;
  incorrectLettersSpan.textContent = incorrectLetters.join(", ");
  drawHangman(incorrectLetters.length);
});

// Handle game over
socket.on("gameOver", ({ game, won, word }) => {
  if (game !== "hangman") return;
  gameActive = false;
  if (won) {
    turnMessage.textContent = "You won! 🎉";
  } else {
    turnMessage.textContent = `Game over! The word was: ${word}`;
  }
});

// Handle turn message update (optional, if you want turn-based guessing)
socket.on("turnMessage", ({ game, message }) => {
  if (game !== "hangman") return;
  turnMessage.textContent = message;
});

function resetGame() {
  wordDiv.textContent = "_ _ _ _ _";
  incorrectLettersSpan.textContent = "";
  drawHangman(0);
  gameActive = false;
}
