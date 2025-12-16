(function () {
    let nValue = 2; // Default N-back level
    let sequence = []; // Array of { pos: 4, letter: 'A' }
    let currentIndex = 0;
    let score = 0;
    let trialCount = 20;
    let intervalId = null;

    // User responses for current step
    let responsePos = false;
    let responseAudio = false;

    // Stimuli
    const letters = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    function startNBackGame() {
        // Reset
        nValue = parseInt(document.getElementById('grid-size-val')?.innerText || 2); // Use grid size for N? or fixed? 
        // Let's use grid size selector to mean "N level" for this game.
        // N should be 1, 2, 3. Clamp it.
        nValue = Math.max(1, Math.min(nValue, 5));

        sequence = [];
        currentIndex = 0;
        score = 0;

        // Generate Sequence
        for (let i = 0; i < trialCount; i++) {
            // Chance of match with i-nValue
            const target = (i >= nValue) ? sequence[i - nValue] : null;

            // 30% chance visual match
            let pos = (target && Math.random() < 0.3) ? target.pos : positions[Math.floor(Math.random() * 9)];
            // 30% chance audio match
            let char = (target && Math.random() < 0.3) ? target.char : letters[Math.floor(Math.random() * letters.length)];

            sequence.push({ pos, char });
        }

        renderNBackUI();

        // Start Loop
        if (intervalId) clearInterval(intervalId);
        window.GameApp.helpers.switchScreen('game');

        // Countdown then start
        setTimeout(nextStep, 1000);
    }

    function renderNBackUI() {
        const displays = window.GameApp.displays;
        displays.gameGrid.innerHTML = '';
        displays.gameGrid.style.display = 'grid';
        displays.gameGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        displays.gameGrid.style.gap = '5px';
        displays.gameGrid.dataset.size = 3;

        // 3x3 Grid
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card';
            cell.id = `nback-cell-${i}`;
            cell.style.background = '#333';
            displays.gameGrid.appendChild(cell);
        }

        // Add Controls below grid (inject into a container if exists, or append to grid wrapper?)
        // Better: Replace game header or use existing buttons?
        // Let's create a control overlay at bottom of grid
        const controlDiv = document.createElement('div');
        controlDiv.style.cssText = "grid-column: 1 / -1; display: flex; gap: 10px; padding: 10px;";

        const btnPos = document.createElement('button');
        btnPos.className = 'battle-btn';
        btnPos.innerText = "Position Match (L)";
        btnPos.onclick = () => { responsePos = true; btnPos.style.background = '#0f0'; };

        const btnAudio = document.createElement('button');
        btnAudio.className = 'battle-btn';
        btnAudio.innerText = "Sound Match (A)";
        btnAudio.onclick = () => { responseAudio = true; btnAudio.style.background = '#0f0'; };

        controlDiv.appendChild(btnAudio); // Left
        controlDiv.appendChild(btnPos); // Right
        displays.gameGrid.appendChild(controlDiv);

        // Bind Keys
        document.onkeydown = (e) => {
            if (e.code === 'KeyL') btnPos.click();
            if (e.code === 'KeyA') btnAudio.click();
        };
    }

    function nextStep() {
        if (currentIndex >= trialCount) {
            endGame();
            return;
        }

        // Reset inputs
        responsePos = false;
        responseAudio = false;
        // Reset Visuals
        document.querySelectorAll('.battle-btn').forEach(b => b.style.background = '');
        document.querySelectorAll('.icon-card').forEach(c => c.style.background = '#333');

        // Present Stimuli
        const item = sequence[currentIndex];

        // Visual
        const cell = document.getElementById(`nback-cell-${item.pos}`);
        if (cell) cell.style.background = '#00f'; // Blue flash

        // Audio
        speakLetter(item.char);

        // Update Info
        const info = document.getElementById('rpg-log-text');
        if (info) info.innerText = `N=${nValue} | Step ${currentIndex + 1}/${trialCount}`;

        // Wait 2.5s for response -> Then evaluate -> Then next
        // Actually, in N-Back usually continuous.
        // We evaluate previous step? No, current step match with N steps ago.

        setTimeout(evaluateStep, 2000);
    }

    function speakLetter(char) {
        if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance(char);
            msg.rate = 1.5;
            window.speechSynthesis.speak(msg);
        }
    }

    function evaluateStep() {
        // Did we have a match N steps ago?
        if (currentIndex >= nValue) {
            const target = sequence[currentIndex - nValue];
            const current = sequence[currentIndex];

            const isPosMatch = (target.pos === current.pos);
            const isAudioMatch = (target.char === current.char);

            // Scoring
            // Hit (Correct Claim)
            if (isPosMatch && responsePos) score += 10;
            // Miss (Failed to Claim)
            else if (isPosMatch && !responsePos) score -= 5;
            // False Alarm (Wrongly Claimed)
            else if (!isPosMatch && responsePos) score -= 5;

            // Audio same
            if (isAudioMatch && responseAudio) score += 10;
            else if (isAudioMatch && !responseAudio) score -= 5;
            else if (!isAudioMatch && responseAudio) score -= 5;
        }

        currentIndex++;
        // Short gap
        document.querySelectorAll('.icon-card').forEach(c => c.style.background = '#333');
        setTimeout(nextStep, 500);
    }

    function endGame() {
        document.onkeydown = null;
        const displays = window.GameApp.displays;
        displays.time.innerText = score; // Hijack time display for score
        window.GameApp.helpers.endGame(score > 0);
    }

    window.startNBackGame = startNBackGame;
})();
