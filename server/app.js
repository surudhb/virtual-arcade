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
const players = {};
const DIM = 700;

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

const positionMap = {};

const positionTaken = (index) => Object.values(positionMap).contains(index);

const getUniqueStart = () => {
  let index = 0;
  while (positionTaken(index)) index = (index + 1) % startPositions.length;
  return index;
};

const getStartDirection = (index) => (index <= 1 ? [0, 1] : [0, -1]);

// NEW IMPLEMENTATION
io.on(`connection`, (socket) => {
  console.log(`${socket.id} connected`);
  players[socket.id] = { snake: null, color: ``, name: `` };

  socket.on(`initPlayer`, (name, cb) => {
    players[socket.id].name = name;
    const startIndex = getUniqueStart();
    const startPosition = startPositions[startIndex];
    const startDirection = getStartDirection(startIndex);
    const otherPlayers = 

    // broadcast to other players to add this player
  });
});

http.listen(PORT, `192.168.0.11`, () => {
  console.log(`Server listening on port ${PORT}`);
});
