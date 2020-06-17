import React, { useState, useEffect, useRef } from "react";
import { useInterval } from "../../hooks";
import io from "socket.io-client";
import { DIRECTIONS, CANVAS_SIZE, SCALE, FOOD_START } from "../Snake/constants";

const socket = io.connect(`localhost:4000`, { forceNew: true });

export default (props) => {
  const canvasRef = useRef(null);

  const [snake, setSnake] = useState();
  const [color, setColor] = useState();
  const [otherSnakes, setOtherSnakes] = useState([]);

  const [score, setScore] = useState(0);

  const [food, setFood] = useState(FOOD_START);
  const [move, setMove] = useState();
  const [speed, setSpeed] = useState(null);

  const [gameOver, setGameOver] = useState(false);

  const [newPlayer, setNewPlayer] = useState({});
  const [votes, setVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  const { name } = props.location.state;

  // initing player on component mount
  useEffect(() => {
    socket.emit(
      `initPlayer`,
      name,
      ({ startSnake, startDirection, color }, otherSnakes, startVotes) => {
        console.log(`initing player`);
        setMove(startDirection);
        setSnake(startSnake);
        setOtherSnakes(otherSnakes);
        setColor(color);
        setVotes(startVotes);
      }
    );

    return () => {
      socket.off(`initPlayer`);
    };
  }, [name, setColor]);

  // attaching listener for player leaving
  useEffect(() => {
    socket.on(`playerLeft`, (oldPlayerID) => {
      console.log(`player left: ${oldPlayerID}`);
      const filteredSnakes = otherSnakes.filter((s) => s.id !== oldPlayerID);
      setOtherSnakes(filteredSnakes);
    });

    return () => socket.off(`playerLeft`);
  }, [otherSnakes]);

  // listener for new player joined
  useEffect(() => {
    socket.on(`newPlayerJoined`, (newPlayer) => {
      console.log(`new player joined`);
      otherSnakes.push(newPlayer);
      setNewPlayer(newPlayer);
    });
    return () => socket.off(`newPlayerJoined`);
  }, [otherSnakes]);

  // listener for updating votes on screen
  useEffect(() => {
    socket.on(`updateVotes`, (subtract = false) => {
      console.log(`updated votes`);
      if (subtract) setVotes(Math.max(votes - 1, 0));
      else setVotes(votes + 1);
    });

    return () => socket.off(`updateVotes`);
  }, [votes]);

  // listener for starting game
  useEffect(() => {
    socket.on(`startGame`, () => {
      console.log(`starting game...`);
      setTimeout(startGame, 3000);
    });
    return () => socket.off(`startGame`);
  }, []);

  // listener to paint canvas when snake, food or otherSnakes changes
  useEffect(() => {
    console.log(`redrawing canvas ${snake} ${food} ${otherSnakes}`);
    const context = canvasRef.current.getContext(`2d`);
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
    context.fillStyle = color;
    if (snake) snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
    if (otherSnakes) {
      otherSnakes.forEach((s) => {
        context.fillStyle = s.color;
        if (s.snake) s.snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
      });
    }
    context.fillStyle = "lavender";
    context.fillRect(food[0], food[1], 1, 1);
  }, [color, snake, food, otherSnakes, newPlayer]);

  onkeydown = (e) => {
    const { keyCode } = e;
    if (keyCode >= 37 && keyCode <= 40) {
      e.preventDefault();
      moveSnake(keyCode);
    }
  };

  const startGame = () => {
    console.log(`started game.`);
    setSpeed(90);
  };

  const endGame = () => {
    setSpeed(null);
    setScore(0);
    alert(`Game over`);
  };

  const moveSnake = (keyCode) => setMove(DIRECTIONS[keyCode]);

  const randomFood = (idx) =>
    Math.floor((Math.random() * CANVAS_SIZE[idx]) / SCALE);

  const createFood = () => {
    let x = randomFood(0);
    let y = randomFood(1);
    while (hasCollidedWithSnake([x, y])) {
      x = randomFood(0);
      y = randomFood(1);
    }
    return [x, y];
  };

  const hasEatenFood = (head) => head[0] === food[0] && head[1] === food[1];

  const isAxisCollision = (axis, idx) =>
    axis < 0 || axis * SCALE >= CANVAS_SIZE[idx];

  const hasCollidedWithWall = (head) =>
    isAxisCollision(head[0], 0) || isAxisCollision(head[1], 1);

  const hasCollidedWithSnake = (head) => {
    for (const part of snake) {
      if (part[0] === head[0] && part[1] === head[1]) return true;
    }
    return false;
  };

  const hasCollided = (head) =>
    hasCollidedWithWall(head) || hasCollidedWithSnake(head);

  // function that updates snake every x seconds
  const gameLoop = () => {
    setScore(score + 1);
    console.log(`game running ${new Date().toDateString}`);
    const newSnake = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = [newSnake[0][0] + move[0], newSnake[0][1] + move[1]];
    if (hasCollided(newSnakeHead)) {
      endGame();
    } else {
      if (hasEatenFood(newSnakeHead)) {
        setFood(createFood());
      } else {
        newSnake.pop();
      }
      newSnake.unshift(newSnakeHead);
      setSnake(newSnake);
      socket.emit(`snakeMoved`, newSnake);
    }
  };

  useInterval(gameLoop, speed);

  // cast vote to start
  // game starts after everybody votes to start
  const castVote = () => {
    if (!hasVoted) {
      setVotes(votes + 1);
      socket.emit(`addVote`, name);
      setHasVoted(true);
    } else {
      console.log(`Vote already cast.`);
    }
  };

  return (
    <div
      className="container-fluid text-center bg-dark text-white"
      style={{ height: "100vh" }}
    >
      <p>{socket.id}</p>
      <div>
        <p>
          My Color
          <div
            style={{ background: color, height: `50px`, width: `50px` }}
            className="m-auto"
          ></div>
        </p>
        <div>Score: {score}</div>
      </div>
      <div>
        <button
          className="btn btn-primary border-light rounded-pill mx-3 my-4 px-3"
          onClick={() => castVote()}
        >
          Vote To Start
        </button>
        <span>
          Total Votes: {votes}/{otherSnakes.length + 1}
        </span>
      </div>
      <div>
        <canvas
          style={{
            border: "1px dashed white",
            borderRadius: "7px",
          }}
          ref={canvasRef}
          width={`${CANVAS_SIZE[0]}px`}
          height={`${CANVAS_SIZE[1]}px`}
        />
      </div>
    </div>
  );
};
