const CANVAS_SIZE = [700, 700];

const FOOD_START = [17, 17];

const SCALE = 21;

const SPEED = 150;

const DIRECTIONS = {
  38: [0, -1], // up relative to top-left canvas corner
  40: [0, 1], // down relative to top-left canvas corner
  37: [-1, 0], // left
  39: [1, 0], // right
};

export { CANVAS_SIZE, FOOD_START, SCALE, SPEED, DIRECTIONS };
