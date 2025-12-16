(function () {
    // --- Chimp Test State ---
    let chimpSequence = []; // Unused in original? Ah, logic uses usedIndices implicitly.
    let chimpCurrentIndex = 0;
    let chimpLevel = 4; // Start with 4 numbers

    function startChimpGame() {
        const GameApp = window.GameApp;

        chimpSequence = []; // Reset local state
        chimpCurrentIndex = 0;
        chimpLevel = 4;

        startChimpRound();
        GameApp.helpers.switchScreen('game');
    }

    function startChimpRound() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const gridSize = GameApp.state.gridSize;

        chimpSequence = [];
        chimpCurrentIndex = 0;
        if (displays.time) displays.time.innerText = `Lvl: ${chimpLevel}`;
        displays.nextTarget.innerHTML = '';

        const count = gridSize * gridSize;
        if (chimpLevel > count) chimpLevel = count; // Cap at max cells

        // Pick distinct positions
        const indices = [];
        for (let i = 0; i < count; i++) indices.push(i);
        GameApp.helpers.shuffleArray(indices);

        const usedIndices = indices.slice(0, chimpLevel);

        // Render
        displays.gameGrid.dataset.size = gridSize;
        displays.gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card chimp-cell';
            cell.dataset.id = i;

            if (usedIndices.includes(i)) {
                // Determine number value 1..N based on position in usedIndices
                const numVal = usedIndices.indexOf(i) + 1; // 1-based logic
                cell.dataset.num = numVal;
                cell.innerText = numVal;
                cell.classList.add('visible');

                cell.onclick = () => onChimpClick(i, numVal);
            } else {
                cell.style.visibility = 'hidden';
            }
            displays.gameGrid.appendChild(cell);
        }
    }

    function onChimpClick(id, numVal) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        const expected = chimpCurrentIndex + 1;

        if (numVal === expected) {
            // Correct click
            if (numVal === 1) {
                // HIDE ALL OTHERS
                Array.from(displays.gameGrid.children).forEach(c => {
                    if (c.classList.contains('visible') && c.dataset.num > 1) {
                        c.classList.add('masked');
                        c.innerText = ''; // Hide number
                    }
                });
            }

            const cell = displays.gameGrid.children[id];
            cell.classList.remove('visible', 'masked');
            cell.innerText = ''; // Clear
            cell.onclick = null;

            chimpCurrentIndex++;

            if (chimpCurrentIndex >= chimpLevel) {
                chimpLevel++;

                // Play success sound?
                if (window.SoundManager) window.SoundManager.playPop();

                setTimeout(startChimpRound, 500);
            }
        } else {
            // Wrong
            if (window.SoundManager) window.SoundManager.playError();
            GameApp.helpers.endGame(false);
        }
    }

    window.startChimpGame = startChimpGame;

})();
