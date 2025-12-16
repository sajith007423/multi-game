(function () {
    // --- Math Matrix State ---
    let mathScore = 0;
    let mathTarget = 0;
    let mathCurrentSum = 0;
    let mathSelectedCells = [];
    let mathLives = 3;

    function startMathGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        mathScore = 0;
        mathTarget = 0;
        mathCurrentSum = 0;
        mathSelectedCells = [];
        mathLives = 3;

        GameApp.helpers.stopTimer();

        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = mathLives;

        renderMathRound();
        GameApp.helpers.switchScreen('game');
    }

    function renderMathRound() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;

        mathCurrentSum = 0;
        mathSelectedCells = [];

        // Determine Target: Progressive Difficulty
        // Base 10, plus up to 40 more based on score
        const difficulty = Math.min(40, Math.floor(mathScore / 50));
        mathTarget = Math.floor(Math.random() * (20 + difficulty)) + 10;

        const timerContainer = displays.time.parentElement;
        if (timerContainer) timerContainer.innerHTML = `SUM: <span id="current-sum" style="color:#0ff">0</span> / Target: <span style="color:#ff0">${mathTarget}</span> (Score: <span id="time-display">${mathScore}</span>)`;
        displays.time = document.getElementById('time-display');
        const sumDisplay = document.getElementById('current-sum');

        displays.nextTarget.innerHTML = ''; // No icon

        // Render Grid
        displays.gameGrid.dataset.size = gridSize;
        displays.gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.innerHTML = '';

        const count = gridSize * gridSize;
        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card';

            // Value 1-9
            const val = Math.floor(Math.random() * 9) + 1;
            cell.innerText = val;
            cell.style.fontSize = '32px';
            cell.style.fontWeight = 'bold';
            cell.dataset.val = val;
            cell.dataset.id = i;

            cell.onclick = () => onMathClick(cell, val, sumDisplay);
            displays.gameGrid.appendChild(cell);
        }
    }

    function onMathClick(cell, val, sumDisplay) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        // Toggle
        if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            cell.style.backgroundColor = '';
            cell.style.boxShadow = '';
            cell.style.borderColor = '';
            mathCurrentSum -= val;
            const idx = mathSelectedCells.indexOf(cell);
            if (idx > -1) mathSelectedCells.splice(idx, 1);
        } else {
            cell.classList.add('selected');
            cell.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';
            cell.style.borderColor = '#00ffff';
            cell.style.boxShadow = '0 0 15px #00ffff';
            mathCurrentSum += val;
            mathSelectedCells.push(cell);
        }

        if (sumDisplay) sumDisplay.innerText = mathCurrentSum;

        if (mathCurrentSum === mathTarget) {
            // Success
            mathScore += mathCurrentSum * 10;
            if (displays.time) displays.time.innerText = mathScore;

            if (window.SoundManager) window.SoundManager.playPop();

            // Highlight and Reset
            mathSelectedCells.forEach(c => {
                c.style.backgroundColor = '#0f0';
                c.style.boxShadow = '0 0 20px #0f0'; // Green Success Glow
                c.style.borderColor = '#0f0'; // Green Success Border
            });
            setTimeout(renderMathRound, 500);
        } else if (mathCurrentSum > mathTarget) {
            // Overshoot - Penalty
            mathLives--;
            if (displays.livesDisplay) displays.livesDisplay.innerText = mathLives;

            if (window.SoundManager) window.SoundManager.playError();

            if (sumDisplay) sumDisplay.style.color = '#f00';

            if (mathLives <= 0) {
                setTimeout(() => {
                    if (displays.finalTime) displays.finalTime.innerText = `Final Score: ${mathScore}`;
                    GameApp.helpers.switchScreen('result');
                }, 500);
                return;
            }

            setTimeout(() => {
                if (sumDisplay) {
                    sumDisplay.style.color = '#0ff';
                    sumDisplay.innerText = 0;
                }
                // Reset selection
                mathSelectedCells.forEach(c => {
                    c.classList.remove('selected');
                    c.style.backgroundColor = '';
                    c.style.boxShadow = '';
                    c.style.borderColor = '';
                });
                mathSelectedCells = [];
                mathCurrentSum = 0;
            }, 500);
        }
    }

    window.startMathGame = startMathGame;

})();
