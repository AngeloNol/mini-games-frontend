const gameDiv = document.getElementById('game');

let roomId = null;

// Create a new room
function createRoom() {
  roomId = Math.random().toString(36).substring(2, 8);
  socket.emit('tictactoe-create', roomId);
  alert(`Room created! Share this ID: ${roomId}`);
}

// Join an existing room
function joinRoom() {
  const input = document.getElementById('roomInput');
  roomId = input.value.trim();
  if (roomId) {
    socket.emit('tictactoe-join', roomId);
  }
}

socket.on('tictactoe-start', (data) => {
  gameDiv.innerHTML = `<p>Game started in room: ${roomId}</p>`;
});

socket.on('tictactoe-error', (msg) => {
  alert(msg);
});
