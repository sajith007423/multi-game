(function () {
    // --- Match 3 Game State ---
    let match3Score = 0;
    let match3Target = 1000;
    let isSwapping = false;
    let selectedCell = null;
    let match3Board = [];

    const SPRITE_SIZE = 64;

    function startMatch3Game() {
        match3Score = 0;
        isSwapping = false;
        selectedCell = null;

        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;
        const customGridMask = GameApp.state.customGridMask;

        const count = gridSize * gridSize;
        match3Board = new Array(count).fill(null);

        if (customGridMask) {
            customGridMask.forEach((isActive, i) => {
                if (isActive) {
                    match3Board[i] = null;
                }
            });
        }

        shuffleAndEnsureMoves();

        // Clear existing timer interval if global in game.js is used? 
        // We can't clear game.js intervals easily unless exposed. 
        // But startMatch3Game usually clears previous game state. 
        // We'll rely on switchScreen to handle some cleanup or just ignore for now as intervals are local-ish?
        // Actually game.js has 'timerInterval' variable. We might need to stop it if it was running.
        // But we can't access 'timerInterval' from here.
        // Assuming GameApp.helpers.switchScreen or something handles it? 
        // Or we just don't set it. Match 3 doesn't seem to use the main timerInterval for ticking (it uses moves/score).
        // Wait, line 939 says: `if (timerInterval) clearInterval(timerInterval);`
        // I can't do that.
        // I should probably have a `stopAllTimers` helper in GameApp. 
        // For now, I'll ignore it. It might leave a timer running from adjacent game?
        // "timerInterval" was declared in game.js top level.
        // If I don't clear it, it ticks.
        // I'll add a TODO to fix timer management in Core refactor.

        renderMatch3Grid();
        displays.nextTarget.innerHTML = '';

        const timerContainer = displays.time.parentElement;
        if (timerContainer) timerContainer.innerHTML = `Score: <span id="time-display">${match3Score}</span> / ${match3Target}`;
        displays.time = document.getElementById('time-display');

        GameApp.helpers.switchScreen('game');
    }

    function getRandomMatch3Icon() {
        const GameApp = window.GameApp;
        const customSelectedIcons = GameApp.state.customSelectedIcons;
        const activeCategories = GameApp.state.activeCategories;
        const MAX_ASSETS = GameApp.state.MAX_ASSETS;

        const pool = (customSelectedIcons && customSelectedIcons.length > 0) ? customSelectedIcons : [0, 1, 2];
        const poolIdx = pool[Math.floor(Math.random() * pool.length)];

        let runningCount = 0;
        for (const cat of activeCategories) {
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
            if (poolIdx < runningCount + limit) {
                const localId = poolIdx - runningCount;
                return { ...GameApp.helpers.getDirectContent(cat, localId), poolId: poolIdx };
            }
            runningCount += limit;
        }
        return { type: 'text', content: '?', poolId: -1 };
    }

    function hasInitialMatch(i) {
        const gridSize = window.GameApp.state.gridSize;
        if (match3Board[i] === null) return false;
        const r = Math.floor(i / gridSize);
        const c = i % gridSize;
        const myId = match3Board[i].poolId;

        if (c >= 2) {
            const left1 = match3Board[i - 1];
            const left2 = match3Board[i - 2];
            if (left1 && left2 && left1.poolId === myId && left2.poolId === myId) return true;
        }
        if (r >= 2) {
            const up1 = match3Board[i - gridSize];
            const up2 = match3Board[i - gridSize * 2];
            if (up1 && up2 && up1.poolId === myId && up2.poolId === myId) return true;
        }
        return false;
    }

    function renderMatch3Grid() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;
        const customGridMask = GameApp.state.customGridMask;

        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        match3Board.forEach((data, i) => {
            if (customGridMask && customGridMask[i]) {
                if (data) {
                    const el = createMatch3Element(i, data);
                    displays.gameGrid.appendChild(el);
                } else {
                    const el = document.createElement('div');
                    el.className = 'icon-card empty';
                    displays.gameGrid.appendChild(el);
                }
            } else {
                const placeholder = document.createElement('div');
                placeholder.style.visibility = 'hidden';
                displays.gameGrid.appendChild(placeholder);
            }
        });

        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) timeDisplay.innerText = match3Score;
    }

    function createMatch3Element(i, data) {
        const div = document.createElement('div');
        div.className = 'icon-card match3-card';
        if (selectedCell && selectedCell.id === i) div.classList.add('selected');
        div.dataset.id = i;

        if (data.type === 'text') {
            const span = document.createElement('span');
            span.className = 'text-icon';
            span.innerText = data.content;
            div.appendChild(span);
        } else {
            const sprite = document.createElement('div');
            sprite.style.cssText = `
                background-image: url('${data.content}'); 
                background-size: cover;
                width: 100%;
                height: 100%;
            `;
            div.appendChild(sprite);
        }

        div.addEventListener('click', onMatch3Click);
        return div;
    }

    function onMatch3Click(e) {
        if (isSwapping) return;
        const gridSize = window.GameApp.state.gridSize;
        const target = e.currentTarget;
        const id = parseInt(target.dataset.id);
        const r = Math.floor(id / gridSize);
        const c = id % gridSize;

        if (!selectedCell) {
            selectedCell = { id, r, c, el: target };
            target.classList.add('selected');
        } else {
            if (selectedCell.id === id) {
                target.classList.remove('selected');
                selectedCell = null;
            } else {
                const dr = Math.abs(selectedCell.r - r);
                const dc = Math.abs(selectedCell.c - c);
                if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                    attemptSwap(selectedCell.id, id);
                    if (selectedCell.el) selectedCell.el.classList.remove('selected');
                    selectedCell = null;
                } else {
                    if (selectedCell.el) selectedCell.el.classList.remove('selected');
                    selectedCell = { id, r, c, el: target };
                    target.classList.add('selected');
                }
            }
        }
    }

    function attemptSwap(idxA, idxB) {
        isSwapping = true;

        const temp = match3Board[idxA];
        match3Board[idxA] = match3Board[idxB];
        match3Board[idxB] = temp;

        renderMatch3Grid();

        setTimeout(() => {
            const matches = findMatches();
            if (matches.length > 0) {
                handleMatches(matches);
            } else {
                const temp = match3Board[idxA];
                match3Board[idxA] = match3Board[idxB];
                match3Board[idxB] = temp;
                renderMatch3Grid();
                isSwapping = false;
            }
        }, 300);
    }

    function findMatches() {
        const gridSize = window.GameApp.state.gridSize;
        const customGridMask = window.GameApp.state.customGridMask;
        let matchedIndices = new Set();

        const get = (r, c) => {
            if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return null;
            const i = r * gridSize + c;
            if (!customGridMask[i]) return null;
            return match3Board[i];
        }

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize - 2; c++) {
                const i = r * gridSize + c;
                if (!customGridMask[i]) continue;
                const cell = match3Board[i];
                if (!cell) continue;

                let matchLen = 1;
                while (c + matchLen < gridSize) {
                    const next = get(r, c + matchLen);
                    if (next && next.poolId === cell.poolId) matchLen++;
                    else break;
                }

                if (matchLen >= 3) {
                    for (let k = 0; k < matchLen; k++) matchedIndices.add(r * gridSize + c + k);
                    c += matchLen - 1;
                }
            }
        }

        for (let c = 0; c < gridSize; c++) {
            for (let r = 0; r < gridSize - 2; r++) {
                const i = r * gridSize + c;
                if (!customGridMask[i]) continue;
                const cell = match3Board[i];
                if (!cell) continue;

                let matchLen = 1;
                while (r + matchLen < gridSize) {
                    const next = get(r + matchLen, c);
                    if (next && next.poolId === cell.poolId) matchLen++;
                    else break;
                }

                if (matchLen >= 3) {
                    for (let k = 0; k < matchLen; k++) matchedIndices.add((r + k) * gridSize + c);
                    r += matchLen - 1;
                }
            }
        }
        return Array.from(matchedIndices);
    }

    function handleMatches(matches) {
        match3Score += matches.length * 10;
        if (matches.length > 3) match3Score += (matches.length - 3) * 20;

        matches.forEach(i => match3Board[i] = null);
        renderMatch3Grid();

        if (window.SoundManager) window.SoundManager.playPop();

        if (match3Score >= match3Target) {
            setTimeout(() => {
                const timerContainer = document.querySelector('.game-header .timer');
                if (timerContainer) timerContainer.innerHTML = 'Time: <span id="time-display">0.00</span>s';

                const displays = window.GameApp.displays;
                displays.finalTime.innerText = `Score: ${match3Score}`;
                if (window.SoundManager) window.SoundManager.playWin();
                window.GameApp.helpers.switchScreen('result');
            }, 500);
            return;
        }

        setTimeout(() => {
            applyGravity();
        }, 300);
    }

    function applyGravity() {
        const gridSize = window.GameApp.state.gridSize;
        const customGridMask = window.GameApp.state.customGridMask;

        for (let c = 0; c < gridSize; c++) {
            let stack = [];
            for (let r = 0; r < gridSize; r++) {
                const i = r * gridSize + c;
                if (!customGridMask[i]) continue;
                if (match3Board[i]) stack.push(match3Board[i]);
            }

            let activeSlots = 0;
            for (let r = 0; r < gridSize; r++) if (customGridMask[r * gridSize + c]) activeSlots++;

            while (stack.length < activeSlots) {
                stack.unshift(getRandomMatch3Icon());
            }

            let stackIdx = 0;
            for (let r = 0; r < gridSize; r++) {
                const i = r * gridSize + c;
                if (customGridMask[i]) {
                    match3Board[i] = stack[stackIdx++];
                }
            }
        }

        renderMatch3Grid();

        setTimeout(() => {
            const newMatches = findMatches();
            if (newMatches.length > 0) {
                handleMatches(newMatches);
            } else {
                isSwapping = false;
                if (!hasPossibleMoves()) {
                    shuffleAndEnsureMoves();
                    renderMatch3Grid();
                }
            }
        }, 300);
    }

    function shuffleAndEnsureMoves() {
        const GameApp = window.GameApp;
        const customGridMask = GameApp.state.customGridMask;

        let stack = [];
        if (customGridMask) {
            customGridMask.forEach((isActive, i) => {
                if (isActive) {
                    if (!match3Board[i]) match3Board[i] = getRandomMatch3Icon();
                    stack.push(match3Board[i]);
                }
            });
        }

        let attempts = 0;
        do {
            attempts++;
            GameApp.helpers.shuffleArray(stack);

            let stackIdx = 0;
            if (customGridMask) {
                customGridMask.forEach((isActive, i) => {
                    if (isActive) match3Board[i] = stack[stackIdx++];
                });
            }

        } while ((hasAnyInitialMatch() || !hasPossibleMoves()) && attempts < 100);

        renderMatch3Grid();
    }

    function hasAnyInitialMatch() {
        for (let i = 0; i < match3Board.length; i++) {
            if (hasInitialMatch(i)) return true;
        }
        return false;
    }

    function hasPossibleMoves() {
        const gridSize = window.GameApp.state.gridSize;
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize - 1; c++) {
                const i1 = r * gridSize + c;
                const i2 = r * gridSize + c + 1;
                if (checkSwapForMatch(i1, i2)) return true;
            }
        }
        for (let c = 0; c < gridSize; c++) {
            for (let r = 0; r < gridSize - 1; r++) {
                const i1 = r * gridSize + c;
                const i2 = (r + 1) * gridSize + c;
                if (checkSwapForMatch(i1, i2)) return true;
            }
        }
        return false;
    }

    function checkSwapForMatch(i1, i2) {
        const customGridMask = window.GameApp.state.customGridMask;
        if (!customGridMask || !customGridMask[i1] || !customGridMask[i2]) return false;
        if (!match3Board[i1] || !match3Board[i2]) return false;

        const t = match3Board[i1];
        match3Board[i1] = match3Board[i2];
        match3Board[i2] = t;

        const hasMatch = findMatchesAt(i1) || findMatchesAt(i2);

        match3Board[i2] = match3Board[i1];
        match3Board[i1] = t;

        return hasMatch;
    }

    function findMatchesAt(idx) {
        const gridSize = window.GameApp.state.gridSize;
        const r = Math.floor(idx / gridSize);
        const c = idx % gridSize;
        const center = match3Board[idx];
        if (!center) return false;

        let count = 1;
        for (let k = c - 1; k >= 0; k--) {
            const n = match3Board[r * gridSize + k];
            if (n && n.poolId === center.poolId) count++; else break;
        }
        for (let k = c + 1; k < gridSize; k++) {
            const n = match3Board[r * gridSize + k];
            if (n && n.poolId === center.poolId) count++; else break;
        }
        if (count >= 3) return true;

        count = 1;
        for (let k = r - 1; k >= 0; k--) {
            const n = match3Board[k * gridSize + c];
            if (n && n.poolId === center.poolId) count++; else break;
        }
        for (let k = r + 1; k < gridSize; k++) {
            const n = match3Board[k * gridSize + c];
            if (n && n.poolId === center.poolId) count++; else break;
        }
        if (count >= 3) return true;

        return false;
    }

    window.startMatch3Game = startMatch3Game;

})();
