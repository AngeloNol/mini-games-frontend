const gameDiv = document.getElementById('game');

let roomId = null;

// Create a room with random ID
function createRoom() {
  roomId = Math.random().toString(36).substring(2, 8);
  socket.emit('connect4-create', roomId);
  alert(`Room created! Share this ID: ${roomId}`);
}

// Join a room with user input
function joinRoom() {
  const input = document.getElementById('roomInput');
  roomId = input.value.trim();
  if (roomId) {
    socket.emit('connect4-join', roomId);
  }
}

// Start the game after room is ready
socket.on('connect4-start', () => {
  gameDiv.innerHTML = `<p>Connect 4 game started in room: ${roomId}</p>`;
  // You’ll later build out the grid and logic here
});

// Show error if room full or invalid
socket.on('connect4-error', (msg) => {
  alert(msg);
});
