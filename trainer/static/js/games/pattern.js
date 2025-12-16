(function () {
    // --- Pattern Recall State ---
    let patternSequence = [];
    let patternInputIndex = 0;
    let isPatternPlaying = false;
    let playbackInterval = null;

    function startPatternGame() {
        patternSequence = [];
        patternInputIndex = 0;
        isPatternPlaying = false;

        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        // Reset UI
        displays.livesContainer.style.display = 'none';
        const timerContainer = displays.time.parentElement;
        if (timerContainer) timerContainer.innerHTML = `Round: <span id="time-display">1</span>`;
        displays.time = document.getElementById('time-display');
        displays.nextTarget.innerHTML = '';

        renderPatternGrid();

        setTimeout(nextPatternRound, 1000);
        GameApp.helpers.switchScreen('game');
    }

    function renderPatternGrid() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;

        displays.gameGrid.dataset.size = gridSize;
        displays.gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Ensure fit
        displays.gameGrid.innerHTML = '';

        const count = gridSize * gridSize;
        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card pattern-cell';
            cell.dataset.id = i;
            cell.style.backgroundColor = '#444'; // Neutral
            cell.onclick = () => onPatternClick(i);
            displays.gameGrid.appendChild(cell);
        }
    }

    function nextPatternRound() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;

        // Add random cell to sequence
        const count = gridSize * gridSize;
        const nextId = Math.floor(Math.random() * count);
        patternSequence.push(nextId);

        if (displays.time) displays.time.innerText = patternSequence.length;
        playPatternSequence();
    }

    function playPatternSequence() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        isPatternPlaying = true;
        patternInputIndex = 0;
        let i = 0;

        // Dynamic speed: Faster as you go
        let speed = 800;
        const lvl = patternSequence.length;
        if (lvl > 5) speed = 600;
        if (lvl > 10) speed = 400;
        if (lvl > 15) speed = 300;

        if (playbackInterval) clearInterval(playbackInterval);

        playbackInterval = setInterval(() => {
            if (i >= patternSequence.length) {
                clearInterval(playbackInterval);
                playbackInterval = null;
                isPatternPlaying = false;
                // Visual cue that it's user's turn?
                displays.gameGrid.style.borderColor = '#00ff00'; // Subtle green border
                setTimeout(() => displays.gameGrid.style.borderColor = '', 500);
                return;
            }

            const id = patternSequence[i];
            const cell = displays.gameGrid.children[id];

            // Flash
            if (cell) {
                cell.style.backgroundColor = '#00ffe0';
                cell.style.boxShadow = '0 0 15px #00ffe0'; // Glow
                setTimeout(() => {
                    cell.style.backgroundColor = '#444';
                    cell.style.boxShadow = '';
                }, speed * 0.7); // Flash duration relative to speed
            }

            i++;
        }, speed);
    }

    function onPatternClick(id) {
        if (isPatternPlaying) return;

        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        const cell = displays.gameGrid.children[id];

        if (id === patternSequence[patternInputIndex]) {
            // Correct - Flash Green
            cell.style.backgroundColor = '#32cd32';
            setTimeout(() => {
                cell.style.backgroundColor = '#444';
            }, 150);

            patternInputIndex++;
            if (patternInputIndex >= patternSequence.length) {
                setTimeout(nextPatternRound, 800);
            }
        } else {
            // Wrong - Flash Red
            cell.style.backgroundColor = '#ff4444';
            setTimeout(() => {
                GameApp.helpers.endGame(false); // Game Over
            }, 500);
        }
    }

    window.startPatternGame = startPatternGame;

})();
