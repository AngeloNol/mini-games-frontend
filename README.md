# Multiplayer Mini Games

A web-based multiplayer platform featuring **Tic Tac Toe**, **Hangman**, and **Connect 4**, where players can create game rooms and invite friends via a link. The frontend is hosted on GitHub Pages, and the backend runs on Render with real-time communication powered by Socket.IO.

---

## Features

- **Tic Tac Toe:** Classic 2-player game with real-time updates.
- **Hangman:** Keyboard input, multiple categories (Movies, Animals), and custom word/phrase input with whitespace counting.
- **Connect 4:** Supports 2 to 4 players, disc falling animation, and an authentic Connect 4 board design.
- Link-based room invites to easily share game rooms with friends.
- Responsive UI and multiplayer gameplay in real-time.

---

## Project Structure

```plaintext
project/
│
├── frontend/                       # GitHub Pages (static files only)
│   ├── index.html                  # Homepage with links to all games
│   ├── tictactoe.html              # Tic Tac Toe game
│   ├── connect4.html               # Connect 4 game
│   ├── hangman.html                # Hangman game
│   ├── css/
│   │   └── styles.css              # Shared styles
│   ├── js/
│   │   ├── tictactoe.js            # Tic Tac Toe frontend logic
│   │   ├── connect4.js             # Connect 4 frontend logic
│   │   ├── hangman.js              # Hangman frontend logic
│   │   └── socket-init.js          # Common socket init logic
│   └── assets/                     # Images, sounds, etc.
│
├── backend/                        # Render deployment
│   ├── server.js                   # Express + Socket.IO server
│   ├── games/
│   │   ├── tictactoe.js            # Server-side game logic
│   │   ├── hangman.js              # Server-side game logic
│   │   └── connect4.js             # Server-side game logic
│   ├── utils/
│   │   └── roomManager.js          # Shared room handling
│   ├── package.json
│   └── cors-config.js
