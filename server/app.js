const express = require("express");
const { uuid } = require("uuidv4");
const { start } = require("repl");
const { SSL_OP_COOKIE_EXCHANGE } = require("constants");
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
const DIM = 38;
const TRANSPORT_CLOSE = `transport close`;
const TRANSPORT_ERR = `transport error`;
const TIMEOUT = `ping timeout`;

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

  socket.on(`cleanup`, (ID) => console.log(`cleaning up ${ID}`));

  socket.on(`reconnect`, () => console.log(`reconnecting`));

  socket.on(`disconnect`, (reason) => {
    console.log(` disconnected because ${reason}`);
    const name = socket.handshake.query.name;
    const oldPlayer = players.filter((p) => p.name === name);
    if (reason !== TIMEOUT) {
      players = players.filter((p) => p.name !== name);
      if (hasVoted.includes(oldPlayer.id)) {
        votes--;
        io.emit(`updateVotes`, true);
      }
      delete positionMap[oldPlayer.id];
      io.emit(`playerLeft`, oldPlayer.id);
    }
  });

  socket.on(`reconnect`, (num) => {
    console.log(`${scoket.id} attempting to reconnect`);
  });

  socket.on(`initPlayer`, (name, cb) => {
    console.log(`initializing player ${socket.id}`);
    const id = uuid();
    const startIndex = getUniqueStart(id);
    const startSnake = startPositions[startIndex];
    const startDirection = getStartDirection(startIndex);
    const otherPlayers = players;
    const newPlayer = {
      id,
      sid: socket.id,
      snake: startSnake,
      color: `#${generateRandomColor()}`,
      name: name,
      startDirection: startDirection,
      startSnake: startSnake,
    };
    players.push(newPlayer);

    // broadcast to other players to add this playerxx
    socket.broadcast.emit(`newPlayerJoined`, newPlayer);

    // callback to initialize current player
    cb(newPlayer, otherPlayers, votes);
  });

  socket.on(`addVote`, (id, name) => {
    hasVoted.push(id);
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
