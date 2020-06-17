const express = require("express");
const { uuid } = require("uuidv4");
const { start } = require("repl");
const app = express();
const http = require("http").Server(app);

const io = require("socket.io")(http);

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send(`<h1>Listening....</h1>`));

// const generateRandomColor = () =>
//   Math.floor(Math.random() * 16777215).toString(16);

// // maintain internal state of total players
// let players = {};
// let positionMap = {};

// let indx = 0;

// // DIM should really be a server-side constant, so should all constants
// const getInitPosition = (id, DIM) => {
//   const startPositions = [
//     [
//       [1, 1],
//       [1, 0],
//     ],
//     [
//       [DIM - 2, 1],
//       [DIM - 2, 0],
//     ],
//     [
//       [1, DIM - 2],
//       [1, DIM - 1],
//     ],
//     [
//       [DIM - 2, DIM - 2],
//       [DIM - 2, DIM - 1],
//     ],
//   ];
//   if (Object.keys(positionMap).includes(id))
//     return startPositions[positionMap[id]];
//   while (Object.values(positionMap).includes(indx)) {
//     indx = (indx + 1) % startPositions.length;
//   }
//   positionMap[id] = indx;
//   const move = getInitMove();
//   return { position: startPositions[indx], move };
// };

// const getInitMove = () => (indx <= 1 ? [0, 1] : [0, -1]);

// io.on("connection", (socket) => {
//   console.log(`${socket.id} connected`);
//   players[socket.id] = {
//     colour: `#${generateRandomColor()}`,
//   };
//   console.log(`after add count: ${Object.keys(players).length}`);

//   socket.on("disconnect", () => {
//     console.log(`${socket.id} disconnected`);
//     delete players[socket.id];
//     delete positionMap[socket.id];
//     console.log(`after delete count: ${Object.keys(players).length}`);
//   });

//   // socket joined snake
//   socket.on("initSnakePlayer", ({ name, dims }, cb) => {
//     // player should know of all existing snakes
//     console.log(`${name} joined snake!`);
//     const playerCount = Object.keys(players).length;
//     console.log(playerCount);
//     const { position, move } = getInitPosition(socket.id, dims);
//     cb(position, move);
//   });

//   // received a player's move from server
//   socket.on("snakeMoved", (snake) => {
//     console.log(`snakeMoved called by: ${socket.id}`);
//     const colour = players[socket.id].colour;
//     socket.broadcast.emit("fellowSnakeMoved", { colour, snake });
//   });

//   // socket's game over
//   socket.on("reset", (dims, cb) => {
//     console.log(`${socket.id} called reset`);
//     const { position, move } = getInitPosition(socket.id, dims);
//     cb(position, move);
//   });
// });

// id : {snake, colour}
let players = [];
let votes = 0;
const positionMap = {};
let hasVoted = [];
const DIM = Math.floor(700 / 21);

const startPositions = [
  [
    [1, 1],
    [1, 0],
  ],
  [
    [DIM - 2, 1],
    [DIM - 2, 0],
  ],
  [
    [1, DIM - 2],
    [1, DIM - 1],
  ],
  [
    [DIM - 2, DIM - 2],
    [DIM - 2, DIM - 1],
  ],
];

const generateRandomColor = () =>
  Math.floor(Math.random() * 16777215).toString(16);

// generate food that checks that it does not collide with existing snakes

const positionTaken = (index) => Object.values(positionMap).includes(index);

const getUniqueStart = (socketID) => {
  let index = 0;
  while (positionTaken(index)) index = (index + 1) % startPositions.length;
  positionMap[socketID] = index;
  return index;
};

const getStartDirection = (index) => (index <= 1 ? [0, 1] : [0, -1]);

// NEW IMPLEMENTATION
io.on(`connection`, (socket) => {
  console.log(`${socket.id} connected`);
  players.push({
    id: socket.id,
    snake: null,
    color: `#${generateRandomColor()}`,
    name: ``,
  });

  socket.on(`disconnect`, () => {
    console.log(`${socket.id} disconnected`);
    players = players.filter((p) => p.id !== socket.id);
    if (hasVoted.includes(socket.id)) {
      votes--;
      socket.broadcast.emit(`updateVotes`, true);
    }
    delete positionMap[socket.id];
    io.emit(`playerLeft`, socket.id);
  });

  socket.on(`initPlayer`, (name, cb) => {
    console.log(`initializing player ${socket.id}`);
    players.map((p) => {
      p.name = p.id === socket.id ? name : p.name;
      return p;
    });
    const startIndex = getUniqueStart(socket.id);
    const startSnake = startPositions[startIndex];
    console.log(startSnake);
    const startDirection = getStartDirection(startIndex);
    players.map((p) => {
      if (p.id === socket.id) {
        p.snake = startSnake;
      } else {
        p;
      }
    });
    const otherPlayers = players.filter((p) => p.id !== socket.id);
    const currPlayer = players.filter((p) => p.id === socket.id)[0];
    console.log(currPlayer.color);
    cb(startSnake, startDirection, otherPlayers, currPlayer.color, votes);

    // broadcast to other players to add this player
    console.log(currPlayer.snake);
    socket.broadcast.emit(`newPlayerJoined`, currPlayer);
  });

  socket.on(`addVote`, (name) => {
    hasVoted.push(socket.id);
    votes++;
    console.log(`${name} has voted to start game`);
    socket.broadcast.emit(`updateVotes`);
    if (votes == players.length) {
      // io.emit start game
      console.log(`emiting start game`);
      io.emit(`startGame`);
    }
  });
});

http.listen(PORT, `localhost`, () => {
  console.log(`Server listening on port ${PORT}`);
});
