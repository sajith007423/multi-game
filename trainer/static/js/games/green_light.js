(function () {
    // --- Green Light State ---
    let greenScore = 0;
    let greenLives = 5;
    let greenSpawnInterval = null;
    let greenActiveTimeouts = {};

    function startGreenGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        greenScore = 0;
        greenLives = 5;

        // Clear all previous timeouts carefully
        Object.values(greenActiveTimeouts).forEach(id => clearTimeout(id));
        greenActiveTimeouts = {};
        if (greenSpawnInterval) clearTimeout(greenSpawnInterval);

        GameApp.helpers.stopTimer();

        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = greenLives;

        const timerContainer = displays.time.parentElement;
        if (timerContainer) timerContainer.innerHTML = `Score: <span id="time-display">${greenScore}</span>`;
        displays.time = document.getElementById('time-display');
        displays.nextTarget.innerHTML = '';

        // Render Empty Grid (Using Whack render logic essentially, or just empty)
        renderGreenGrid();

        scheduleNextGreenSpawn();
        GameApp.helpers.switchScreen('game');
    }

    function renderGreenGrid() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;
        const customGridMask = GameApp.state.customGridMask;
        const SPRITE_SIZE = 64;

        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        if (customGridMask) {
            customGridMask.forEach((isActive, i) => {
                if (isActive) {
                    const hole = document.createElement('div');
                    hole.className = 'icon-card empty-hole';
                    hole.dataset.id = i;
                    displays.gameGrid.appendChild(hole);
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.style.visibility = 'hidden';
                    displays.gameGrid.appendChild(placeholder);
                }
            });
        }
    }

    function scheduleNextGreenSpawn() {
        // Dynamic speed: faster as score increases
        const speed = Math.max(400, 1000 - (greenScore * 0.8));

        greenSpawnInterval = setTimeout(() => {
            // Check if still playing
            // We rely on checking if our module is still active effectively, or relying on GameApp state
            // If we are halted, this timeout should have been cleared. 
            // But to be safe, we check if the game grid is visible? 
            const GameApp = window.GameApp;
            // Ideally check GameApp.state.currentState === 'GAME'
            // For now we assume if we weren't cleared, we spawn.
            // Or better, check if displays.gameGrid is valid.
            spawnGreenItem();
            scheduleNextGreenSpawn();
        }, speed);
    }

    function spawnGreenItem() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const customGridMask = GameApp.state.customGridMask;

        // Find empty
        const validIndices = [];
        Array.from(displays.gameGrid.children).forEach((c, i) => {
            // Check if empty and active slot
            // Note: children include placeholders?
            // If placeholder, it's hidden.
            // If active slot, it might have an item. c.children.length === 0 means empty.
            if (c.style.visibility !== 'hidden' && c.children.length === 0) validIndices.push(i);
        });

        if (validIndices.length === 0) return;

        const idx = validIndices[Math.floor(Math.random() * validIndices.length)];
        const cell = displays.gameGrid.children[idx];

        // 30% Red (Decoy), 70% Green (Target)
        const isTarget = Math.random() > 0.3;

        const item = document.createElement('div');
        item.style.width = '70%';
        item.style.height = '70%';
        item.style.borderRadius = '50%';
        item.style.backgroundColor = isTarget ? '#0f0' : '#f00';
        item.style.boxShadow = isTarget ? '0 0 10px #0f0' : '0 0 10px #f00';
        item.style.pointerEvents = 'none'; // so click hits cell

        cell.appendChild(item);
        cell.onclick = () => onGreenClick(idx, isTarget);

        // Timeout
        const duration = Math.max(700, 1500 - (greenScore * 10));
        greenActiveTimeouts[idx] = setTimeout(() => {
            // Timeout Logic
            if (isTarget) {
                // Missed Green -> Lose 1 Life
                greenLives--;
                if (displays.livesDisplay) displays.livesDisplay.innerText = greenLives;

                if (window.SoundManager) window.SoundManager.playError();

                if (greenLives <= 0) {
                    endGreenGame();
                }
            }
            // If Decoy (Red) -> Good job avoiding effectively. 

            if (cell) {
                cell.innerHTML = '';
                cell.onclick = null;
            }
            delete greenActiveTimeouts[idx];
        }, duration);
    }

    function onGreenClick(idx, isTarget) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        if (greenActiveTimeouts[idx]) {
            clearTimeout(greenActiveTimeouts[idx]);
            delete greenActiveTimeouts[idx];
        }

        const cell = displays.gameGrid.children[idx];
        cell.onclick = null;
        cell.innerHTML = '';

        if (isTarget) {
            // Good
            greenScore += 50;
            if (displays.time) displays.time.innerText = greenScore;

            if (window.SoundManager) window.SoundManager.playPop();

            cell.style.backgroundColor = '#1a1';
            setTimeout(() => cell.style.backgroundColor = '', 200);
        } else {
            // Bad (Clicked Red) -> Lose 2 Lives
            greenLives -= 2;
            if (displays.livesDisplay) displays.livesDisplay.innerText = greenLives;

            if (window.SoundManager) window.SoundManager.playError();

            cell.style.backgroundColor = '#a11';
            setTimeout(() => cell.style.backgroundColor = '', 200);

            if (greenLives <= 0) {
                endGreenGame();
            }
        }
    }

    function endGreenGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        if (greenSpawnInterval) clearTimeout(greenSpawnInterval);
        Object.values(greenActiveTimeouts).forEach(id => clearTimeout(id));
        greenActiveTimeouts = {};

        if (displays.finalTime) displays.finalTime.innerText = `Final Score: ${greenScore}`;
        GameApp.helpers.switchScreen('result');
    }

    window.startGreenGame = startGreenGame;

})();
