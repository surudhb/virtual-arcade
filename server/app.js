const { v4: uuidv4 } = require("uuid")
const express = require("express")
const app = express()
const http = require("http").Server(app)

const io = require("socket.io")(http)

const PORT = process.env.PORT || 4000

app.get("/", (_, res) => res.send(`<h1>Listening....</h1>`))

let connections = []
let nextAvailableIndex = 0
let players = new Set()
let votesCast = 0

// NEW IMPLEMENTATION
io.sockets.on(`connection`, (socket) => {
  console.log(`${socket.id} connected`)

  connections.push(socket.id)
  io.emit(`total players`, connections.length)
  console.log(`connections count: ${connections.length}`)

  socket.on(`set name`, (name, cb) => {
    players.add(name)
    cb(connections.length, nextAvailableIndex++ % players.size)
  })

  socket.on(`other snake missing`, () =>
    socket.broadcast.emit(`send init snake`)
  )

  socket.on(`update votes`, ({ increment }) => {
    votesCast += increment ? 1 : votesCast == 0 ? 0 : -1
    io.emit(`set votes`, votesCast)
    if (votesCast == connections.length) io.emit(`let the games begin`)
  })

  socket.on(`move snake`, (snake, color) =>
    socket.broadcast.emit(`set other snake`, snake, color)
  )

  socket.on(`disconnect`, (reason) => {
    console.log(reason)
    console.log(`${socket.id} disconnected`)
    connections = connections.filter((id) => id !== socket.id)
    io.emit(`total players`, connections.length)
  })
})

http.listen(PORT, () => console.log(`Server listening on port ${PORT}`))

// is there a way that i dont need to know specific clients information
// if someone sends me something, i should know how to respond

// next available index and connections dont work properly

// having multiple renders for each snake is causing latency issues
// the trick has to be start the game at the same time and then only have
// one drawing action occur and draw with the latest info you have

// second player isn't aware of the first until the first one resets
