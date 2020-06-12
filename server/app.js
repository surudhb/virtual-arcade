const express = require("express");
const { uuid } = require("uuidv4");
const app = express();
const http = require("http").Server(app);

const io = require("socket.io")(http);

// const createError = require("http-errors");
// const cookieParser = require("cookie-parser");
// const logger = require("morgan");

// const indexRouter = require("./routes/index");

const PORT = process.env.PORT || 4000;

// // middleware setup
// app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

// // routes setup
// app.use("/", indexRouter);

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

// error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

app.get("/", (req, res) => res.send(`<h1>Listening....</h1>`));

const generateRandomColor = () =>
  Math.floor(Math.random() * 16777215).toString(16);

// maintain internal state of total players
let players = {};
let positionMap = {};

let indx = 0;

// dim should really be a server-side constant, so should all constants
const getInitPosition = (id, dim) => {
  const startPositions = [
    [
      [1, 1],
      [1, 0],
    ],
    [
      [dim - 2, 1],
      [dim - 2, 0],
    ],
    [
      [1, dim - 2],
      [1, dim - 1],
    ],
    [
      [dim - 2, dim - 2],
      [dim - 2, dim - 1],
    ],
  ];
  if (Object.keys(positionMap).includes(id))
    return startPositions[positionMap[id]];
  while (Object.values(positionMap).includes(indx)) {
    indx = (indx + 1) % startPositions.length;
  }
  positionMap[id] = indx;
  return startPositions[indx];
};

const getInitMove = () => {
  switch (indx) {
    case 0:
    case 1:
      return [0, 1];
    case 2:
    case 3:
      return [0, -1];
  }
};

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);
  players[socket.id] = {
    colour: `#${generateRandomColor()}`,
  };
  console.log(`after add count: ${Object.keys(players).length}`);

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
    delete players[socket.id];
    delete positionMap[socket.id];
    console.log(`after delete count: ${Object.keys(players).length}`);
  });

  // socket joined snake
  socket.on("initSnakePlayer", ({ name, dims }, cb) => {
    console.log(`${name} joined snake!`);
    const playerCount = Object.keys(players).length;
    console.log(playerCount);
    cb(getInitPosition(socket.id, dims), getInitMove(socket.id, dims));
  });

  // received a player's move from server
  socket.on("snakeMoved", (snake) => {
    console.log(`snakeMoved called by: ${socket.id}`);
    const colour = players[socket.id].colour;
    socket.broadcast.emit("fellowSnakeMoved", { colour, snake });
  });

  // socket's game over
  socket.on("reset", (dims, cb) => {
    console.log(`${socket.id} called reset`);
    cb(getInitPosition(socket.id, dims), getInitMove(socket.id, dims));
  });
});

http.listen(PORT, `192.168.0.11`, () => {
  console.log(`Server listening on port ${PORT}`);
});
