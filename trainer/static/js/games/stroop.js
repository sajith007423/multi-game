(function () {
    // --- Stroop Challenge State ---
    let stroopScore = 0;
    let stroopLives = 3;
    let stroopTargetColor = '';
    let stroopStartTime = 0;

    function startStroopGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        stroopScore = 0;
        stroopLives = 3;

        GameApp.helpers.stopTimer(); // Clear potential main timers

        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = stroopLives;

        const timerContainer = displays.time.parentElement;
        if (timerContainer) timerContainer.innerHTML = `Score: <span id="time-display">${stroopScore}</span>`;
        displays.time = document.getElementById('time-display');

        renderStroopRound();
        GameApp.helpers.switchScreen('game');
    }

    function renderStroopRound() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;

        // Colors
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const hex = {
            'red': '#ff4444', 'blue': '#4444ff', 'green': '#00cc00',
            'yellow': '#eeee00', 'purple': '#9933cc', 'orange': '#ffaa00'
        };

        // Pick Target
        stroopTargetColor = colors[Math.floor(Math.random() * colors.length)];
        stroopStartTime = Date.now();

        // Display Prompt
        const promptSpan = document.createElement('span');
        promptSpan.style.fontSize = '20px';
        promptSpan.style.fontWeight = 'bold';
        promptSpan.innerText = `Select INK: ${stroopTargetColor.toUpperCase()}`;
        promptSpan.style.color = '#fff';

        displays.nextTarget.innerHTML = '';
        displays.nextTarget.appendChild(promptSpan);

        if (displays.time) displays.time.innerText = stroopScore;

        // Render Grid
        displays.gameGrid.dataset.size = gridSize;
        displays.gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.innerHTML = '';

        const count = gridSize * gridSize;
        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card';

            // Random Word, Random Color
            const word = colors[Math.floor(Math.random() * colors.length)];
            const ink = colors[Math.floor(Math.random() * colors.length)];

            const span = document.createElement('span');
            span.innerText = word.toUpperCase();
            span.style.color = hex[ink];
            span.style.fontWeight = '900';
            span.style.fontSize = '20px';
            span.style.textShadow = '0 0 2px #000'; // Contrast

            cell.appendChild(span);

            // Data for check
            cell.dataset.ink = ink;

            cell.onclick = () => onStroopClick(cell);
            displays.gameGrid.appendChild(cell);
        }
    }

    function onStroopClick(cell) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        const selectedInk = cell.dataset.ink;

        if (selectedInk === stroopTargetColor) {
            // Speed Bonus
            const reaction = Date.now() - stroopStartTime;
            const bonus = Math.max(0, 500 - (reaction / 4));
            stroopScore += Math.floor(50 + bonus);

            if (displays.time) displays.time.innerText = stroopScore;

            if (window.SoundManager) window.SoundManager.playPop();

            // Visual feedback
            cell.style.backgroundColor = '#333';
            cell.style.opacity = '0'; // Disappear
            cell.onclick = null;

            setTimeout(renderStroopRound, 200);
        } else {
            stroopLives--;
            displays.livesDisplay.innerText = stroopLives;

            if (window.SoundManager) window.SoundManager.playError();

            cell.style.border = '2px solid #f00';

            if (stroopLives <= 0) {
                if (displays.finalTime) displays.finalTime.innerText = `Final Score: ${stroopScore}`;
                GameApp.helpers.switchScreen('result');
            }
        }
    }

    window.startStroopGame = startStroopGame;

})();
