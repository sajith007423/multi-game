(function () {
    // --- Whack-a-Mole State ---
    let whackScore = 0;
    let whackLives = 5;
    let activeMoleTimeouts = {}; // Map cell index -> timeout ID
    let whackSpawnInterval = null;
    const SPRITE_SIZE = 64;

    function startWhackAMoleGame() {
        whackScore = 0;
        whackLives = 5;
        activeMoleTimeouts = {};

        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        // UI Setup
        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = whackLives;

        // Clear Score Area
        const timerContainer = displays.time.parentElement;
        if (timerContainer) timerContainer.innerHTML = `Score: <span id="time-display">${whackScore}</span>`;
        displays.time = document.getElementById('time-display');

        displays.nextTarget.innerHTML = '';

        // Render Empty Grid
        renderWhackGrid();

        // Start Spawning
        if (whackSpawnInterval) clearInterval(whackSpawnInterval);
        whackSpawnInterval = setInterval(spawnMole, 1000); // Spawn every second

        GameApp.helpers.stopTimer(); // Ensure main timer is off
        GameApp.helpers.switchScreen('game');
    }

    function renderWhackGrid() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;
        const customGridMask = GameApp.state.customGridMask;

        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        if (customGridMask) {
            customGridMask.forEach((isActive, i) => {
                if (isActive) {
                    const hole = document.createElement('div');
                    hole.className = 'icon-card empty-hole'; // Add CSS for hole look if desired
                    hole.dataset.id = i;
                    // Empty initially
                    displays.gameGrid.appendChild(hole);
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.style.visibility = 'hidden';
                    displays.gameGrid.appendChild(placeholder);
                }
            });
        }
    }

    function spawnMole() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const customGridMask = GameApp.state.customGridMask;
        const customSelectedIcons = GameApp.state.customSelectedIcons;
        const activeCategories = GameApp.state.activeCategories;
        const MAX_ASSETS = GameApp.state.MAX_ASSETS;

        // Find empty holes (where no mole is currently active)
        const validIndices = [];
        if (customGridMask) {
            customGridMask.forEach((isActive, i) => {
                if (isActive && !activeMoleTimeouts[i]) {
                    validIndices.push(i);
                }
            });
        }

        if (validIndices.length === 0) return; // Full board

        // Pick random hole
        const idx = validIndices[Math.floor(Math.random() * validIndices.length)];

        // Pick random icon
        let pool = (customSelectedIcons && customSelectedIcons.length > 0) ? customSelectedIcons : [0];
        const poolIdx = pool[Math.floor(Math.random() * pool.length)];
        let contentData = null;
        let runningCount = 0;

        // Locate content
        for (const cat of activeCategories) {
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
            if (poolIdx < runningCount + limit) {
                const localId = poolIdx - runningCount;
                contentData = GameApp.helpers.getDirectContent(cat, localId);
                break;
            }
            runningCount += limit;
        }

        if (!contentData) return;

        // Show Mole
        const targetCell = displays.gameGrid.children[idx];
        if (!targetCell) return; // Safety

        targetCell.innerHTML = '';
        targetCell.className = 'icon-card mole-active';

        let contentEl;
        if (contentData.type === 'text') {
            const span = document.createElement('span');
            span.className = 'text-icon';
            span.innerText = contentData.content;
            contentEl = span;
        } else {
            const sprite = document.createElement('div');
            sprite.style.cssText = `
                background-image: url('${contentData.content}'); 
                background-size: cover;
                width: 100%;
                height: 100%;
                pointer-events: none; 
            `; // pointer-events: none on sprite so click hits container
            contentEl = sprite;
        }
        targetCell.appendChild(contentEl);

        // Click Listener
        const clickHandler = () => onMoleClick(idx);
        targetCell.onclick = clickHandler;

        // Timeout (Miss)
        // Speed increases with score?
        const duration = Math.max(600, 1500 - (whackScore * 20));

        activeMoleTimeouts[idx] = setTimeout(() => {
            onMoleMiss(idx);
        }, duration);
    }

    function onMoleClick(idx) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        if (activeMoleTimeouts[idx]) {
            clearTimeout(activeMoleTimeouts[idx]);
            delete activeMoleTimeouts[idx];
        }

        const cell = displays.gameGrid.children[idx];
        cell.onclick = null;
        cell.className = 'icon-card correct'; // Flash green
        cell.innerHTML = ''; // Hide icon immediately or fade?

        whackScore += 100;
        if (displays.time) displays.time.innerText = whackScore; // Using time display for score

        if (window.SoundManager) window.SoundManager.playPop();

        setTimeout(() => {
            cell.className = 'icon-card empty-hole';
        }, 200);
    }

    function onMoleMiss(idx) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        if (activeMoleTimeouts[idx]) {
            delete activeMoleTimeouts[idx];
        }

        const cell = displays.gameGrid.children[idx];
        cell.onclick = null;
        cell.className = 'icon-card wrong'; // Flash red

        whackLives--;
        if (displays.livesDisplay) displays.livesDisplay.innerText = whackLives;

        if (window.SoundManager) window.SoundManager.playError();

        setTimeout(() => {
            cell.innerHTML = '';
            cell.className = 'icon-card empty-hole';

            if (whackLives <= 0) {
                endWhackGame();
            }
        }, 500);
    }

    function endWhackGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        if (whackSpawnInterval) clearInterval(whackSpawnInterval);

        // Clear all pending timeouts
        Object.values(activeMoleTimeouts).forEach(mid => clearTimeout(mid));
        activeMoleTimeouts = {};

        displays.finalTime.innerText = `Final Score: ${whackScore}`;
        if (window.SoundManager) window.SoundManager.playLose();
        GameApp.helpers.switchScreen('result');
        displays.livesContainer.style.display = 'none';
    }

    window.startWhackAMoleGame = startWhackAMoleGame;

})();
