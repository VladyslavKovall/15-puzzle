const SIZE = 4; 
const TOTAL = SIZE * SIZE;

const boardEl = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');
const messageEl = document.getElementById('message');

let state = []; 
let moves = 0; 
let timerId = null; 
let seconds = 0; 
let started = false; 


function initSolved() {
  state = Array.from({ length: TOTAL }, (_, i) => i + 1);
  state[TOTAL - 1] = 0; 
}


// Малює поточний стан дошки 
function render() {
  boardEl.innerHTML = '';
  state.forEach((val, idx) => {
    const tile = document.createElement('div');
    tile.className = 'tile' + (val === 0 ? ' empty' : '');
    tile.dataset.idx = idx;

    if (val !== 0) tile.textContent = val; 
    else tile.setAttribute('aria-hidden', 'true');

    tile.addEventListener('click', () => onTileClick(idx));
    boardEl.appendChild(tile);
  });
}

// Обробник кліку по плитці
function onTileClick(idx) {
  if (state[idx] === 0) return; 
  const emptyIdx = state.indexOf(0);
  if (isAdjacent(idx, emptyIdx)) { 
    swapTiles(idx, emptyIdx); 
    afterMove(); 
  }
}

// Перевіряє, чи дві клітинки поряд 
function isAdjacent(a, b) {
  if (Math.floor(a / SIZE) === Math.floor(b / SIZE) && Math.abs(a - b) === 1) return true;
  if (Math.abs(a - b) === SIZE) return true;
  return false;
}

// Міняє місцями дві клітинки 
function swapTiles(a, b) {
  [state[a], state[b]] = [state[b], state[a]];
  moves++;
  movesEl.textContent = moves;
  render(); 
}

// Викликається після кожного ходу: запускає таймер та перевіряє виграш
function afterMove() {
  if (!started) startTimer(); 
  if (checkWin()) {          
    stopTimer();
    showWin();
  }
}

// Перевіряє, чи масив у виграшному стані (1…15, 0)
function checkWin() {
  for (let i = 0; i < TOTAL - 1; i++) {
    if (state[i] !== i + 1) return false;
  }
  return state[TOTAL - 1] === 0;
}

// Показує повідомлення про перемогу
function showWin() {
  messageEl.innerHTML =
    `<div class="won-banner">Вітаю! Розв’язано за ${moves} ходів • ${formatTime(seconds)}</div>`;
}

// Запускає таймер, який рахує секунди
function startTimer() {
  started = true;
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    seconds++;
    timeEl.textContent = formatTime(seconds);
  }, 1000);
}

// Зупиняє таймер
function stopTimer() {
  started = false;
  if (timerId) { clearInterval(timerId); timerId = null; }
}

// Скидає гру у розв’язаний стан
function resetGame() {
  stopTimer();
  seconds = 0;
  timeEl.textContent = formatTime(seconds);
  moves = 0;
  movesEl.textContent = moves;
  messageEl.textContent = '';
  initSolved();
  render();
}

// Перемішує плитки 
function shuffle() {
  let arr;
  do {
    
    arr = Array.from({ length: TOTAL }, (_, i) => i + 1);
    arr[TOTAL - 1] = 0;
    
    for (let i = TOTAL - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!isSolvable(arr) || isSolvedArray(arr));

  state = arr;
  moves = 0;
  movesEl.textContent = moves;
  seconds = 0;
  timeEl.textContent = formatTime(seconds);
  messageEl.textContent = '';
  stopTimer();
  render();
}

// Перевіряє, чи масив уже розв’язаний
function isSolvedArray(arr) {
  for (let i = 0; i < TOTAL - 1; i++) {
    if (arr[i] !== i + 1) return false;
  }
  return arr[TOTAL - 1] === 0;
}

// Перевіряє, чи ця конфігурація розв’язна 
function isSolvable(arr) {
  const flat = arr.filter(n => n !== 0);
  let inversions = 0;

  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++;
    }
  }
  const blankIndex = arr.indexOf(0);
  const rowFromTop = Math.floor(blankIndex / SIZE) + 1;
  const rowFromBottom = SIZE - (rowFromTop - 1);
  if (SIZE % 2 === 1) {
    return inversions % 2 === 0;
  } else {
    return (inversions + rowFromBottom) % 2 === 0;
  }
}

// Форматує час у хвилини:секунди
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}



shuffleBtn.addEventListener('click', shuffle);
resetBtn.addEventListener('click', resetGame);


initSolved();
render();
