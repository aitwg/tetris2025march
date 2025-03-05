const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;
const COLORS = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];

let board;
let piece;
let score;
let context;
let scoreElement;
let gameInterval;

export function initGame(ctx, scoreElem) {
  context = ctx;
  scoreElement = scoreElem;
  board = createBoard();
  piece = newPiece();
  score = 0;
  scoreElement.textContent = score;

  draw();
  gameInterval = setInterval(drop, 1000);
  document.addEventListener('keydown', handleKeyPress);
}

export function restartGame(ctx, scoreElem) {
  clearInterval(gameInterval);
  document.removeEventListener('keydown', handleKeyPress);
  initGame(ctx, scoreElem);
}

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function newPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = Math.floor(Math.random() * COLORS.length) + 1;
  return {
    shape,
    color,
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: 0,
  };
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

  drawBoard();
  drawPiece(piece);
}

function drawBoard() {
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value > 0) {
        context.fillStyle = COLORS[value];
        context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function drawPiece({ shape, color, x, y }) {
  shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value > 0) {
        context.fillStyle = COLORS[color];
        context.fillRect((x + dx) * BLOCK_SIZE, (y + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function drop() {
  if (!collision(piece, board, { x: 0, y: 1 })) {
    piece.y++;
  } else {
    freeze(piece, board);
    clearLines();
    piece = newPiece();
    if (collision(piece, board, { x: 0, y: 0 })) {
      // Game over
      alert('Game Over!');
      clearInterval(gameInterval);
      document.removeEventListener('keydown', handleKeyPress);
      return;
    }
  }
  draw();
}

function collision(piece, board, offset) {
  const { shape, x, y } = piece;
  const { x: offsetX, y: offsetY } = offset;

  for (let cy = 0; cy < shape.length; cy++) {
    for (let cx = 0; cx < shape[cy].length; cx++) {
      if (shape[cy][cx] > 0) {
        const newX = x + cx + offsetX;
        const newY = y + cy + offsetY;
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
        if (newY >= 0 && board[newY][newX] > 0) return true;
      }
    }
  }
  return false;
}

function freeze(piece, board) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value > 0) {
        board[y + piece.y][x + piece.x] = piece.color;
      }
    });
  });
}

function clearLines() {
  let linesCleared = 0;
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x] === 0) continue outer;
    }
    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    y++;
    linesCleared++;
  }
  if (linesCleared > 0) {
    score += linesCleared * 100;
    scoreElement.textContent = score;
  }
}

function handleKeyPress(event) {
  switch (event.keyCode) {
    case 37: // Left
      if (!collision(piece, board, { x: -1, y: 0 })) piece.x--;
      break;
    case 39: // Right
      if (!collision(piece, board, { x: 1, y: 0 })) piece.x++;
      break;
    case 40: // Down
      drop();
      break;
    case 38: // Up
      const rotated = rotate(piece.shape);
      if (!collision({ ...piece, shape: rotated }, board, { x: 0, y: 0 })) {
        piece.shape = rotated;
      }
      break;
  }
  draw();
}

function rotate(shape) {
  const rotated = shape[0].map((_, index) =>
    shape.map(row => row[index]).reverse()
  );
  return rotated;
}
