const { v4: uuidv4 } = require("uuid")
const express = require("express")
const app = express()
const http = require("http").Server(app)

const io = require("socket.io")(http)

const PORT = process.env.PORT || 4000

app.get("/", (_, res) => res.send(`<h1>Listening....</h1>`))

let connections = []
let nextAvailableIndex = 0
let players = 0

// NEW IMPLEMENTATION
io.sockets.on(`connection`, (socket) => {
  console.log(`${socket.id} connected`)

  connections.push(socket.id)
  // console.log(`connections length: ${connections.length}`)

  socket.on(`vote`, () => io.emit(`increment votes`))

  // setInterval(() => io.emit(`players`, connections.length), 1000)

  socket.on(`snake move`, (_snake, _index) =>
    socket.broadcast.emit(`draw fellow snake`, { _snake, _index })
  )

  socket.on(`get index`, (fn) => fn(nextAvailableIndex++ % connections.length))

  socket.once(`disconnect`, () => {
    console.log(`${socket.id} disconnected`)
    connections = connections.filter((id) => id !== socket.id)
  })
})

http.listen(PORT, () => console.log(`Server listening on port ${PORT}`))

// is there a way that i dont need to know specific clients information
// if someone sends me something, i should know how to respond

// next available index and connections dont work properly
