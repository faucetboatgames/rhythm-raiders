// Game State
// Functions and variables from ui.ts (like updateLevelDisplay, sequenceDisplayContainer, etc.)
// are expected to be globally available after ui.js is loaded.
let currentLevel = 1;
const maxLevels = 3;
let currentSequence: number[] = [];
let playerSequence: number[] = [];
let awaitingPlayerInput = false;
let playerTurnTimeout: number | undefined;

// Touch handling variables
let touchStartX: number | null = null;
let touchStartY: number | null = null;
let touchHandled = false;
const TOUCH_THRESHOLD = 40; // Minimum pixels for direction detection

// Key mapping (0: Up, 1: Down, 2: Left, 3: Right)
const keyMap: { [key: string]: number } = {
    'ArrowUp': 0,
    'ArrowDown': 1,
    'ArrowLeft': 2,
    'ArrowRight': 3,
    // For convenience, map ASDF as well
    'KeyW': 0, 'KeyA': 2, 'KeyS': 1, 'KeyD': 3, // WASD
    'KeyI': 0, 'KeyJ': 2, 'KeyK': 1, 'KeyL': 3  // IJKL for right hand
};

// Level Definitions
interface Level {
    sequenceLength: number;
    beatDuration: number; // milliseconds
    inputTimeout: number; // milliseconds for player to complete sequence
}

const levels: Level[] = [
    { sequenceLength: 4, beatDuration: 700, inputTimeout: 9000 }, // Level 1
    { sequenceLength: 6, beatDuration: 600, inputTimeout: 11000 }, // Level 2
    { sequenceLength: 8, beatDuration: 500, inputTimeout: 13000 }, // Level 3
];

function generateSequence(length: number): number[] {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
        sequence.push(Math.floor(Math.random() * 4)); // 0, 1, 2, or 3
    }
    return sequence;
}

async function startLevel(levelNumber: number): Promise<void> {
    if (levelNumber > maxLevels) {
        winGame();
        return;
    }
    currentLevel = levelNumber;
    playerSequence = [];
    awaitingPlayerInput = false;
    clearTimeout(playerTurnTimeout);
    resetTouchState(); // Clear any pending touch state

    updateLevelDisplay(currentLevel);
    displayFeedback(`Level ${currentLevel}: Watch the sequence!`, null);
    hideRetryButton(); // Hide retry button when level starts

    const levelConfig = levels[currentLevel - 1];
    currentSequence = generateSequence(levelConfig.sequenceLength);

    await showSequence(currentSequence, levelConfig.beatDuration);

    displayFeedback('Your turn! Repeat the sequence.', null);
    awaitingPlayerInput = true;
    // Set a timeout for the player's turn
    playerTurnTimeout = window.setTimeout(() => {
        if (awaitingPlayerInput) { // Check if still waiting (player hasn't completed or failed yet)
            handleIncorrectInput(true); // Pass true to indicate timeout
        }
    }, levelConfig.inputTimeout);
}

function handleKeyPress(event: KeyboardEvent): void {
    if (!awaitingPlayerInput) return;

    const keyPressed = event.key;
    if (keyMap.hasOwnProperty(keyPressed)) {
        const keyIndex = keyMap[keyPressed];
        handleDirectionInput(keyIndex);
    }
}

function handleDirectionInput(direction: number): void {
    if (!awaitingPlayerInput) return;

    // Validate direction is within expected range
    if (direction < 0 || direction > 3) return;

    playerSequence.push(direction);
    flashKey(direction, true); // Flash key immediately on press

    // Check if the pressed key is correct so far
    const currentInputIndex = playerSequence.length - 1;
    if (playerSequence[currentInputIndex] !== currentSequence[currentInputIndex]) {
        handleIncorrectInput();
        return;
    }

    // If sequence is complete and correct
    if (playerSequence.length === currentSequence.length) {
        handleCorrectSequence();
    }
}

function handleTouchStart(event: TouchEvent): void {
    if (!awaitingPlayerInput || event.touches.length !== 1) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchHandled = false;
}

function handleTouchMove(event: TouchEvent): void {
    if (!awaitingPlayerInput || touchHandled || event.touches.length !== 1) return;
    
    event.preventDefault();
}

function handleTouchEnd(event: TouchEvent): void {
    if (!awaitingPlayerInput || touchHandled || touchStartX === null || touchStartY === null) return;
    
    event.preventDefault();
    
    // Get the final touch position from changedTouches (since touches array is empty on touchend)
    if (event.changedTouches.length !== 1) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Calculate absolute deltas to determine primary direction
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Check if movement exceeds threshold
    if (Math.max(absDeltaX, absDeltaY) < TOUCH_THRESHOLD) {
        resetTouchState();
        return;
    }
    
    let direction: number;
    
    // Determine direction based on larger delta
    if (absDeltaX > absDeltaY) {
        // Horizontal movement
        direction = deltaX > 0 ? 3 : 2; // Right (3) or Left (2)
    } else {
        // Vertical movement
        direction = deltaY > 0 ? 1 : 0; // Down (1) or Up (0)
    }
    
    touchHandled = true;
    resetTouchState();
    handleDirectionInput(direction);
}

function resetTouchState(): void {
    touchStartX = null;
    touchStartY = null;
    touchHandled = false;
}

function handleCorrectSequence(): void {
    awaitingPlayerInput = false;
    clearTimeout(playerTurnTimeout);
    displayFeedback('Correct! System layer bypassed.', true);
    // Disable input briefly to prevent accidental next level start
    disablePlayerInput();
    setTimeout(() => {
        enablePlayerInput();
        if (currentLevel < maxLevels) {
            startLevel(currentLevel + 1);
        } else {
            winGame();
        }
    }, 1500); // Wait 1.5 seconds before next level or win
}

function handleIncorrectInput(isTimeout: boolean = false): void {
    awaitingPlayerInput = false;
    clearTimeout(playerTurnTimeout);
    const message = isTimeout ? 'Timeout! System alert triggered.' : 'Incorrect! System alert triggered.';
    displayFeedback(message, false);
    // Flash the whole sequence display red or something similar
    if (sequenceDisplayContainer) {
        const originalBorder = sequenceDisplayContainer.style.borderColor;
        sequenceDisplayContainer.style.borderColor = '#ff0000';
        setTimeout(() => {
            sequenceDisplayContainer.style.borderColor = originalBorder;
        }, 500);
    }
    showRetryButton();
}

function retryCurrentLevel(): void {
    displayFeedback('Retrying level...', null);
    hideRetryButton();
    // Add a small delay before restarting the level for better UX
    setTimeout(() => {
        startLevel(currentLevel);
    }, 500);
}

function winGame(): void {
    awaitingPlayerInput = false;
    clearTimeout(playerTurnTimeout);
    showWinScreen();
}

function resetGame(): void {
    currentLevel = 1;
    playerSequence = [];
    currentSequence = [];
    awaitingPlayerInput = false;
    clearTimeout(playerTurnTimeout);
    resetTouchState(); // Clear any pending touch state
    resetUIForNewGame();
    updateLevelDisplay(currentLevel);
}

// Make functions accessible if not using modules (global scope)
// Ensure ui.ts functions are available globally or via an object
// e.g., UI.updateLevelDisplay, UI.showSequence etc.
// For this project, assuming they are global as per ui.ts structure.
