const socket = io("https://mini-games-backend.onrender.com");

let roomId = null;
let playerNumber = null;
let currentWord = "";
let guessedLetters = new Set();
let wrongGuesses = 0;
let maxWrongGuesses = 6;
let gameOver = false;

const gameDiv = document.getElementById("game");

// Initial UI for create/join room
function createInitialUI() {
  gameDiv.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Hangman - Multiplayer";
  gameDiv.appendChild(title);

  const createBtn = document.createElement("button");
  createBtn.textContent = "Create New Room";
  createBtn.onclick = () => {
    roomId = generateRoomId();
    alert(`Room created! Share this ID: ${roomId}`);
    joinRoom(roomId);
  };
  gameDiv.appendChild(createBtn);

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
  socket.emit("joinRoom", { game: "hangman", roomId });
  createGameUI();
}

// Build the game UI after joining room
function createGameUI() {
  gameDiv.innerHTML = "";

  const wordDiv = document.createElement("div");
  wordDiv.id = "wordDisplay";
  wordDiv.style.fontSize = "2em";
  wordDiv.style.letterSpacing = "10px";
  wordDiv.style.marginBottom = "20px";
  gameDiv.appendChild(wordDiv);

  const info = document.createElement("div");
  info.id = "info";
  info.style.marginBottom = "15px";
  gameDiv.appendChild(info);

  const guessedDiv = document.createElement("div");
  guessedDiv.id = "guessedLetters";
  guessedDiv.style.marginBottom = "20px";
  gameDiv.appendChild(guessedDiv);

  createKeyboard();

  updateGameUI();
}

// Create clickable keyboard for guesses
function createKeyboard() {
  const keyboardDiv = document.createElement("div");
  keyboardDiv.id = "keyboard";
  keyboardDiv.style.display = "flex";
  keyboardDiv.style.flexWrap = "wrap";
  keyboardDiv.style.justifyContent = "center";
  keyboardDiv.style.maxWidth = "400px";
  keyboardDiv.style.margin = "auto";

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (const letter of letters) {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.style.margin = "5px";
    btn.style.width = "30px";

    btn.onclick = () => {
      if (gameOver || guessedLetters.has(letter)) return;
      guessedLetters.add(letter);
      socket.emit("hangmanGuess", { roomId, letter });
    };
    keyboardDiv.appendChild(btn);
  }
  gameDiv.appendChild(keyboardDiv);
}

function updateGameUI() {
  const wordDiv = document.getElementById("wordDisplay");
  const info = document.getElementById("info");
  const guessedDiv = document.getElementById("guessedLetters");

  if (!wordDiv || !info || !guessedDiv) return;

  let displayWord = "";
  for (const ch of currentWord) {
    if (ch === " ") {
      displayWord += "  ";
    } else if (guessedLetters.has(ch.toUpperCase())) {
      displayWord += ch + " ";
    } else {
      displayWord += "_ ";
    }
  }
  wordDiv.textContent = displayWord.trim();

  guessedDiv.textContent = "Guessed letters: " + Array.from(guessedLetters).join(", ");

  info.textContent = gameOver ? "Game Over" : "Make a guess!";
}

// Socket listeners
socket.on("hangmanInit", data => {
  playerNumber = data.playerNumber;
  currentWord = data.word.toUpperCase();
  guessedLetters = new Set(data.guessedLetters.map(l => l.toUpperCase()));
  wrongGuesses = data.wrongGuesses;
  maxWrongGuesses = data.maxWrongGuesses;
  gameOver = data.gameOver;
  createGameUI();
});

socket.on("hangmanUpdate", data => {
  currentWord = data.word.toUpperCase();
  guessedLetters = new Set(data.guessedLetters.map(l => l.toUpperCase()));
  wrongGuesses = data.wrongGuesses;
  maxWrongGuesses = data.maxWrongGuesses;
  gameOver = data.gameOver;
  updateGameUI();
});

socket.on("hangmanError", data => {
  alert(`Error: ${data.message}`);
});

window.onload = createInitialUI;

// Optional: listen for keyboard input to guess letters
window.addEventListener("keydown", e => {
  if (gameOver) return;
  const key = e.key.toUpperCase();
  if (/^[A-Z]$/.test(key) && !guessedLetters.has(key)) {
    guessedLetters.add(key);
    socket.emit("hangmanGuess", { roomId, letter: key });
  }
});
