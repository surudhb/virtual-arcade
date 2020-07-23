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
let playerCountInterval

// NEW IMPLEMENTATION
io.sockets.on(`connection`, (socket) => {
  console.log(`${socket.id} connected`)

  connections.push(socket.id)
  io.emit(`total players`, connections.length)
  console.log(`connections count: ${connections.length}`)

  socket.on(`set name`, (name, cb) => {
    players.add(name)
    cb(connections.length, 0)
  })

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
