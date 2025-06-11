const gameDiv = document.getElementById('game');
let roomId = null;

// Create a new room and emit to server
function createRoom() {
  roomId = Math.random().toString(36).substring(2, 8);
  socket.emit('hangman-create', roomId);
  alert(`Room created! Share this ID: ${roomId}`);
}

// Join an existing room
function joinRoom() {
  const input = document.getElementById('roomInput');
  roomId = input.value.trim();
  if (roomId) {
    socket.emit('hangman-join', roomId);
  }
}

// When server starts the game
socket.on('hangman-start', () => {
  gameDiv.innerHTML = `<p>Hangman game started in room: ${roomId}</p>`;
  // Keyboard input and game UI logic will be added here
});

// Error handling
socket.on('hangman-error', (msg) => {
  alert(msg);
});
