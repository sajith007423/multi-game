(function () {
    // --- Odd One Out State ---
    let oddScore = 0;
    let oddLives = 3;
    let oddTargetIndex = -1;
    let oddRoundStartTime = 0;

    function startOddGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        oddScore = 0;
        oddLives = 3;

        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = oddLives;

        const timerContainer = displays.time.parentElement;
        if (timerContainer) timerContainer.innerHTML = `Score: <span id="time-display">${oddScore}</span>`;
        displays.time = document.getElementById('time-display');

        nextOddRound();
        GameApp.helpers.switchScreen('game');
    }

    function nextOddRound() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;
        const customSelectedIcons = GameApp.state.customSelectedIcons;
        const activeCategories = GameApp.state.activeCategories;
        const MAX_ASSETS = GameApp.state.MAX_ASSETS;

        const count = gridSize * gridSize;
        displays.gameGrid.innerHTML = '';

        // Pick two icons
        let pool = (customSelectedIcons && customSelectedIcons.length >= 2) ? [...customSelectedIcons] : [0, 1];
        if (pool.length < 2) pool = [0, 1]; // Fallback

        GameApp.helpers.shuffleArray(pool);
        const commonId = pool[0];
        const uniqueId = pool[1];

        oddTargetIndex = Math.floor(Math.random() * count);
        oddRoundStartTime = Date.now(); // Start Timer logic is local

        // Difficulty: Rotation
        const useRotation = oddScore > 500;

        displays.gameGrid.dataset.size = gridSize;
        displays.gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card';

            // Get content
            let activeId = (i === oddTargetIndex) ? uniqueId : commonId;

            let contentData = null;
            let running = 0;
            for (const cat of activeCategories) {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
                if (activeId < running + limit) {
                    contentData = GameApp.helpers.getDirectContent(cat, activeId - running);
                    break;
                }
                running += limit;
            }
            if (!contentData) contentData = { type: 'text', content: '?' };

            const inner = document.createElement('div');
            inner.style.width = '100%';
            inner.style.height = '100%';
            inner.style.pointerEvents = 'none';

            if (contentData.type === 'image') {
                inner.style.backgroundImage = `url('${contentData.content}')`;
                inner.style.backgroundSize = 'cover';
                if (useRotation) {
                    const deg = Math.floor(Math.random() * 4) * 90; // 0, 90, 180, 270
                    inner.style.transform = `rotate(${deg}deg)`;
                }
            } else {
                inner.innerText = contentData.content;
                inner.className = 'text-icon';
                inner.style.display = 'flex';
                inner.style.justifyContent = 'center';
                inner.style.alignItems = 'center';
                if (useRotation) { // Slight tilt for text
                    const deg = Math.floor(Math.random() * 40) - 20; // -20 to 20
                    inner.style.transform = `rotate(${deg}deg)`;
                }
            }

            cell.appendChild(inner);
            cell.onclick = () => onOddClick(i);
            displays.gameGrid.appendChild(cell);
        }
    }

    function onOddClick(i) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        if (i === oddTargetIndex) {
            // Score Calculation
            const diff = Date.now() - oddRoundStartTime;
            // Base 100 + Speed Bonus (Max 400 extra if under 500ms)
            const bonus = Math.max(0, 500 - (diff / 5));
            const points = Math.floor(100 + bonus);

            oddScore += points;
            if (displays.time) displays.time.innerText = oddScore;

            if (window.SoundManager) window.SoundManager.playPop();

            // Visual feedback
            const cell = displays.gameGrid.children[i];
            cell.style.borderColor = '#0f0';
            cell.style.backgroundColor = '#2a2'; // Light green highlight
            setTimeout(nextOddRound, 300);
        } else {
            oddLives--;
            displays.livesDisplay.innerText = oddLives;

            if (window.SoundManager) window.SoundManager.playError();

            const cell = displays.gameGrid.children[i];
            cell.style.borderColor = '#f00';
            cell.style.backgroundColor = '#522'; // Light red highlight

            if (oddLives <= 0) {
                if (displays.finalTime) displays.finalTime.innerText = `Final Score: ${oddScore}`;
                GameApp.helpers.switchScreen('result');
            }
        }
    }

    window.startOddGame = startOddGame;

})();
