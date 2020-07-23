import React, { useState, useEffect, useRef } from "react"
import { useInterval } from "../../hooks"
import {
  CANVAS_SIZE,
  SCALE,
  FOOD_START,
  MOVE_START,
  SNAKE_START,
  SNAKE_COLORS,
  SPEED,
  DIRECTIONS,
} from "./constants"
import io from "socket.io-client"

let socket

export default (props) => {
  const canvasRef = useRef(null)

  const [score, setScore] = useState(0)
  const [index, setIndex] = useState(-1)
  const [numPlayers, setNumPlayers] = useState(0)
  const [votes, setVotes] = useState(0)
  const [snake, setSnake] = useState()
  const [color, setColor] = useState()
  const [food, setFood] = useState(FOOD_START)
  const [move, setMove] = useState()
  const [speed, setSpeed] = useState(null)

  const { name } = props.location.state

  useEffect(() => {
    socket = io.connect(`localhost:4000`)

    socket.on(`players`, (numPlayers) => setNumPlayers(numPlayers))
    if (index === -1)
      socket.emit(`get index`, (index) => {
        setIndex(index)
        setSnake(SNAKE_START[index])
        setColor(SNAKE_COLORS[index])
        setMove(MOVE_START[index])
      })

    socket.on(`draw fellow snake`, ({ _snake, _index }) => {
      const context = canvasRef.current.getContext("2d")
      context.setTransform(SCALE, 0, 0, SCALE, 0, 0)
      context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1])
      context.fillStyle = SNAKE_COLORS[_index]
      _snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1))
      if (index !== -1) {
        context.fillStyle = color
        snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1))
      }
      context.fillStyle = "lightgreen"
      context.fillRect(food[0], food[1], 1, 1)
    })

    socket.on(`increment votes`, () => setVotes((votes) => votes + 1))

    return () => {
      socket.off()
      socket.disconnect()
    }
  })

  const startGame = () => {
    setSpeed(SPEED)
    setSnake(SNAKE_START[index])
    setColor(SNAKE_COLORS[index])
    setMove(MOVE_START[index])
    socket.emit(`snake move`, snake, index)
  }

  const resetGame = () => {
    setScore(0)
    setSpeed(null)
    setSnake(SNAKE_START[index])
    setFood(FOOD_START)
    setMove(MOVE_START[index])
    socket.emit(`reset`, snake)
  }

  const castVote = () => socket.emit(`vote`)

  const moveSnake = (keyCode) => setMove(DIRECTIONS[keyCode])

  const randomFood = (idx) =>
    Math.floor((Math.random() * CANVAS_SIZE[idx]) / SCALE)

  const createFood = () => {
    let x = randomFood(0)
    let y = randomFood(1)
    while (hasCollidedWithSnake([x, y])) {
      x = randomFood(0)
      y = randomFood(1)
    }
    return [x, y]
  }

  const hasEatenFood = (head) => head[0] === food[0] && head[1] === food[1]

  const isAxisCollision = (axis, idx) =>
    axis < 0 || axis * SCALE >= CANVAS_SIZE[idx]

  const hasCollidedWithWall = (head) =>
    isAxisCollision(head[0], 0) || isAxisCollision(head[1], 1)

  const hasCollidedWithSnake = (head) => {
    for (const part of snake) {
      if (part[0] === head[0] && part[1] === head[1]) return true
    }
    return false
  }

  const hasCollided = (head) =>
    hasCollidedWithWall(head) || hasCollidedWithSnake(head)

  // experiment with this -- so shady -- do you really need to deep copy
  const gameLoop = () => {
    const newSnake = snake.map((arr) => arr.slice())
    const newSnakeHead = [newSnake[0][0] + move[0], newSnake[0][1] + move[1]]
    if (hasCollided(newSnakeHead)) {
      resetGame()
    } else {
      if (hasEatenFood(newSnakeHead)) {
        setFood(createFood())
        setScore((score) => score + 1)
        score > 0 && score % 4 === 0 && setSpeed((speed) => speed - 5)
      } else {
        newSnake.pop()
      }
      newSnake.unshift(newSnakeHead)
      setSnake(newSnake)
      socket.emit(`snake move`, newSnake, index)
    }
  }

  onkeydown = (e) => {
    const { keyCode } = e
    if (keyCode >= 37 && keyCode <= 40) {
      e.preventDefault()
      moveSnake(keyCode)
    }
  }

  useInterval(gameLoop, speed)

  useEffect(() => {
    const context = canvasRef.current.getContext("2d")
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0)
    context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1])
    if (snake) {
      context.fillStyle = color
      snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1))
    }
    if (food) {
      context.fillStyle = "lightgreen"
      context.fillRect(food[0], food[1], 1, 1)
    }
  }, [color, snake, food])

  return (
    <div className="vh-100 text-center container-fluid bg-dark text-white">
      <h3>Snake</h3>
      <h5>
        Player: {name}&nbsp;&nbsp;Score: {score}&nbsp;&nbsp; Votes cast: {votes}
        /{numPlayers}
      </h5>
      <div>
        <canvas
          style={{ border: "1px dashed white", borderRadius: "7px" }}
          ref={canvasRef}
          width={`${CANVAS_SIZE[0]}px`}
          height={`${CANVAS_SIZE[1]}px`}
        />
      </div>
      <div>
        <button
          className="btn btn-primary border-light rounded-pill mx-3 mt-3 my-4 px-3"
          onClick={() => startGame()}
        >
          Start
        </button>
        <button
          className="btn btn-danger border-light mx-3 my-4 px-3"
          onClick={() => resetGame()}
        >
          Reset
        </button>
        <button
          className="btn btn-success border-light rounded-pill mx-3 mt-3 my-4 px-3"
          onClick={() => castVote()}
        >
          Vote
        </button>
      </div>
    </div>
  )
}
