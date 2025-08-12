// UI Functions
function toggleMiddleUIPanel() {
    const panel = document.querySelector('.game-panels');
    const btn = document.getElementById('toggleMiddleUI');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        btn.innerText = '🔽 Hide Info Panels';
    } else {
        panel.style.display = 'none';
        btn.innerText = '▶ Show Info Panels';
    }
}

// Additional UI helper functions
function showGameMessage(message, duration = 3000) {
    const gameMessage = document.getElementById('gameMessage');
    if (gameMessage) {
        gameMessage.textContent = message;
        gameMessage.style.display = 'block';
        
        setTimeout(() => {
            gameMessage.style.display = 'none';
        }, duration);
    }
}

function updateActivity() {
    if (game && game.updateActivity) {
        game.updateActivity();
    }
}

// Add activity tracking for offline earnings
document.addEventListener('mousedown', updateActivity);
document.addEventListener('keydown', updateActivity);
document.addEventListener('click', updateActivity);
document.addEventListener('touchstart', updateActivity);

// Check for visibility changes (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log("Tab hidden");
    } else {
        updateActivity();
    }
}); 