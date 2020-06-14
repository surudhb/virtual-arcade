import React, { useState, useEffect, useRef } from "react";
import { useInterval } from "../../hooks";
import io from "socket.io-client";

const socket = io.connect(`192.168.0.11:4000`);

export default (props) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState();
  const [otherSnakes, setOtherSnakes] = useState({});
  const [food, setFood] = useState();
  const [move, setMove] = useState();
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState();

  const name = props.location.state;

  socket.emit(`initPlayer`, (newSnake, newMove, otherSnakes) => {
    setMove(newMove);
    setSnake(newSnake);
  });

  // cast vote to start
  // game starts after everybody votes to start
  const voteToStart = () => {
    socket.emit(`voteToStart`);
  };

  // each snake has an internal representation of all snakes
  // this gets updated when a new client joins

  // new move by snake passed to other snakes

  //   then all snakes are drawn at once for each canvas

  return <div>Snake 2</div>;
};
