(function () {
    // --- Schulte Memory State ---
    let memSequence = [];
    let memCurrentIndex = 0;
    let memLives = 3;
    let memStartTime = 0;

    function startSchulteMemGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const activeCategories = GameApp.state.activeCategories;
        const customSelectedIcons = GameApp.state.customSelectedIcons;
        const customGridMask = GameApp.state.customGridMask;

        memSequence = [];
        const activeCount = customGridMask.filter(Boolean).length;

        // Generate Sequence of Content
        let sequenceObjects = [];

        if (customSelectedIcons.length > 0) {
            // Manual Selection
            const poolFn = [];
            activeCategories.forEach(cat => {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : 16;
                for (let i = 0; i < limit; i++) poolFn.push({ cat, id: i });
            });

            customSelectedIcons.forEach(idx => {
                if (poolFn[idx]) sequenceObjects.push(poolFn[idx]);
            });

            GameApp.helpers.shuffleArray(sequenceObjects);

            if (sequenceObjects.length < activeCount) {
                const needed = activeCount - sequenceObjects.length;
                for (let k = 0; k < needed; k++) {
                    sequenceObjects.push(sequenceObjects[k % sequenceObjects.length]);
                }
            }
            sequenceObjects = sequenceObjects.slice(0, activeCount);

        } else {
            // Auto Mode
            const pool = [];
            activeCategories.forEach(cat => {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : 16;
                for (let i = 0; i < limit; i++) {
                    pool.push({ cat, id: i });
                }
            });
            GameApp.helpers.shuffleArray(pool);
            sequenceObjects = pool.slice(0, activeCount);
        }

        memSequence = sequenceObjects.map(item => GameApp.helpers.getDirectContent(item.cat, item.id));

        // Render Memorize Screen
        if (displays.sequence) {
            displays.sequence.innerHTML = '';
            displays.sequence.style.gridTemplateColumns = `repeat(auto-fit, minmax(64px, 1fr))`;

            memSequence.forEach((item, idx) => {
                const div = document.createElement('div');
                div.className = 'icon-card';
                div.style.width = '64px';
                div.style.height = '64px';

                if (item.type === 'image') {
                    div.style.backgroundImage = `url('${item.content}')`;
                    div.style.backgroundSize = 'cover';
                } else {
                    div.innerText = item.content;
                    div.className += ' text-icon';
                    div.style.fontSize = '20px';
                }

                // Badge
                const badge = document.createElement('div');
                badge.innerText = idx + 1;
                badge.style.position = 'absolute';
                badge.style.top = '0';
                badge.style.left = '0';
                badge.style.background = 'rgba(0,0,0,0.7)';
                badge.style.color = '#fff';
                badge.style.padding = '2px 5px';
                badge.style.fontSize = '12px';
                div.appendChild(badge);

                displays.sequence.appendChild(div);
            });
        }

        memCurrentIndex = 0;
        GameApp.helpers.switchScreen('memorize');
    }

    function startSchulteMemPhase() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;
        const customGridMask = GameApp.state.customGridMask;

        // Shuffle and Place on Grid
        const gridItems = [...memSequence];
        GameApp.helpers.shuffleArray(gridItems);

        displays.gameGrid.innerHTML = '';
        displays.gameGrid.dataset.size = gridSize;
        displays.gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        let itemIdx = 0;
        const total = gridSize * gridSize;

        for (let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card';

            if (customGridMask[i]) {
                const item = gridItems[itemIdx++];
                // Render
                if (item.type === 'image') {
                    cell.style.backgroundImage = `url('${item.content}')`;
                    cell.style.backgroundSize = 'cover';
                } else {
                    cell.innerText = item.content;
                    cell.className += ' text-icon';
                    cell.style.fontSize = '24px';
                }

                cell.onclick = () => onSchulteMemClick(cell, item);
            } else {
                cell.style.visibility = 'hidden';
            }
            displays.gameGrid.appendChild(cell);
        }

        // Timer Setup
        GameApp.helpers.startTimer();

        if (displays.time) {
            const timerContainer = displays.time.parentElement;
            if (timerContainer) timerContainer.innerHTML = `Time: <span id="time-display">0.00</span>s`;
            displays.time = document.getElementById('time-display');
        }

        memLives = 3;
        if (displays.livesContainer) displays.livesContainer.style.display = 'block';
        if (displays.livesDisplay) displays.livesDisplay.innerText = memLives;

        updateSchulteMemTarget();
        GameApp.helpers.switchScreen('game');
    }

    function updateSchulteMemTarget() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        if (memCurrentIndex < memSequence.length) {
            const target = memSequence[memCurrentIndex];
            displays.nextTarget.innerHTML = '';
            const el = document.createElement('div');
            el.className = 'icon-card';
            if (target.type === 'image') {
                el.style.width = '32px';
                el.style.height = '32px';
                el.style.backgroundImage = `url('${target.content}')`;
                el.style.backgroundSize = 'cover';
            } else {
                el.innerText = target.content;
                el.style.fontWeight = 'bold';
            }
            displays.nextTarget.appendChild(el);
        } else {
            displays.nextTarget.innerText = "Done!";
        }
    }

    function onSchulteMemClick(cell, item) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const expected = memSequence[memCurrentIndex];

        // Ensure we compare content (strings/urls)
        const isMatch = (item.content === expected.content && item.type === expected.type);

        if (isMatch) {
            // Correct
            cell.style.opacity = '0.3';
            cell.onclick = null;
            if (window.SoundManager) window.SoundManager.playPop();

            memCurrentIndex++;
            if (memCurrentIndex >= memSequence.length) {
                // Win
                GameApp.helpers.stopTimer();
                const t = (Date.now() - GameApp.helpers.getStartTime()) / 1000;
                if (displays.finalTime) displays.finalTime.innerText = t.toFixed(2);
                GameApp.helpers.endGame(true); // Triggers result screen
            } else {
                updateSchulteMemTarget();
            }
        } else {
            // Wrong
            memLives--;
            if (displays.livesDisplay) displays.livesDisplay.innerText = memLives;

            if (window.SoundManager) window.SoundManager.playError();

            cell.style.backgroundColor = '#f00';
            setTimeout(() => cell.style.backgroundColor = '', 200);

            if (memLives <= 0) {
                GameApp.helpers.endGame(false);
            }
        }
    }

    window.startSchulteMemGame = startSchulteMemGame;
    window.startSchulteMemPhase = startSchulteMemPhase;

})();
