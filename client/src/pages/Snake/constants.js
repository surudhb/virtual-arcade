export default {
  CANVAS_SIZE: [700, 700],

  SNAKE_START: [
    [8, 7],
    [7, 7],
  ],

  FOOD_START: [17, 17],

  SCALE: 20,

  SPEED: 85,

  DIRECTIONS: {
    38: [0, -1], // up relative to corner coordinates
    40: [0, 1], // down relative to corner coordinates
    37: [-1, 0], // left
    39: [1, 0], // right
  },
};
