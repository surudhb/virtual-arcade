import React, { useState, useEffect, useRef } from "react";
import { useInterval } from "../../hooks";
import io from "socket.io-client";
import { DIRECTIONS, CANVAS_SIZE, SCALE } from "../Snake/constants";

const socket = io.connect(`192.168.0.11:4000`);

// snake = id : { snake, colour }

export default (props) => {
  const canvasRef = useRef(null);

  const [snake, setSnake] = useState();
  const [otherSnakes, setOtherSnakes] = useState([]);

  const [food, setFood] = useState();
  const [move, setMove] = useState();
  const [speed, setSpeed] = useState(null);

  const [gameOver, setGameOver] = useState(false);

  const [newPlayer, setNewPlayer] = useState();
  const [votes, setVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingFinished, setVotingFinished] = useState(false);

  const { name } = props.location.state;

  // initing player on component mount
  useEffect(() => {
    socket.emit(`initPlayer`, name, (startSnake, startMove, otherSnakes) => {
      console.log(`initing player`);
      setMove(startMove);
      setSnake(startSnake);
      setOtherSnakes(otherSnakes);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // attaching listener for player leaving
  useEffect(() => {
    socket.on(`playerLeft`, (oldPlayerID) => {
      console.log(otherSnakes.length);
      const filteredSnakes = otherSnakes.filter((s) => s.id !== oldPlayerID);
      setOtherSnakes(filteredSnakes);
      console.log(otherSnakes.length);
    });

    return () => socket.off(`playerLeft`);
  }, [otherSnakes]);

  // listener for new player joined
  useEffect(() => {
    socket.on(`newPlayerJoined`, (newPlayer) => {
      console.log(`new player joined ${otherSnakes.length}`);
      setNewPlayer(newPlayer);
      // add new player to otherplayers arr
      otherSnakes.push(newPlayer);
      console.log(`new player joined ${otherSnakes.length}`);
    });

    return () => socket.off(`newPlayerJoined`);
  }, [otherSnakes]);

  // listener for updating votes on screen
  useEffect(() => {
    socket.on(`updateVotes`, (newTotal) => {
      console.log(`updated votes`);
      setVotes(newTotal);
    });

    return () => socket.off(`updateVotes`);
  }, []);

  // listener for starting game
  useEffect(() => {
    socket.on(`startGame`, () => startGame());
    return () => socket.off(`startGame`);
  }, []);

  // listener to paint canvas when snake, food or otherSnakes changes
  useEffect(() => {
    console.log(`redrawing canvas ${snake} ${food} ${otherSnakes}`);
    const context = canvasRef.current.getContext(`2d`);
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
  }, [snake, food, otherSnakes]);

  const startGame = () => setSpeed(90);

  const moveSnake = (keyCode) => setMove(DIRECTIONS[keyCode]);

  onkeydown = (e) => {
    const { keyCode } = e;
    if (keyCode >= 37 && keyCode <= 40) {
      e.preventDefault();
      moveSnake(keyCode);
    }
  };

  // function that updates snake every x seconds
  const gameLoop = () => {};

  // useInterval(gameLoop, speed);

  // cast vote to start
  // game starts after everybody votes to start
  const castVote = () => {
    if (!hasVoted) {
      setVotes(votes + 1);
      socket.emit(`addVote`, name, votes);
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
          style={{ border: "1px dashed white", borderRadius: "7px" }}
          ref={canvasRef}
          width={`${CANVAS_SIZE[0]}px`}
          height={`${CANVAS_SIZE[1]}px`}
        />
      </div>
    </div>
  );
};
