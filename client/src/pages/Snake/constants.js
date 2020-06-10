const CANVAS_SIZE = [700, 700];

const SNAKE_START = [
  [8, 7],
  [7, 7],
];

const FOOD_START = [17, 17];

const SCALE = 20;

const SPEED = 120;

const DIRECTIONS = {
  38: [0, -1], // up relative to top-left canvas corner
  40: [0, 1], // down relative to top-left canvas corner
  37: [-1, 0], // left
  39: [1, 0], // right
};

export { CANVAS_SIZE, SNAKE_START, FOOD_START, SCALE, SPEED, DIRECTIONS };
