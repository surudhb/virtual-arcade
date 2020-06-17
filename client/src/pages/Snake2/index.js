import React, { useState, useEffect, useRef } from "react";
import { useInterval } from "../../hooks";
import io from "socket.io-client";
import { DIRECTIONS, CANVAS_SIZE, SCALE } from "../Snake/constants";

const socket = io.connect(`localhost:4000`);

// snake = id : { snake, colour }

export default (props) => {
  const canvasRef = useRef(null);

  const [snake, setSnake] = useState();
  const [color, setColor] = useState();
  const [otherSnakes, setOtherSnakes] = useState([]);

  const [food, setFood] = useState();
  const [move, setMove] = useState();
  const [speed, setSpeed] = useState(null);

  const [gameOver, setGameOver] = useState(false);

  const [newPlayer, setNewPlayer] = useState({});
  const [votes, setVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingFinished, setVotingFinished] = useState(false);

  const { name } = props.location.state;

  // initing player on component mount
  useEffect(() => {
    socket.emit(
      `initPlayer`,
      name,
      (startSnake, startMove, otherSnakes, color, startVotes) => {
        console.log(`initing player`);
        setMove(startMove);
        setSnake(startSnake);
        setOtherSnakes(otherSnakes);
        setColor(color);
        setVotes(startVotes);
      }
    );

    return () => {
      socket.off(`initPlayer`);
    };
  }, [name]);

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
  }, [snake, food, otherSnakes, newPlayer]);

  const startGame = () => {
    console.log(`started game.`);
    setSpeed(90);
  };

  const moveSnake = (keyCode) => setMove(DIRECTIONS[keyCode]);

  onkeydown = (e) => {
    const { keyCode } = e;
    if (keyCode >= 37 && keyCode <= 40) {
      e.preventDefault();
      moveSnake(keyCode);
    }
  };

  // function that updates snake every x seconds
  const gameLoop = () => {
    console.log(`game running ${new Date().toDateString}`);
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
