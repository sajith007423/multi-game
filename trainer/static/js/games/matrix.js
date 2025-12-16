(function () {
    let matrixScore = 0;
    let matrixLives = 3;
    let matrixLevel = 1;
    let matrixTargetPattern = [];
    let matrixInputPattern = [];
    let matrixIsInputActive = false;

    window.startMatrixRecallGame = function () {
        const app = window.GameApp;
        if (!app) {
            alert("GameApp not initialized! Reload page.");
            return;
        }

        matrixScore = 0;
        matrixLives = 3;
        matrixLevel = 1;

        app.displays.livesContainer.style.display = 'block';
        app.displays.livesDisplay.innerText = matrixLives;

        const timerContainer = app.displays.time.parentElement;
        timerContainer.innerHTML = `Score: <span id="time-display">0</span> | Level: <span id="matrix-level">1</span>`;
        app.displays.time = document.getElementById('time-display');

        startMatrixLevel();
        app.helpers.switchScreen('game');
    };

    function startMatrixLevel() {
        const app = window.GameApp;

        let size = 3;
        if (matrixLevel > 3) size = 4;
        if (matrixLevel > 6) size = 5;
        if (matrixLevel > 10) size = 6;

        let count = Math.min(Math.floor(size * size * 0.7), 2 + Math.floor(matrixLevel * 0.8));

        // Note: we can't easily change global gridSize for valid reasons? 
        // Actually game.js uses 'gridSize' variable. If we change app.displays.gameGrid.dataset.size, CSS handles layout.

        // Ensure overlays are hidden
        ['gravity-container', 'gauntlet-container', 'flappy-container', 'rpg-player-hud', 'rpg-player-sprite'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        app.displays.gameGrid.dataset.size = size;
        let templateCols = `repeat(${size}, 1fr)`;
        app.displays.gameGrid.style.gridTemplateColumns = templateCols;
        app.displays.gameGrid.style.display = 'grid';
        app.displays.gameGrid.innerHTML = '';

        const total = size * size;
        const allIndices = Array.from({ length: total }, (_, i) => i);
        app.helpers.shuffleArray(allIndices);
        matrixTargetPattern = allIndices.slice(0, count);
        matrixInputPattern = [];
        matrixIsInputActive = false;

        app.displays.nextTarget.innerHTML = '<span style="color:#aaa;">Watch...</span>';

        for (let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card';
            cell.style.background = '#333';
            cell.dataset.id = i;
            app.displays.gameGrid.appendChild(cell);
        }

        setTimeout(() => {
            matrixTargetPattern.forEach(idx => {
                const cell = app.displays.gameGrid.children[idx];
                if (cell) {
                    cell.style.background = '#00e5ff';
                    cell.style.boxShadow = '0 0 10px #00e5ff';
                }
            });

            const flashTime = Math.max(1000, 2000 - (matrixLevel * 50));
            setTimeout(() => {
                const cells = app.displays.gameGrid.children;
                for (let c of cells) {
                    c.style.background = '#333';
                    c.style.boxShadow = '';
                    c.onclick = () => onMatrixClick(parseInt(c.dataset.id));
                }
                matrixIsInputActive = true;
                app.displays.nextTarget.innerHTML = '<span style="color:#0f0;">RECALL!</span>';
            }, flashTime);

        }, 500);
    }

    function onMatrixClick(idx) {
        if (!matrixIsInputActive) return;
        if (matrixInputPattern.includes(idx)) return;

        const app = window.GameApp;
        const cell = app.displays.gameGrid.children[idx];

        if (matrixTargetPattern.includes(idx)) {
            cell.style.background = '#00e5ff';
            matrixInputPattern.push(idx);

            if (matrixInputPattern.length === matrixTargetPattern.length) {
                matrixIsInputActive = false;
                matrixScore += (10 * matrixLevel);
                matrixLevel++;
                app.displays.time.innerText = matrixScore;
                document.getElementById('matrix-level').innerText = matrixLevel;
                app.displays.nextTarget.innerHTML = '<span style="color:#0f0;">GOOD!</span>';

                setTimeout(startMatrixLevel, 1000);
            }
        } else {
            cell.style.background = '#ff0000';
            matrixLives--;
            app.displays.livesDisplay.innerText = matrixLives;

            if (matrixLives <= 0) {
                matrixIsInputActive = false;
                matrixTargetPattern.forEach(tIdx => {
                    const c = app.displays.gameGrid.children[tIdx];
                    if (c) {
                        c.style.background = '#00e5ff';
                        c.style.opacity = '0.5';
                    }
                });

                setTimeout(() => {
                    app.displays.finalTime.innerText = `Final Score: ${matrixScore}`;
                    app.helpers.switchScreen('result');
                }, 1500);
            } else {
                setTimeout(() => { cell.style.background = '#333'; }, 300);
            }
        }
    }
})();
