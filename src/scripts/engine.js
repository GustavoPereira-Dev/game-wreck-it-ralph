const state = {
  view: {
    squares: document.querySelectorAll(".square"),
    timeLeft: document.querySelector("#time-left"),
    score: document.querySelector("#score"),
    livesEl: document.querySelector(".menu-lives h2"),
  },
  values: {
    level: 1,
    lives: 3,
    score: 0,
    previousLifeScore: 0,
    pointsThisLevel: 0,
    time: 60,
    currentTime: 100,
    gameVelocity: 3000,
    hitPosition: 0,
    isGameOver: false,
  },
  actions: {
    moveTimer: null,
    countdownTimer: null,
  },
};

function updateHUD() {
  state.view.score.textContent = state.values.score;
  state.view.timeLeft.textContent = state.values.currentTime;
  state.view.livesEl.textContent = `x${state.values.lives}`;
}

function playSound(audioName) {
  const audio = new Audio(`./src/audios/${audioName}.m4a`);
  audio.volume = 0.2;
  audio.play();
}

function randomSquare() {
  state.view.squares.forEach((square) => square.classList.remove("enemy"));

  const index = Math.floor(Math.random() * 9);
  const selected = state.view.squares[index];
  selected.classList.add("enemy");
  state.values.hitPosition = selected.id;

  setTimeout(() => {
    selected.classList.remove("enemy");
    state.values.hitPosition = null;
  }, state.values.gameVelocity * 0.4);
}


function startGameLoop() {
  if (state.values.isGameOver) return;

  clearInterval(state.actions.moveTimer);
  clearInterval(state.actions.countdownTimer);

  state.values.currentTime = state.values.time;
  updateHUD();

  state.actions.moveTimer = setInterval(randomSquare, state.values.gameVelocity);

  state.actions.countdownTimer = setInterval(() => {
    state.values.currentTime--;
    updateHUD();

    if (state.values.currentTime <= 0) {
      clearInterval(state.actions.countdownTimer);
      clearInterval(state.actions.moveTimer);

      state.values.lives--;

      if (state.values.lives < 0) {
        gameOver();
      } else {
        alert(`Tempo esgotado! Você perdeu uma vida.\nVidas restantes: ${state.values.lives}`);
        startGameLoop();
      }
    }
  }, 1000);
}

function gameOver() {
  clearInterval(state.actions.countdownTimer);
  clearInterval(state.actions.moveTimer);
  state.values.isGameOver = true;

  alert(`Game Over!\nVocê fez ${state.values.score} pontos e chegou ao nível ${state.values.level}.`);
}

function nextLevel() {
  const bonus = state.values.currentTime * 2;
  state.values.score += bonus;

  alert(`Avançando para o nível ${state.values.level + 1}!\nVocê ganhou ${bonus} pontos de bônus!`);

  state.values.level++;
  state.values.pointsThisLevel = 0;
  state.values.time = Math.max(10, state.values.time - 1);
  state.values.gameVelocity = Math.max(400, state.values.gameVelocity - 100);

  updateHUD();
  startGameLoop();
}

function hitEnemy(square) {
  if (state.values.isGameOver) return;

  if (square.id === state.values.hitPosition) {
    playSound("hit");

    state.values.score++;
    state.values.pointsThisLevel++;

    if (state.values.score - state.values.previousLifeScore >= 100) {
      state.values.lives++;
      state.values.previousLifeScore = state.values.score;
      alert("💖 Você ganhou +1 vida!");
    }

    updateHUD();
    state.values.hitPosition = null;

    const required = 5 + (state.values.level - 1) * 0.25;

    if (state.values.pointsThisLevel >= required) {
      clearInterval(state.actions.countdownTimer);
      clearInterval(state.actions.moveTimer);
      nextLevel();
    }
  }
}

function addListeners() {
  state.view.squares.forEach((square) => {
    square.addEventListener("mousedown", () => hitEnemy(square));
  });
}

function init() {
  addListeners();
  startGameLoop();
}

init();
