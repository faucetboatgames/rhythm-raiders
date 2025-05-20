// Audio Context
let audioCtx: AudioContext | null = null;

function initAudio(): void {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
            // Provide fallback or disable sound
            feedbackDisplay.textContent = "Sound disabled: Web Audio API not supported.";
        }
    }
}

// Call initAudio once, perhaps on first interaction or DOMContentLoaded
// For simplicity, we can try to initialize it early.
// However, browsers often require user interaction to start AudioContext.
// We'll add a call to it when the start button is pressed in main.ts.


// Sound playing function
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume

    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
    }, duration);
}

// Specific sounds
const CUE_SOUND_FREQ = 440; // A4 note
const CORRECT_INPUT_SOUND_FREQ = 660; // E5 note
const INCORRECT_INPUT_SOUND_FREQ = 220; // A3 note
const SOUND_DURATION = 150; // ms

// DOM Elements
const levelDisplay = document.getElementById('current-level') as HTMLSpanElement;
const sequenceDisplayContainer = document.getElementById('sequence-display') as HTMLDivElement;
const feedbackDisplay = document.getElementById('feedback-display') as HTMLDivElement;
const startButton = document.getElementById('start-button') as HTMLButtonElement;
const retryButton = document.getElementById('retry-button') as HTMLButtonElement;
const gameContainer = document.getElementById('game-container') as HTMLDivElement;
const winScreen = document.getElementById('win-screen') as HTMLDivElement;
const playAgainButton = document.getElementById('play-again-button') as HTMLButtonElement;

const cueButtons: HTMLElement[] = [];
for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`cue-${i}`) as HTMLElement;
    if (btn) cueButtons.push(btn);
}

// UI Update Functions
function updateLevelDisplay(level: number): void {
    if (levelDisplay) {
        levelDisplay.textContent = level.toString();
    }
}

function showSequence(sequence: number[], beatDuration: number): Promise<void> {
    return new Promise(resolve => {
        disablePlayerInput();
        let i = 0;
        function nextCue() {
            if (i < sequence.length) {
                const cueIndex = sequence[i];
                const cueButton = cueButtons[cueIndex];
                if (cueButton) {
                    cueButton.classList.add('active');
                    playTone(CUE_SOUND_FREQ, SOUND_DURATION, 'triangle');
                    setTimeout(() => {
                        cueButton.classList.remove('active');
                        i++;
                        setTimeout(nextCue, beatDuration / 2); // Pause between cues
                    }, beatDuration);
                } else {
                    i++; // Skip if button not found, though this shouldn't happen
                    setTimeout(nextCue, beatDuration / 2); // Maintain timing
                }
            } else {
                enablePlayerInput();
                resolve();
            }
        }
        setTimeout(nextCue, beatDuration); // Initial delay before first cue
    });
}

function displayFeedback(message: string, isCorrect: boolean | null): void {
    if (feedbackDisplay) {
        feedbackDisplay.textContent = message;
        feedbackDisplay.className = ''; // Clear previous classes
        if (isCorrect === true) {
            feedbackDisplay.classList.add('correct');
        } else if (isCorrect === false) {
            feedbackDisplay.classList.add('incorrect');
        }
    }
}

function flashKey(keyIndex: number, success: boolean): void {
    const cueButton = cueButtons[keyIndex];
    if (cueButton) {
        const originalColor = cueButton.style.backgroundColor;
        const soundFreq = success ? CORRECT_INPUT_SOUND_FREQ : INCORRECT_INPUT_SOUND_FREQ;
        const soundType = success ? 'sine' : 'square';
        
        playTone(soundFreq, SOUND_DURATION, soundType);
        cueButton.style.backgroundColor = success ? '#00ff00' : '#ff0000'; // Green for correct, Red for incorrect
        cueButton.classList.add('active'); // Use active class for consistent styling
        
        setTimeout(() => {
            cueButton.style.backgroundColor = originalColor;
            cueButton.classList.remove('active');
        }, 200);
    }
}


function showWinScreen(): void {
    if (gameContainer && winScreen) {
        gameContainer.style.display = 'none';
        winScreen.style.display = 'block';
    }
}

function resetUIForNewGame(): void {
    if (gameContainer && winScreen) {
        winScreen.style.display = 'none';
        gameContainer.style.display = 'block';
    }
    if (startButton) startButton.style.display = 'inline-block';
    if (retryButton) retryButton.style.display = 'none';
    displayFeedback('Press Start to begin!', null);
}

function disablePlayerInput(): void {
    // This could involve disabling keyboard listeners or UI elements
    // For now, we'll rely on game logic to ignore input during sequence display
    if (startButton) startButton.disabled = true;
    if (retryButton) retryButton.disabled = true;
}

function enablePlayerInput(): void {
    if (startButton) startButton.disabled = false;
    if (retryButton) retryButton.disabled = false;
}

function showRetryButton(): void {
    if (startButton) startButton.style.display = 'none';
    if (retryButton) retryButton.style.display = 'inline-block';
}

function hideRetryButton(): void {
    if (startButton) startButton.style.display = 'inline-block';
    if (retryButton) retryButton.style.display = 'none';
}


// Export UI functions to be used by game.ts and main.ts
// Since we are not using modules, these will be global or attached to a global object.
// For simplicity in this no-build-tool setup, they become global.
// To avoid polluting global scope too much, one might wrap them in an object:
// const UI = { updateLevelDisplay, showSequence, ... };
// And then access them via UI.updateLevelDisplay(...);
// However, for this small project, direct global functions are simpler to manage across few files.
