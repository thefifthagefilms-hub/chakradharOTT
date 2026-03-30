export const BOARD_SIZE = 16;
export const TICK_MS = 140;

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const INITIAL_DIRECTION = "RIGHT";

function createInitialSnake(boardSize) {
  const center = Math.floor(boardSize / 2);

  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
}

function isSameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function getAvailableCells(snake, boardSize) {
  const availableCells = [];

  for (let y = 0; y < boardSize; y += 1) {
    for (let x = 0; x < boardSize; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        availableCells.push({ x, y });
      }
    }
  }

  return availableCells;
}

export function isOppositeDirection(currentDirection, nextDirection) {
  if (!currentDirection || !nextDirection) {
    return false;
  }

  const currentVector = DIRECTIONS[currentDirection];
  const nextVector = DIRECTIONS[nextDirection];

  return (
    currentVector.x + nextVector.x === 0 &&
    currentVector.y + nextVector.y === 0
  );
}

export function placeFood(snake, boardSize, random = Math.random) {
  const availableCells = getAvailableCells(snake, boardSize);

  if (!availableCells.length) {
    return null;
  }

  const index = Math.floor(random() * availableCells.length);
  return availableCells[index];
}

export function createInitialGameState(
  boardSize = BOARD_SIZE,
  random = Math.random
) {
  const snake = createInitialSnake(boardSize);

  return {
    boardSize,
    snake,
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    food: placeFood(snake, boardSize, random),
    score: 0,
    status: "idle",
  };
}

export function queueDirection(state, requestedDirection) {
  if (!DIRECTIONS[requestedDirection]) {
    return state;
  }

  if (isOppositeDirection(state.direction, requestedDirection)) {
    return state;
  }

  return {
    ...state,
    nextDirection: requestedDirection,
  };
}

export function togglePause(state) {
  if (state.status === "running") {
    return { ...state, status: "paused" };
  }

  if (state.status === "paused" || state.status === "idle") {
    return { ...state, status: "running" };
  }

  return state;
}

export function stepGame(state, random = Math.random) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.nextDirection;
  const vector = DIRECTIONS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.boardSize ||
    nextHead.y >= state.boardSize;

  if (hitWall) {
    return {
      ...state,
      direction,
      status: "game-over",
    };
  }

  const isEating = state.food && isSameCell(nextHead, state.food);
  const collisionBody = isEating ? state.snake : state.snake.slice(0, -1);
  const hitSelf = collisionBody.some((segment) => isSameCell(segment, nextHead));

  if (hitSelf) {
    return {
      ...state,
      direction,
      status: "game-over",
    };
  }

  const snake = [nextHead, ...state.snake];

  if (!isEating) {
    snake.pop();
  }

  return {
    ...state,
    snake,
    direction,
    nextDirection: direction,
    food: isEating ? placeFood(snake, state.boardSize, random) : state.food,
    score: state.score + (isEating ? 1 : 0),
    status: state.food && isEating && snake.length === state.boardSize ** 2
      ? "paused"
      : state.status,
  };
}
