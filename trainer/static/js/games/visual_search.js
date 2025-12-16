(function () {
    // --- Visual Search State ---
    let searchScore = 0;
    let searchTimeLimit = 60;
    let searchTargetIndex = -1;
    // We use main timer for countdown

    function startVisualSearchGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        searchScore = 0;
        searchTimeLimit = 60;

        GameApp.helpers.stopTimer();

        // Custom Timer for Countdown
        // We can reuse startTimer but it counts UP usually?
        // GameApp.helpers.startTimer is a simple wrapper.
        // We need a countdown. We can use startTimer and check difference.

        GameApp.helpers.startTimer(() => {
            const elapsed = (Date.now() - GameApp.helpers.getStartTime()) / 1000;
            const remain = Math.max(0, searchTimeLimit - elapsed);
            if (displays.time) displays.time.innerText = remain.toFixed(1);

            if (remain <= 0) {
                GameApp.helpers.stopTimer();
                GameApp.helpers.endGame(true);
                if (displays.finalTime) displays.finalTime.innerText = `Found: ${searchScore}`;
            }
        }, 100);

        renderSearchLevel();
        GameApp.helpers.switchScreen('game');
    }

    function renderSearchLevel() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const activeCategories = GameApp.state.activeCategories;
        const customSelectedIcons = GameApp.state.customSelectedIcons;

        // Dynamic Grid Size based on score
        const size = Math.min(10, 5 + Math.floor(searchScore / 3));
        displays.gameGrid.dataset.size = size;

        let templateCols = `repeat(${size}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;

        const total = size * size;
        searchTargetIndex = Math.floor(Math.random() * total);

        // --- Determine Assets (Text vs Custom Icons) ---
        let useIcons = false;
        let targetContent = { type: 'text', content: 'R' };
        let distractorContent = { type: 'text', content: 'P' };

        if (customSelectedIcons && customSelectedIcons.length >= 2) {
            useIcons = true;
            // Pick two distinct icons
            const s1 = customSelectedIcons[Math.floor(Math.random() * customSelectedIcons.length)];
            let s2 = s1;
            let attempts = 0;
            while (s2 === s1 && attempts < 10) {
                s2 = customSelectedIcons[Math.floor(Math.random() * customSelectedIcons.length)];
                attempts++;
            }

            targetContent = GameApp.helpers.getContentForIndex(s1, s1);
            distractorContent = GameApp.helpers.getContentForIndex(s2, s2);
        }

        displays.gameGrid.innerHTML = '';

        for (let i = 0; i < total; i++) {
            const div = document.createElement('div');
            div.className = 'icon-card';
            div.style.background = '#222';
            div.style.padding = '2px';

            const isTarget = (i === searchTargetIndex);
            const data = isTarget ? targetContent : distractorContent;

            if (data.type === 'text') {
                const span = document.createElement('span');
                span.className = 'text-icon';
                span.innerText = data.content;
                span.style.fontSize = (size > 8) ? '16px' : '24px';

                if (!useIcons && !isTarget) {
                    if (Math.random() > 0.5) span.style.transform = 'rotate(180deg)';
                }
                div.appendChild(span);
            } else {
                const img = document.createElement('div');
                img.style.cssText = `
                    background-image: url('${data.content}'); 
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    width: 100%;
                    height: 100%;
                `;
                div.appendChild(img);
            }

            div.onclick = () => handleSearchClick(i);
            displays.gameGrid.appendChild(div);
        }

        updateSearchHUD(targetContent);
    }

    function updateSearchHUD(targetContent) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        displays.nextTarget.innerHTML = '';

        const instr = document.createElement('div');
        instr.style.display = 'flex';
        instr.style.alignItems = 'center';
        instr.style.justifyContent = 'center';
        instr.style.gap = '10px';

        const label = document.createElement('span');
        label.innerText = "FIND:";
        instr.appendChild(label);

        const preview = document.createElement('div');
        preview.style.width = '32px'; preview.style.height = '32px';
        preview.style.display = 'flex'; preview.style.alignItems = 'center'; preview.style.justifyContent = 'center';

        if (targetContent.type === 'text') {
            preview.innerText = targetContent.content;
            preview.className = 'text-icon';
            preview.style.fontSize = '20px';
        } else {
            preview.style.backgroundImage = `url('${targetContent.content}')`;
            preview.style.backgroundSize = 'contain';
            preview.style.backgroundRepeat = 'no-repeat';
        }
        instr.appendChild(preview);

        const scoreSpan = document.createElement('span');
        scoreSpan.innerText = ` | Found: ${searchScore}`;
        instr.appendChild(scoreSpan);

        displays.nextTarget.appendChild(instr);
    }

    function handleSearchClick(i) {
        if (i === searchTargetIndex) {
            searchScore++;
            if (window.SoundManager) window.SoundManager.playPop();
            renderSearchLevel();
        } else {
            // Penalty? Maybe reduce time?
            const GameApp = window.GameApp;
            const displays = GameApp.displays;

            if (window.SoundManager) window.SoundManager.playError();

            searchTimeLimit -= 2; // Lose 2 seconds
            // Visual shake?
            if (displays.gameGrid) {
                displays.gameGrid.style.borderColor = '#f00';
                setTimeout(() => displays.gameGrid.style.borderColor = '', 200);
            }
        }
    }

    window.startVisualSearchGame = startVisualSearchGame;

})();
