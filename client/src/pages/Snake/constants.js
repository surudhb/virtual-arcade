const CANVAS_SIZE = [750, 750];

const FOOD_START = [19, 19];

const SCALE = 20;

const SPEED = 150;

const DIRECTIONS = {
  38: [0, -1], // up relative to top-left canvas corner
  40: [0, 1], // down relative to top-left canvas corner
  37: [-1, 0], // left
  39: [1, 0], // right
};

export { CANVAS_SIZE, FOOD_START, SCALE, SPEED, DIRECTIONS };
