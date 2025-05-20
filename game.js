var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Game State
// Functions and variables from ui.ts (like updateLevelDisplay, sequenceDisplayContainer, etc.)
// are expected to be globally available after ui.js is loaded.
var currentLevel = 1;
var maxLevels = 3;
var currentSequence = [];
var playerSequence = [];
var awaitingPlayerInput = false;
var playerTurnTimeout;
// Key mapping (0: Up, 1: Down, 2: Left, 3: Right)
var keyMap = {
    'ArrowUp': 0,
    'ArrowDown': 1,
    'ArrowLeft': 2,
    'ArrowRight': 3,
    // For convenience, map ASDF as well
    'KeyW': 0, 'KeyA': 2, 'KeyS': 1, 'KeyD': 3,
    'KeyI': 0, 'KeyJ': 2, 'KeyK': 1, 'KeyL': 3 // IJKL for right hand
};
var levels = [
    { sequenceLength: 4, beatDuration: 700, inputTimeout: 9000 },
    { sequenceLength: 6, beatDuration: 600, inputTimeout: 11000 },
    { sequenceLength: 8, beatDuration: 500, inputTimeout: 13000 }, // Level 3
];
function generateSequence(length) {
    var sequence = [];
    for (var i = 0; i < length; i++) {
        sequence.push(Math.floor(Math.random() * 4)); // 0, 1, 2, or 3
    }
    return sequence;
}
function startLevel(levelNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var levelConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (levelNumber > maxLevels) {
                        winGame();
                        return [2 /*return*/];
                    }
                    currentLevel = levelNumber;
                    playerSequence = [];
                    awaitingPlayerInput = false;
                    clearTimeout(playerTurnTimeout);
                    updateLevelDisplay(currentLevel);
                    displayFeedback("Level ".concat(currentLevel, ": Watch the sequence!"), null);
                    hideRetryButton(); // Hide retry button when level starts
                    levelConfig = levels[currentLevel - 1];
                    currentSequence = generateSequence(levelConfig.sequenceLength);
                    return [4 /*yield*/, showSequence(currentSequence, levelConfig.beatDuration)];
                case 1:
                    _a.sent();
                    displayFeedback('Your turn! Repeat the sequence.', null);
                    awaitingPlayerInput = true;
                    // Set a timeout for the player's turn
                    playerTurnTimeout = window.setTimeout(function () {
                        if (awaitingPlayerInput) { // Check if still waiting (player hasn't completed or failed yet)
                            handleIncorrectInput(true); // Pass true to indicate timeout
                        }
                    }, levelConfig.inputTimeout);
                    return [2 /*return*/];
            }
        });
    });
}
function handleKeyPress(event) {
    if (!awaitingPlayerInput)
        return;
    var keyPressed = event.key;
    if (keyMap.hasOwnProperty(keyPressed)) {
        var keyIndex = keyMap[keyPressed];
        playerSequence.push(keyIndex);
        flashKey(keyIndex, true); // Flash key immediately on press
        // Check if the pressed key is correct so far
        var currentInputIndex = playerSequence.length - 1;
        if (playerSequence[currentInputIndex] !== currentSequence[currentInputIndex]) {
            handleIncorrectInput();
            return;
        }
        // If sequence is complete and correct
        if (playerSequence.length === currentSequence.length) {
            handleCorrectSequence();
        }
    }
}
function handleCorrectSequence() {
    awaitingPlayerInput = false;
    clearTimeout(playerTurnTimeout);
    displayFeedback('Correct! System layer bypassed.', true);
    // Disable input briefly to prevent accidental next level start
    disablePlayerInput();
    setTimeout(function () {
        enablePlayerInput();
        if (currentLevel < maxLevels) {
            startLevel(currentLevel + 1);
        }
        else {
            winGame();
        }
    }, 1500); // Wait 1.5 seconds before next level or win
}
function handleIncorrectInput(isTimeout) {
    if (isTimeout === void 0) { isTimeout = false; }
    awaitingPlayerInput = false;
    clearTimeout(playerTurnTimeout);
    var message = isTimeout ? 'Timeout! System alert triggered.' : 'Incorrect! System alert triggered.';
    displayFeedback(message, false);
    // Flash the whole sequence display red or something similar
    if (sequenceDisplayContainer) {
        var originalBorder_1 = sequenceDisplayContainer.style.borderColor;
        sequenceDisplayContainer.style.borderColor = '#ff0000';
        setTimeout(function () {
            sequenceDisplayContainer.style.borderColor = originalBorder_1;
        }, 500);
    }
    showRetryButton();
}
function retryCurrentLevel() {
    displayFeedback('Retrying level...', null);
    hideRetryButton();
    // Add a small delay before restarting the level for better UX
    setTimeout(function () {
        startLevel(currentLevel);
    }, 500);
}
function winGame() {
    awaitingPlayerInput = false;
    clearTimeout(playerTurnTimeout);
    showWinScreen();
}
function resetGame() {
    currentLevel = 1;
    playerSequence = [];
    currentSequence = [];
    awaitingPlayerInput = false;
    clearTimeout(playerTurnTimeout);
    resetUIForNewGame();
    updateLevelDisplay(currentLevel);
}
// Make functions accessible if not using modules (global scope)
// Ensure ui.ts functions are available globally or via an object
// e.g., UI.updateLevelDisplay, UI.showSequence etc.
// For this project, assuming they are global as per ui.ts structure.
