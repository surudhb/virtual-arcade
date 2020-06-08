import React, { useState, useEffect, useRef } from "react";
import { useInterval } from "../../hooks";
import CONSTANTS from "./constants";

export default (props) => {
  const canvasRef = useRef(null);

  const [snake, setSnake] = useState(CONSTANTS.SNAKE_START);
  const [food, setFood] = useState(CONSTANTS.FOOD_START);
  const [move, setMove] = useState([1, 0]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setMove([1, 0]);
    setGameOver(false);
    setSpeed(CONSTANTS.SPEED);
  };

  const resetGame = () => {
    setSnake(CONSTANTS.SNAKE_START);
    setFood(CONSTANTS.FOOD_START);
    setSpeed(null);
    setGameOver(true);
    setMove([1, 0]);
  };

  const moveSnake = (keyCode) => setMove(CONSTANTS.DIRECTIONS[keyCode]);

  const randomFood = (idx) =>
    Math.floor((Math.random() * CONSTANTS.CANVAS_SIZE[idx]) / CONSTANTS.SCALE);

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
    axis < 0 || axis * CONSTANTS.SCALE >= CONSTANTS.CANVAS_SIZE[idx];

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

  // experiment with this -- so shady -- do you really need to deep copy
  const gameLoop = () => {
    const newSnake = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = [newSnake[0][0] + move[0], newSnake[0][1] + move[1]];
    if (hasCollided(newSnakeHead)) {
      resetGame();
    } else {
      if (hasEatenFood(newSnakeHead)) {
        setFood(createFood());
      } else {
        newSnake.pop();
      }
      newSnake.unshift(newSnakeHead);
      setSnake(newSnake);
    }
  };

  onkeydown = (e) => {
    const { keyCode } = e;
    if ((keyCode >= 37 && keyCode <= 40) || keyCode === 32) {
      e.preventDefault();
      if (keyCode >= 37 && keyCode <= 40) {
        moveSnake(keyCode);
      } else {
        gameOver ? startGame() : resetGame();
      }
    }
  };

  useInterval(gameLoop, speed);

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(CONSTANTS.SCALE, 0, 0, CONSTANTS.SCALE, 0, 0);
    context.clearRect(0, 0, CONSTANTS.CANVAS_SIZE[0], CONSTANTS.CANVAS_SIZE[1]);
    context.fillStyle = "pink";
    snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
    context.fillStyle = "lightblue";
    context.fillRect(food[0], food[1], 1, 1);
  }, [snake, food, gameOver]);

  return (
    <div className="text-center container-fluid">
      <h3>Snake</h3>
      <div>
        <canvas
          style={{ border: "1px solid black" }}
          ref={canvasRef}
          width={`${CONSTANTS.CANVAS_SIZE[0]}px`}
          height={`${CONSTANTS.CANVAS_SIZE[1]}px`}
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
      </div>
    </div>
  );
};
