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

const ENDPOINT = `192.168.0.11:4000`
let socket
let context

export default (props) => {
  const canvasRef = useRef(null)

  const [score, setScore] = useState(0)
  const [name, setName] = useState(``)
  const [index, setIndex] = useState(0)
  const [numPlayers, setNumPlayers] = useState(0)
  const [votes, setVotes] = useState(0)
  const [didCastVote, setDidCastVote] = useState(false)
  const [snake, setSnake] = useState()
  const [dead, setDead] = useState(true)
  const [otherSnake, setOtherSnake] = useState()
  const [otherColor, setOtherColor] = useState()
  const [color, setColor] = useState()
  const [food, setFood] = useState(FOOD_START)
  const [move, setMove] = useState()
  const [speed, setSpeed] = useState(null)

  useEffect(() => {
    const { name } = props.location.state
    if (!socket) {
      socket = io.connect(ENDPOINT)
      socket.emit(`set name`, name, (playerCount, index) => {
        setNumPlayers(playerCount)
        setName(name)
        setIndex(index)
        setSnake(SNAKE_START[index])
        setColor(SNAKE_COLORS[index])
        setMove(MOVE_START[index])
      })
    }
    return () => socket.off()
  }, [props.location.state])

  useEffect(() => {
    socket.on(`total players`, (totalPlayers) => {
      setNumPlayers(totalPlayers)
      if (numPlayers > 1 && !otherSnake) {
        socket.emit(`other snake missing`)
      }
    })

    return () => socket.off(`total players`)
  })

  useEffect(() => {
    socket.on(`set other snake`, (otherSnake, otherColor) => {
      console.log(`setting other snake for ${name}`)
      setOtherSnake(otherSnake)
      setOtherColor(otherColor)
    })

    socket.on(`send init snake`, () => socket.emit(`move snake`, snake, color))

    socket.on(`set votes`, (votesCast) => setVotes(votesCast))

    socket.on(`let the games begin`, () => startGame())

    return () => {
      socket.off(`set other snake`)
      socket.off(`send init snake`)
      socket.off(`set votes`)
      socket.off(`let the games begin`)
    }
  })

  const startGame = () => {
    setDead(false)
    setSpeed(SPEED)
    setSnake(SNAKE_START[index])
    setColor(SNAKE_COLORS[index])
    setMove(MOVE_START[index])
  }

  const resetGame = () => {
    setDead(true)
    setVotes(0)
    setScore(0)
    setSpeed(null)
    setSnake(SNAKE_START[index])
    setFood(FOOD_START)
    setMove(MOVE_START[index])
    socket.emit(`update votes`, { increment: false })
  }

  const castVote = () => {
    if (votes === numPlayers) return
    if (didCastVote) {
      setDidCastVote(false)
      socket.emit(`update votes`, { increment: false })
    } else {
      setDidCastVote(true)
      socket.emit(`update votes`, { increment: true })
    }
  }

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
      setDead(true)
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

  // render if player is dead, but other player isn't
  useEffect(() => {
    if (dead) {
      context = canvasRef.current.getContext("2d")
      context.setTransform(SCALE, 0, 0, SCALE, 0, 0)
      context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1])
      if (snake) {
        snake.forEach(([x, y]) => {
          context.fillStyle = "lightgreen"
          context.fillRect(x, y + 0.1, 1.01, 1.01)
          context.fillRect(x, y - 0.1, 1.01, 1.01)
          context.fillRect(x - 0.1, y, 1.01, 1.01)
          context.fillRect(x + 0.1, y, 1.01, 1.01)
          context.fillStyle = color
          context.fillRect(x, y, 1, 1)
        })
      }
      if (otherSnake) {
        otherSnake.forEach(([x, y]) => {
          context.fillStyle = "lightgreen"
          context.fillRect(x, y + 0.1, 1.01, 1.01)
          context.fillRect(x, y - 0.1, 1.01, 1.01)
          context.fillRect(x - 0.1, y, 1.01, 1.01)
          context.fillRect(x + 0.1, y, 1.01, 1.01)
          context.fillStyle = otherColor
          context.fillRect(x, y, 1, 1)
        })
      }
      if (food) {
        context.fillStyle = "lightgreen"
        context.fillRect(food[0], food[1], 1, 1)
      }
    }
  }, [dead, otherSnake, otherColor])

  // render if player is alive
  useEffect(() => {
    socket.emit(`move snake`, snake, color)
    context = canvasRef.current.getContext("2d")
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0)
    context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1])
    if (snake) {
      snake.forEach(([x, y]) => {
        context.fillStyle = "lightgreen"
        context.fillRect(x, y + 0.1, 1.01, 1.01)
        context.fillRect(x, y - 0.1, 1.01, 1.01)
        context.fillRect(x - 0.1, y, 1.01, 1.01)
        context.fillRect(x + 0.1, y, 1.01, 1.01)
        context.fillStyle = color
        context.fillRect(x, y, 1, 1)
      })
    }
    if (otherSnake) {
      otherSnake.forEach(([x, y]) => {
        context.fillStyle = "lightgreen"
        context.fillRect(x, y + 0.1, 1.01, 1.01)
        context.fillRect(x, y - 0.1, 1.01, 1.01)
        context.fillRect(x - 0.1, y, 1.01, 1.01)
        context.fillRect(x + 0.1, y, 1.01, 1.01)
        context.fillStyle = otherColor
        context.fillRect(x, y, 1, 1)
      })
    }
    if (food) {
      context.fillStyle = "lightgreen"
      context.fillRect(food[0], food[1], 1, 1)
    }
  }, [snake, color, food])

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
          className={`btn btn-success border-light rounded-pill mx-3 mt-3 my-4 px-3 ${
            numPlayers === votes && `disabled`
          }`}
          onClick={() => castVote()}
        >
          {didCastVote ? `Retract Vote` : `Vote`}
        </button>
      </div>
    </div>
  )
}
