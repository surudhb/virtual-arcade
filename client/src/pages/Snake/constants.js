const CANVAS_SIZE = [740, 740]

const FOOD_START = [19, 19]

const MOVE_START = [
  [0, 1],
  [0, 1],
]

const SNAKE_START = [
  [
    [1, 2],
    [1, 1],
  ],
  [
    [34, 2],
    [34, 1],
  ],
]

const SNAKE_COLORS = [`black`, `brown`]

const SCALE = 20

const SPEED = 110

const DIRECTIONS = {
  38: [0, -1], // up relative to top-left canvas corner
  40: [0, 1], // down relative to top-left canvas corner
  37: [-1, 0], // left
  39: [1, 0], // right
}

export {
  CANVAS_SIZE,
  FOOD_START,
  MOVE_START,
  SNAKE_START,
  SNAKE_COLORS,
  SCALE,
  SPEED,
  DIRECTIONS,
}
