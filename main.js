"use strict";
// Note: Declarations for startButton, retryButton, playAgainButton, startLevel, initAudio etc.
// are omitted here assuming they are correctly resolved by TS or are already present.
// If TS still complains, they might need to be added back.
// Main Game Initialization
// Functions and variables from game.ts (like startLevel, handleKeyPress)
// and ui.ts (like startButton, retryButton) are expected to be globally available
// after their respective .js files are loaded.
document.addEventListener('DOMContentLoaded', () => {
    if (startButton) {
        startButton.addEventListener('click', () => {
            initAudio(); // Initialize audio on first user interaction
            // `currentLevel` is managed within game.ts, startLevel should handle it.
            // If main.ts needs to know the starting level, it can use the one from game.ts
            // or start with a fixed value like 1.
            startLevel(currentLevel || 1); // Use game.ts currentLevel or default to 1
        });
    }
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            retryCurrentLevel();
        });
    }
    if (playAgainButton) {
        playAgainButton.addEventListener('click', () => {
            resetGame();
            // Optionally, auto-start the game or wait for user to click start
            // For now, resetGame should set it up for a new "Start Level" click.
        });
    }
    // Global key listener for player input
    document.addEventListener('keydown', handleKeyPress);
    // Global touch listeners for mobile input
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    // Initial UI setup
    resetGame(); // Sets up the initial state, including level display
    // displayFeedback('Press Start to begin!', null); // This is now handled by resetUIForNewGame -> resetGame
});
// Ensure this script runs after the DOM is fully loaded.
// The DOMContentLoaded listener handles this.
