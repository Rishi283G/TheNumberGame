// DOM Elements
const userInput = document.querySelector("#input");
const submitBtn = document.querySelector("#submit");
const startBtn = document.querySelector("#start");
const messageEl = document.querySelector("#message");
const messageContainer = document.querySelector("#message-container");
const attemptsEl = document.querySelector("#attempts");
const bestScoreEl = document.querySelector("#best-score");
const timerEl = document.querySelector("#timer");
const rangeProgressEl = document.querySelector("#range-progress");
const currentMinEl = document.querySelector("#current-min");
const currentMaxEl = document.querySelector("#current-max");
const guessHistoryEl = document.querySelector("#guess-history");
const minRangeEl = document.querySelector("#min-range");
const maxRangeEl = document.querySelector("#max-range");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
const backgroundShapes = document.querySelector("#background-shapes");

// Game state
let randomNumber;
let gameStarted = false;
let attempts = 0;
let timer = 0;
let timerInterval;
let minNum = 1;
let maxNum = 100;
let currentMin = minNum;
let currentMax = maxNum;
let guessHistory = [];
let bestScores = {
  easy: localStorage.getItem("bestScore-easy") || "-",
  medium: localStorage.getItem("bestScore-medium") || "-",
  hard: localStorage.getItem("bestScore-hard") || "-",
};
let currentDifficulty = "easy";

// Initialize the game
function init() {
  createBackgroundShapes();
  loadBestScore();
  setupEventListeners();
}

// Create background shapes
function createBackgroundShapes() {
  for (let i = 0; i < 15; i++) {
    const size = Math.random() * 80 + 40;
    const shape = document.createElement("div");
    shape.classList.add("shape");
    shape.style.width = `${size}px`;
    shape.style.height = `${size}px`;
    shape.style.left = `${Math.random() * 100}%`;
    shape.style.top = `${Math.random() * 100}%`;
    shape.style.animationDelay = `${Math.random() * 5}s`;
    shape.style.animationDuration = `${Math.random() * 10 + 10}s`;
    shape.style.opacity = Math.random() * 0.5 + 0.1;
    backgroundShapes.appendChild(shape);
  }
}

// Set up event listeners
function setupEventListeners() {
  startBtn.addEventListener("click", startGame);
  submitBtn.addEventListener("click", checkGuess);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !submitBtn.disabled) {
      checkGuess();
    }
  });

  difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (gameStarted) {
        showMessage("Please finish current game first", "message-error");
        return;
      }

      difficultyBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      minNum = parseInt(btn.dataset.min);
      maxNum = parseInt(btn.dataset.max);

      if (maxNum === 100) currentDifficulty = "easy";
      else if (maxNum === 500) currentDifficulty = "medium";
      else currentDifficulty = "hard";

      minRangeEl.textContent = minNum;
      maxRangeEl.textContent = maxNum;
      currentMinEl.textContent = minNum;
      currentMaxEl.textContent = maxNum;
      currentMin = minNum;
      currentMax = maxNum;

      loadBestScore();
      updateRangeIndicator();
    });
  });
}

// Start the game
function startGame() {
  // Reset game state
  gameStarted = true;
  attempts = 0;
  guessHistory = [];
  guessHistoryEl.innerHTML = "";
  timer = 0;
  currentMin = minNum;
  currentMax = maxNum;

  // Generate random number
  randomNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

  // Update UI
  showMessage("Game started! Enter your guess", "message-neutral");
  userInput.disabled = false;
  submitBtn.disabled = false;
  userInput.value = "";
  userInput.focus();
  attemptsEl.textContent = attempts;
  currentMinEl.textContent = minNum;
  currentMaxEl.textContent = maxNum;
  timerEl.textContent = "0s";

  updateRangeIndicator();

  // Start timer
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    timerEl.textContent = timer + "s";
  }, 1000);

  // Animation
  startBtn.classList.add("btn-pulse");
  setTimeout(() => startBtn.classList.remove("btn-pulse"), 500);
}

