(function () {
    // --- Custom Schulte State ---
    let customSequence = [];
    let customCurrentIndex = 0;

    function startCustomSchulteGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const state = GameApp.state;

        const activeCount = state.customGridMask.filter(Boolean).length;

        // Setup Sequence: 0 to N-1
        customSequence = [];
        for (let i = 0; i < activeCount; i++) customSequence.push(i);

        customCurrentIndex = 0;
        let boardItems = [...customSequence];

        renderCustomSchulteGrid(boardItems);

        // Timer
        GameApp.helpers.startTimer(updateTimerDisplay, 50);

        // Reset Time Display
        const timerContainer = displays.time.parentElement;
        if (timerContainer) timerContainer.innerHTML = 'Time: <span id="time-display">0.00</span>s';
        displays.time = document.getElementById('time-display');

        updateNextTarget();
        GameApp.helpers.switchScreen('game');
    }

    function updateTimerDisplay() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const t = (Date.now() - GameApp.helpers.getStartTime()) / 1000;
        if (displays.time) displays.time.innerText = t.toFixed(2);
    }

    function renderCustomSchulteGrid(items) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const state = GameApp.state;
        const gridSize = state.gridSize;

        displays.gameGrid.dataset.size = gridSize;
        // Fix for sprite size reference. Assume 64 if not exposed, or just use 1fr.
        // GameApp doesn't expose SPRITE_SIZE.
        let templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        const shuffled = [...items];
        GameApp.helpers.shuffleArray(shuffled);

        let itemIndex = 0;
        state.customGridMask.forEach(isActive => {
            if (isActive) {
                if (itemIndex < shuffled.length) {
                    const seqId = shuffled[itemIndex++];
                    const el = createCustomSchulteElement(seqId);

                    if (seqId < customSequence[customCurrentIndex]) {
                        el.classList.add('correct');
                        el.style.opacity = '0.5';
                        // Already clicked
                        el.removeEventListener('click', onCustomIconClick);
                        el.onclick = null; // Safety
                    }
                    displays.gameGrid.appendChild(el);
                }
            } else {
                const placeholder = document.createElement('div');
                placeholder.style.visibility = 'hidden';
                displays.gameGrid.appendChild(placeholder);
            }
        });
    }

    function createCustomSchulteElement(seqId) {
        const GameApp = window.GameApp;
        const state = GameApp.state;
        const activeCategories = state.activeCategories;
        const customSelectedIcons = state.customSelectedIcons;
        const MAX_ASSETS = state.MAX_ASSETS;

        const div = document.createElement('div');
        div.className = 'icon-card';
        div.dataset.id = seqId;

        // Custom Schulte Content Generation
        let content;

        if (customSelectedIcons.length > 0) {
            // Manual Icons Strategy
            const poolFn = [];
            activeCategories.forEach(cat => {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : 16;
                for (let i = 0; i < limit; i++) poolFn.push({ cat, id: i });
            });

            const idxInSelected = seqId % customSelectedIcons.length;
            const poolIdx = customSelectedIcons[idxInSelected];

            if (poolFn[poolIdx]) {
                const item = poolFn[poolIdx];
                content = GameApp.helpers.getDirectContent(item.cat, item.id);
            } else {
                content = { type: 'text', content: '?' };
            }

        } else {
            // Standard Auto-Gen
            const cat = activeCategories[seqId % activeCategories.length];
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
            // logic from game.js:
            const assetId = Math.floor(seqId / activeCategories.length) % limit;
            content = GameApp.helpers.getDirectContent(cat, assetId);
        }

        if (content.type === 'text') {
            const span = document.createElement('span');
            span.className = 'text-icon';
            span.innerText = content.content;
            div.appendChild(span);
        } else {
            const sprite = document.createElement('div');
            sprite.style.cssText = `
                background-image: url('${content.content}'); 
                background-size: cover;
                width: 100%;
                height: 100%;
            `;
            div.appendChild(sprite);
        }

        div.onclick = (e) => onCustomIconClick(e, seqId);
        return div;
    }

    function onCustomIconClick(e, clickedId) {
        const GameApp = window.GameApp;
        const target = e.currentTarget;

        if (clickedId === customSequence[customCurrentIndex]) {
            target.classList.add('correct');
            if (window.SoundManager) window.SoundManager.playPop();

            customCurrentIndex++;

            if (customCurrentIndex >= customSequence.length) {
                GameApp.helpers.stopTimer();
                GameApp.helpers.endGame(true);
            } else {
                updateNextTarget();
                // Shuffle on Click Check
                const shuffleCheck = document.getElementById('shuffle-check');
                if (shuffleCheck && shuffleCheck.checked) {
                    setTimeout(() => {
                        let boardItems = [...customSequence];
                        renderCustomSchulteGrid(boardItems);
                    }, 100);
                }
            }
        } else {
            target.classList.add('wrong');
            if (window.SoundManager) window.SoundManager.playError();
            setTimeout(() => {
                GameApp.helpers.endGame(false);
            }, 500);
        }
    }

    function updateNextTarget() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const state = GameApp.state;

        if (customCurrentIndex < customSequence.length) {
            const id = customSequence[customCurrentIndex];

            // Re-resolve content for preview
            // (Same logic as createCustomSchulteElement but just getting data)
            let data;
            const activeCategories = state.activeCategories;
            const customSelectedIcons = state.customSelectedIcons;
            const MAX_ASSETS = state.MAX_ASSETS;

            if (customSelectedIcons.length > 0) {
                const poolFn = [];
                activeCategories.forEach(cat => {
                    const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : 16;
                    for (let i = 0; i < limit; i++) poolFn.push({ cat, id: i });
                });
                const idxInSelected = id % customSelectedIcons.length;
                const poolIdx = customSelectedIcons[idxInSelected];
                if (poolFn[poolIdx]) {
                    const item = poolFn[poolIdx];
                    data = GameApp.helpers.getDirectContent(item.cat, item.id);
                } else data = { type: 'text', content: '?' };
            } else {
                const cat = activeCategories[id % activeCategories.length];
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
                const assetId = Math.floor(id / activeCategories.length) % limit;
                data = GameApp.helpers.getDirectContent(cat, assetId);
            }

            const container = document.createElement('div');
            container.style.cssText = `width: 32px; height: 32px; overflow: hidden; display: flex; justify-content: center; align-items: center;`;
            if (data.type === 'text') {
                const span = document.createElement('span');
                span.className = 'text-icon';
                span.style.fontSize = '12px';
                span.innerText = data.content;
                container.appendChild(span);
            } else {
                const img = document.createElement('img');
                img.src = data.content;
                img.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
                container.appendChild(img);
            }
            if (displays.nextTarget) {
                displays.nextTarget.innerHTML = '';
                displays.nextTarget.appendChild(container);
            }
        }
    }

    window.startCustomSchulteGame = startCustomSchulteGame;

})();
