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
let players = [];

const getInitPosition = (playerNum, dim) => {
  switch (playerNum) {
    case 1:
      return [
        [1, 1],
        [1, 0],
      ];
    case 2:
      return [
        [dim - 2, 1],
        [dim - 2, 0],
      ];
    case 3:
      return [
        [1, dim - 2],
        [1, dim - 1],
      ];
    case 4:
      return [
        [dim - 2, dim - 2],
        [dim - 2, dim - 1],
      ];
  }
};

const getInitMove = (playerNum) => {
  switch (playerNum) {
    case 1:
    case 2:
      return [0, 1];
    case 3:
    case 4:
      return [0, -1];
  }
};

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });

  // socket joined snake
  socket.on("initSnakePlayer", ({ name, dims }, cb) => {
    console.log(`created new player ${name}`);
    const ID = uuid();
    players.push({
      name: name,
      id: ID,
      colour: `#${generateRandomColor()}`,
      snake: [[]],
    });
    cb(
      getInitPosition(players.length, dims),
      getInitMove(players.length, dims),
      ID
    );
  });

  // received a player's move from server
  socket.on("snakeMoved", (ID, snake) => {
    console.log(`player: ${ID} moved`);
    const { colour } = players.find((p) => p.id === ID);
    socket.broadcast.emit("fellowSnakeMoved", { colour, snake });
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
