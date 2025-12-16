(function () {
    // --- Memory Match State ---
    let matchesFound = 0;
    let firstCard = null;
    let isProcessingMatch = false;
    let customContentMap = {};
    let totalPairs = 0;
    const SPRITE_SIZE = 64;

    function startMemoryMatchGame() {
        matchesFound = 0;
        firstCard = null;
        isProcessingMatch = false;
        customContentMap = {};

        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const customGridMask = GameApp.state.customGridMask;
        const customSelectedIcons = GameApp.state.customSelectedIcons;
        const activeCategories = GameApp.state.activeCategories;
        const MAX_ASSETS = GameApp.state.MAX_ASSETS;

        const activeCount = customGridMask.filter(Boolean).length;
        totalPairs = activeCount / 2;

        let pairTypes = [];
        let sourcePool = (customSelectedIcons && customSelectedIcons.length > 0) ? [...customSelectedIcons] : [0, 1, 2, 3, 4, 5, 6, 7];
        // Fallback if no selection but custom mode logic implies selection. 
        // If empty, auto-fill from 0-15?
        if (!sourcePool || sourcePool.length === 0) {
            // Should not happen if UI validates, but safely handle
            sourcePool = Array.from({ length: 16 }, (_, i) => i);
        }

        while (pairTypes.length < totalPairs) {
            if (sourcePool.length === 0) sourcePool = (customSelectedIcons && customSelectedIcons.length > 0) ? [...customSelectedIcons] : Array.from({ length: 16 }, (_, i) => i);
            GameApp.helpers.shuffleArray(sourcePool);
            pairTypes.push(sourcePool.pop());
        }

        const pairContentData = pairTypes.map(poolIdx => {
            let runningCount = 0;
            for (const cat of activeCategories) {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
                if (poolIdx < runningCount + limit) {
                    const localId = poolIdx - runningCount;
                    return GameApp.helpers.getDirectContent(cat, localId);
                }
                runningCount += limit;
            }
            return { type: 'text', content: '?' };
        });

        let deck = [];
        pairContentData.forEach(data => {
            deck.push(data);
            deck.push(data);
        });

        GameApp.helpers.shuffleArray(deck);

        deck.forEach((data, i) => {
            customContentMap[i] = data;
        });

        renderMemoryMatchGrid(deck.length);

        GameApp.helpers.startTimer(updateTimer, 50);

        displays.nextTarget.innerHTML = '<span style="font-size:10px;">MATCH</span>';
        GameApp.helpers.switchScreen('game');
    }

    function updateTimer() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const startTime = GameApp.helpers.getStartTime();
        if (!startTime) return;
        const elapsed = (Date.now() - startTime) / 1000;
        displays.time.innerText = elapsed.toFixed(2);
    }

    function renderMemoryMatchGrid(itemCount) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;
        const customGridMask = GameApp.state.customGridMask;

        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        let deckIndex = 0;

        if (customGridMask) {
            customGridMask.forEach(isActive => {
                if (isActive) {
                    if (deckIndex < itemCount) {
                        const id = deckIndex;
                        const el = createMemoryCardElement(id);
                        displays.gameGrid.appendChild(el);
                        deckIndex++;
                    }
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.style.visibility = 'hidden';
                    displays.gameGrid.appendChild(placeholder);
                }
            });
        }
    }

    function createMemoryCardElement(id) {
        const div = document.createElement('div');
        div.className = 'icon-card hidden';
        div.dataset.id = id;

        const data = customContentMap[id];
        let contentEl;

        if (data.type === 'text') {
            const span = document.createElement('span');
            span.className = 'text-icon';
            span.innerText = data.content;
            contentEl = span;
        } else {
            const sprite = document.createElement('div');
            sprite.style.cssText = `
                background-image: url('${data.content}'); 
                background-size: cover;
                width: 100%;
                height: 100%;
            `;
            contentEl = sprite;
        }

        div.appendChild(contentEl);

        // Add internal style for hidden state locally or assume CSS handles .hidden > * { display: none }?
        // In game.js line 872: style.innerText = `.icon-card.hidden[data-id="${id}"] > * { display: none; }`;
        // This was dynamic style injection per card?? That's weird.
        // It's probably to handle specific ID hiding.
        // I'll replicate it.
        const style = document.createElement('style');
        style.innerText = `.icon-card.hidden[data-id="${id}"] > * { display: none; }`;
        div.appendChild(style);

        div.addEventListener('click', onMemoryCardClick);
        return div;
    }

    function onMemoryCardClick(e) {
        if (isProcessingMatch) return;
        const target = e.currentTarget;
        const id = parseInt(target.dataset.id);

        if (!target.classList.contains('hidden')) return;

        target.classList.remove('hidden');

        if (!firstCard) {
            firstCard = { id: id, el: target, data: customContentMap[id] };
        } else {
            const secondCard = { id: id, el: target, data: customContentMap[id] };
            isProcessingMatch = true;

            const isMatch = (firstCard.data.content === secondCard.data.content &&
                firstCard.data.type === secondCard.data.type);

            if (isMatch) {
                matchesFound++;
                if (window.SoundManager) window.SoundManager.playPop();
                setTimeout(() => {
                    firstCard.el.classList.add('matched');
                    secondCard.el.classList.add('matched');
                    firstCard = null;
                    isProcessingMatch = false;

                    if (matchesFound >= totalPairs) {
                        window.GameApp.helpers.endGame(true);
                    }
                }, 500);
            } else {
                if (window.SoundManager) window.SoundManager.playError(); // Optional: sound for miss
                setTimeout(() => {
                    firstCard.el.classList.add('hidden');
                    secondCard.el.classList.add('hidden');
                    firstCard = null;
                    isProcessingMatch = false;
                }, 1000);
            }
        }
    }

    window.startMemoryMatchGame = startMemoryMatchGame;

})();
