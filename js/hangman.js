const socket = io("https://mini-games-backend.onrender.com");
const roomId = new URLSearchParams(window.location.search).get("roomId");

let isSetter = false;
let wrongGuesses = 0;
let guessedLetters = [];

const canvas = document.getElementById("hangmanCanvas");
const ctx = canvas.getContext("2d");
const wordDisplay = document.getElementById("wordDisplay");
const guessedDiv = document.getElementById("guessedLetters");

const parts = [
  () => { ctx.beginPath(); ctx.arc(150, 60, 20, 0, Math.PI * 2); ctx.stroke(); }, // head
  () => { ctx.beginPath(); ctx.moveTo(150, 80); ctx.lineTo(150, 140); ctx.stroke(); }, // body
  () => { ctx.beginPath(); ctx.moveTo(150, 100); ctx.lineTo(120, 120); ctx.stroke(); }, // left arm
  () => { ctx.beginPath(); ctx.moveTo(150, 100); ctx.lineTo(180, 120); ctx.stroke(); }, // right arm
  () => { ctx.beginPath(); ctx.moveTo(150, 140); ctx.lineTo(130, 180); ctx.stroke(); }, // left leg
  () => { ctx.beginPath(); ctx.moveTo(150, 140); ctx.lineTo(170, 180); ctx.stroke(); }, // right leg
];

function drawScaffold() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(20, 280); ctx.lineTo(280, 280); // base
  ctx.moveTo(100, 280); ctx.lineTo(100, 20); // pole
  ctx.lineTo(150, 20); ctx.lineTo(150, 40);  // top + rope
  ctx.stroke();
}

function updateWordDisplay(masked) {
  wordDisplay.textContent = masked;
}

function updateGuessedLetters() {
  guessedDiv.innerHTML = "";
  guessedLetters.forEach(letter => {
    const span = document.createElement("span");
    span.textContent = letter.toUpperCase();
    guessedDiv.appendChild(span);
  });
}

function handleKeyPress(e) {
  const letter = e.key.toLowerCase();
  if (!/^[a-z]$/.test(letter) || guessedLetters.includes(letter)) return;
  guessedLetters.push(letter);
  updateGuessedLetters();
  socket.emit("guessLetter", { roomId, letter });
}

document.getElementById("submitWordBtn").addEventListener("click", () => {
  const word = document.getElementById("customWordInput").value.trim();
  if (!word) return alert("Please enter a valid word.");
  isSetter = true;
  socket.emit("setWord", { roomId, word });
  document.getElementById("setWordContainer").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  drawScaffold();
});

socket.emit("joinRoom", { game: "hangman", roomId });

socket.on("startGame", ({ maskedWord }) => {
  drawScaffold();
  updateWordDisplay(maskedWord);
  document.getElementById("setWordContainer").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
});

socket.on("updateMaskedWord", ({ maskedWord, correct }) => {
  updateWordDisplay(maskedWord);
  if (!correct && wrongGuesses < parts.length) {
    parts[wrongGuesses++]();
  }
});

socket.on("gameOver", ({ win, word }) => {
  window.removeEventListener("keydown", handleKeyPress);
  alert(win ? "You won!" : `You lost. The word was: ${word}`);
});

window.addEventListener("keydown", handleKeyPress);
