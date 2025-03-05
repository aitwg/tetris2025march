import { initGame, restartGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('tetris');
  const context = canvas.getContext('2d');
  const scoreElement = document.getElementById('score-value');
  const newGameButton = document.getElementById('new-game');

  initGame(context, scoreElement);
  newGameButton.addEventListener('click', () => restartGame(context, scoreElement));
});