// Check user guess
function checkGuess() {
  if (!gameStarted) {
    showMessage("Please start the game first", "message-error");
    return;
  }

  const chosenNum = parseInt(userInput.value);

  // Validate input
  if (isNaN(chosenNum) || chosenNum < minNum || chosenNum > maxNum) {
    showMessage(
      `Please enter a number between ${minNum} and ${maxNum}`,
      "message-error"
    );
    return;
  }

  // Increment attempts
  attempts++;
  attemptsEl.textContent = attempts;

  // Check guess
  if (chosenNum === randomNumber) {
    gameWon();
  } else {
    if (chosenNum < randomNumber) {
      currentMin = Math.max(currentMin, chosenNum + 1);
      currentMinEl.textContent = currentMin;
      showMessage("Too low! Try higher", "message-hint");
      addGuessToHistory(chosenNum, "low");
    } else {
      currentMax = Math.min(currentMax, chosenNum - 1);
      currentMaxEl.textContent = currentMax;
      showMessage("Too high! Try lower", "message-hint");
      addGuessToHistory(chosenNum, "high");
    }
    updateRangeIndicator();
  }

  userInput.value = "";
  userInput.focus();
}

// Handle winning the game
function gameWon() {
  clearInterval(timerInterval);
  gameStarted = false;

  showMessage(
    `🎉 Correct! You found ${randomNumber} in ${attempts} attempts!`,
    "message-success"
  );

  userInput.disabled = true;
  submitBtn.disabled = true;

  addGuessToHistory(randomNumber, "correct");
  createConfetti();

  // Update best score
  const currentBest = bestScores[currentDifficulty];
  if (currentBest === "-" || attempts < parseInt(currentBest)) {
    bestScores[currentDifficulty] = attempts;
    localStorage.setItem(`bestScore-${currentDifficulty}`, attempts);
    bestScoreEl.textContent = attempts;

    setTimeout(() => {
      showMessage(
        `🏆 New best score: ${attempts} attempts!`,
        "message-success"
      );
    }, 2000);
  }
}

// Add a guess to the history display
function addGuessToHistory(number, type) {
  guessHistory.push({ number, type });

  const historyItem = document.createElement("div");
  historyItem.classList.add("history-item", `history-${type}`);
  historyItem.textContent = number;
  guessHistoryEl.appendChild(historyItem);

  // Scroll to the bottom
  guessHistoryEl.scrollTop = guessHistoryEl.scrollHeight;
}

// Update the range indicator
function updateRangeIndicator() {
  const totalRange = maxNum - minNum;
  const currentRange = currentMax - currentMin;
  const leftPercent = ((currentMin - minNum) / totalRange) * 100;
  const widthPercent = (currentRange / totalRange) * 100;

  rangeProgressEl.style.left = `${leftPercent}%`;
  rangeProgressEl.style.width = `${widthPercent}%`;
}

// Show a message with animation
function showMessage(text, className) {
  messageEl.textContent = text;
  messageEl.className = className;

  messageContainer.style.animation = "none";
  // Trigger reflow
  void messageContainer.offsetWidth;
  messageContainer.style.animation = "fadeIn 0.3s forwards";
}

// Create confetti animation when winning
function createConfetti() {
  const colors = [
    "#fd79a8",
    "#6c5ce7",
    "#00b894",
    "#fdcb6e",
    "#0984e3",
    "#ff7675",
  ];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");

    // Random styling
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;

    // Random shape
    const shape = Math.floor(Math.random() * 4);
    if (shape === 0) {
      confetti.style.borderRadius = "50%"; // Circle
    } else if (shape === 1) {
      confetti.style.borderRadius = "0"; // Square
    } else if (shape === 2) {
      confetti.style.width = `${size / 3}px`; // Rectangle
      confetti.style.height = `${size}px`;
    } else {
      // Triangle
      confetti.style.width = "0";
      confetti.style.height = "0";
      confetti.style.backgroundColor = "transparent";
      confetti.style.borderLeft = `${size / 2}px solid transparent`;
      confetti.style.borderRight = `${size / 2}px solid transparent`;
      confetti.style.borderBottom = `${size}px solid ${
        colors[Math.floor(Math.random() * colors.length)]
      }`;
    }

    // Random position
    confetti.style.left = `${Math.random() * 100}%`;

    // Animation
    confetti.style.animation = `confettiFall ${
      Math.random() * 3 + 2
    }s forwards`;
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;

    document.body.appendChild(confetti);

    // Remove after animation
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
}

// Load best score
function loadBestScore() {
  bestScoreEl.textContent = bestScores[currentDifficulty];
}

// Initialize on load
window.addEventListener("load", init);