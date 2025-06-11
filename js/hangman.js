const gameContainer = document.getElementById('game');
let roomId = null;
let currentWordDisplay = '';
let guessesLeft = 6;
let incorrectGuesses = [];

function createSetupUI() {
  // Same as before, omitted for brevity
  // ...
}

function renderWord() {
  gameContainer.innerHTML = '';

  const wordDiv = document.createElement('div');
  wordDiv.style.fontSize = '2rem';
  wordDiv.textContent = currentWordDisplay;
  gameContainer.appendChild(wordDiv);

  const guessesLeftDiv = document.createElement('div');
  guessesLeftDiv.textContent = `Guesses Left: ${guessesLeft}`;
  gameContainer.appendChild(guessesLeftDiv);

  const incorrectDiv = document.createElement('div');
  incorrectDiv.textContent = `Incorrect guesses: ${incorrectGuesses.join(', ')}`;
  gameContainer.appendChild(incorrectDiv);

  const instructions = document.createElement('p');
  instructions.textContent = 'Type letters on your keyboard to guess.';
  gameContainer.appendChild(instructions);
}

function setupKeyListener() {
  window.addEventListener('keydown', (e) => {
    const letter = e.key.toLowerCase();
    if (letter.match(/^[a-z ]$/)) {
      socket.emit('hangman-guess', { roomId, letter });
    }
  });
}

function startGame(category, customWord) {
  roomId = prompt('Enter room ID for Hangman:');
  if (!roomId) {
    gameContainer.textContent = 'Room ID is required to play.';
    return;
  }
  socket.emit('hangman-join', { roomId, category, customWord });
  setupKeyListener();
}

socket.on('hangman-update', ({ wordDisplay, guessesLeft: left, incorrectGuesses: wrong, status }) => {
  currentWordDisplay = wordDisplay;
  guessesLeft = left;
  incorrectGuesses = wrong;
  renderWord();

  if (status === 'win') {
    alert('Congratulations! You won!');
  } else if (status === 'lose') {
    alert('Game over! You lost.');
  }
});

createSetupUI();
