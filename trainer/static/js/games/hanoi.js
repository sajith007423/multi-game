(function () {
    let pegs = [[], [], []]; // Array of 3 arrays, holding disk sizes
    let selectedPeg = -1;
    let moves = 0;
    let diskCount = 3;
    let timerInter = null;

    function startHanoiGame() {
        // Reset State
        pegs = [[], [], []];
        selectedPeg = -1;
        moves = 0;

        // Difficulty: Use grid size or default to 3
        // Grid size 3 -> 3 disks, 4 -> 4 disks... max 7
        const gridSize = parseInt(document.getElementById('grid-size-val')?.innerText || 4);
        diskCount = Math.max(3, Math.min(gridSize, 7)); // Clamp between 3 and 7

        // Initialize Peg 0
        for (let i = diskCount; i >= 1; i--) {
            pegs[0].push(i);
        }

        renderHanoi();

        // Setup Timer
        const displays = window.GameApp.displays;
        const startTime = Date.now();
        if (timerInter) clearInterval(timerInter);

        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = 'Time: <span id="time-display">0.00</span>s | Moves: <span id="hanoi-moves">0</span>';
        displays.time = document.getElementById('time-display');
        const movesDisplay = document.getElementById('hanoi-moves');

        timerInter = setInterval(() => {
            const now = Date.now();
            const diff = (now - startTime) / 1000;
            if (displays.time) displays.time.innerText = diff.toFixed(2);
        }, 100);

        window.GameApp.helpers.switchScreen('game');
    }

    function renderHanoi() {
        const displays = window.GameApp.displays;
        displays.gameGrid.innerHTML = '';
        displays.gameGrid.style.display = 'flex';
        displays.gameGrid.style.justifyContent = 'space-around';
        displays.gameGrid.style.alignItems = 'flex-end';
        displays.gameGrid.style.height = '400px';
        // Force grid layout reset
        displays.gameGrid.style.gridTemplateColumns = 'none';

        // Create 3 Pegs
        [0, 1, 2].forEach(pegIdx => {
            const pegContainer = document.createElement('div');
            pegContainer.className = 'hanoi-peg-container';
            pegContainer.style.cssText = `
                display: flex; 
                flex-direction: column-reverse; 
                align-items: center; 
                width: 30%; 
                height: 100%; 
                border-bottom: 5px solid #555; 
                position: relative;
                cursor: pointer;
            `;
            if (selectedPeg === pegIdx) {
                pegContainer.style.background = 'rgba(255, 255, 255, 0.1)';
                pegContainer.style.borderBottomColor = '#0f0';
            }

            // The Pole
            const pole = document.createElement('div');
            pole.style.cssText = `
                position: absolute; 
                bottom: 0; 
                width: 10px; 
                height: 90%; 
                background: #555; 
                z-index: 0;
                border-radius: 5px 5px 0 0;
            `;
            pegContainer.appendChild(pole);

            // Disks
            pegs[pegIdx].forEach(diskSize => {
                const disk = document.createElement('div');
                const widthPct = 20 + (diskSize / diskCount) * 70; // 20% to 90%

                // Color based on size
                const hue = (diskSize * 40) % 360;

                disk.style.cssText = `
                    width: ${widthPct}%;
                    height: 30px;
                    background: hsl(${hue}, 70%, 50%);
                    z-index: 1;
                    margin-bottom: 2px;
                    border-radius: 5px;
                    border: 1px solid rgba(0,0,0,0.5);
                    box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
                `;
                pegContainer.appendChild(disk);
            });

            // Click Handler
            pegContainer.onclick = () => onPegClick(pegIdx);

            displays.gameGrid.appendChild(pegContainer);
        });
    }

    function onPegClick(pegIdx) {
        if (selectedPeg === -1) {
            // Select Source
            if (pegs[pegIdx].length === 0) return; // Empty peg
            selectedPeg = pegIdx;
            if (window.SoundManager) window.SoundManager.playClick();
        } else {
            // Move or Deselect
            if (selectedPeg === pegIdx) {
                selectedPeg = -1; // Deselect
            } else {
                // Try Move
                const sourceDisk = pegs[selectedPeg][pegs[selectedPeg].length - 1];
                const targetDisk = pegs[pegIdx].length > 0 ? pegs[pegIdx][pegs[pegIdx].length - 1] : 999;

                if (sourceDisk < targetDisk) {
                    // Valid Move
                    pegs[pegIdx].push(pegs[selectedPeg].pop());
                    selectedPeg = -1;
                    moves++;
                    document.getElementById('hanoi-moves').innerText = moves;
                    if (window.SoundManager) window.SoundManager.playPop();
                    checkWin();
                } else {
                    // Invalid
                    if (window.SoundManager) window.SoundManager.playError();
                    selectedPeg = -1;
                }
            }
        }
        renderHanoi();
    }

    function checkWin() {
        // If all disks are on peg 2 (index 2) OR peg 1 (index 1)
        if (pegs[1].length === diskCount || pegs[2].length === diskCount) {
            clearInterval(timerInter);
            window.GameApp.helpers.endGame(true);
        }
    }

    // Expose
    window.startHanoiGame = startHanoiGame;

})();
