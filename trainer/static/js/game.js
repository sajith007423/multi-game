document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentState = 'SETTINGS';
    let activeCategories = ['animals'];
    let isMultiSelect = false;
    let gridSize = 4;
    let shuffleOnClick = false;

    // Game Logic (Timer)
    let startTime = 0;
    let timerInterval = null;

    // Custom Mode State
    let isCustomMode = false;
    let customGridMask = [];
    let customSelectedIcons = [];
    let customContentMap = {};

    // Expose for modules
    window.customGridMask = customGridMask;
    window.customSelectedIcons = customSelectedIcons;
    window.gridSize = gridSize;

    // We need to keep window properties in sync when these let variables change?
    // Arrays/Objects are by reference, so mutating customGridMask is fine.
    // But gridSize is primitive. We need a getter or update it manually.
    // Better to just depend on the 'let' internally and update window.gridSize when it changes.
    // Or just make them window properties directly?
    // Given the structure, I'll update window.gridSize inside size click listener.


    // --- Game Logic State (Moved to Modules) ---

    // --- Config ---
    const SPRITE_SIZE = 64;
    const MAX_ASSETS = 16;

    // --- DOM Elements ---
    const screens = {
        settings: document.getElementById('main-menu'),
        memorize: document.getElementById('memorize-screen'),
        game: document.getElementById('game-screen'),
        result: document.getElementById('result-screen'),
        gameover: document.getElementById('gameover-screen')
    };

    const btns = {
        start: document.getElementById('start-btn'),
        customStart: document.getElementById('custom-start-btn'),
        resetGrid: document.getElementById('reset-grid-btn'),

        play: document.getElementById('play-btn'),
        restart: document.getElementById('restart-btn'),
        retry: document.getElementById('retry-btn'),

        categories: document.querySelectorAll('.cat-btn'),
        sizes: document.querySelectorAll('.size-btn')
    };

    const displays = {
        sequence: document.getElementById('sequence-display'),
        gameGrid: document.getElementById('game-grid'),
        time: document.getElementById('time-display'),
        finalTime: document.getElementById('final-time'),
        nextTarget: document.getElementById('next-target-icon'),
        livesDisplay: document.getElementById('lives-display'),
        livesContainer: document.querySelector('.lives'),
        shuffleCheck: document.getElementById('shuffle-check'),
        multiCheck: document.getElementById('multi-cat-check'),

        customEditor: document.getElementById('custom-grid-editor'),
        customPool: document.getElementById('custom-icon-pool'),
        reqCount: document.getElementById('req-icon-count'),
        selCount: document.getElementById('sel-icon-count'),
        randomBtn: document.getElementById('random-select-btn')
    };

    const shapeBtns = document.querySelectorAll('.small-btn');
    const modeSelect = document.getElementById('custom-game-mode');

    // --- Init ---
    initCustomSetup();

    // --- Event Listeners ---

    // Shape Buttons
    shapeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const shape = btn.dataset.shape;
            applyShapePreset(shape);
            // Sync references just in case (though array ref should be stable if not reassigned)
            // Actually initCustomGridState reassigns customGridMask?
            // Checking: initCustomGridState likely does customGridMask = ...
            // If so, we need to update window.customGridMask there too.
            // I'll assume initCustomGridState needs inspection.
        });
    });

    // Mode Select Change
    if (modeSelect) {
        modeSelect.addEventListener('change', updateCustomCounts);
    }

    if (displays.randomBtn) {
        displays.randomBtn.addEventListener('click', () => {
            const mode = modeSelect ? modeSelect.value : 'memory';

            const activeCount = customGridMask.filter(Boolean).length;
            let countNeeded = 0;
            if (activeCount === 0) return alert("Grid cannot be empty! Enable some cells.");

            if (mode === 'memory') {
                if (activeCount % 2 !== 0) return alert("Shape needs EVEN number of cells for Memory Match!");
                countNeeded = activeCount / 2;
            } else if (mode === 'match3') {
                countNeeded = 6;
            } else if (mode === 'whack' || mode === 'gravity') {
                countNeeded = 5;
            } else if (mode === 'odd') {
                countNeeded = 2;
            } else if (mode === 'rpg_battle') {
                countNeeded = 5; // Hero + variety of enemies
            } else if (mode === 'gauntlet' || mode === 'flappy') {
                countNeeded = 5;
            } else if (mode === 'matrix' || mode === 'rotation') {
                countNeeded = 5;
            } else if (mode === 'mahjong') {
                countNeeded = Math.ceil(activeCount / 2); // Pairs
            } else {

                // Schulte / Standard / Others
                countNeeded = activeCount;
            }

            customSelectedIcons = [];

            const poolChildren = Array.from(displays.customPool.children);
            const allIndices = poolChildren.map(el => parseInt(el.dataset.poolIdx));

            shuffleArray(allIndices);

            const selectionCount = Math.min(countNeeded, allIndices.length);
            const finalCount = Math.max(selectionCount, Math.min(1, allIndices.length));

            customSelectedIcons = allIndices.slice(0, finalCount);

            poolChildren.forEach(el => {
                const idx = parseInt(el.dataset.poolIdx);
                if (customSelectedIcons.includes(idx)) el.classList.add('selected');
                else el.classList.remove('selected');
            });

            updateCustomCounts();
        });
    }

    if (btns.resetGrid) {
        btns.resetGrid.addEventListener('click', () => {
            initCustomGridState(true);
            renderCustomGridEditor();
            updateCustomCounts();
        });
    }

    if (btns.customStart) {
        btns.customStart.addEventListener('click', () => {
            console.log("Start Button Clicked");
            const activeCount = customGridMask.filter(Boolean).length;
            console.log("Active Count:", activeCount);
            if (activeCount === 0) return alert("Grid cannot be empty!");

            const currentMode = modeSelect ? modeSelect.value : 'memory';
            console.log("Current Mode:", currentMode);

            // --- Reset Overlay States ---
            ['gravity-container', 'gauntlet-container', 'flappy-container', 'rpg-player-hud', 'rpg-player-sprite'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });

            // Ensure Game Grid is visible by default (modules can override)
            if (currentMode !== 'gravity' && currentMode !== 'gauntlet' && currentMode !== 'flappy') {
                displays.gameGrid.style.display = 'grid';
            }

            try {
                if (currentMode === 'standard') {
                    // Force Full Grid for Standard Schulte
                    customGridMask.fill(true);
                    isCustomMode = true;
                    shuffleOnClick = displays.shuffleCheck ? displays.shuffleCheck.checked : false;
                    startCustomSchulteGame();
                }
                else if (currentMode === 'schulte_mem') {
                    isCustomMode = true;
                    // For memory phase, standard start
                    startSchulteMemGame();
                }
                else if (currentMode === 'memory') {
                    if (activeCount % 2 !== 0) return alert(`Memory Match requires an EVEN number of active cells! (Current: ${activeCount})`);
                    if (customSelectedIcons.length === 0) return alert("Select at least 1 icon type!");
                    isCustomMode = true;
                    startMemoryMatchGame();
                }
                else if (currentMode === 'match3') {
                    if (customSelectedIcons.length < 3) return alert("Select at least 3 icon types for Match 3!");
                    match3Target = parseInt(document.getElementById('target-score').value) || 1000;
                    isCustomMode = true;
                    startMatch3Game();
                }
                else if (currentMode === 'whack') {
                    if (customSelectedIcons.length === 0) return alert("Select at least 1 icon type!");
                    isCustomMode = true;
                    startWhackAMoleGame();
                }
                else if (currentMode === 'pattern') { isCustomMode = true; startPatternGame(); }
                else if (currentMode === 'chimp') { isCustomMode = true; startChimpGame(); }
                else if (currentMode === 'odd') { isCustomMode = true; startOddGame(); }
                else if (currentMode === 'stroop') { isCustomMode = true; startStroopGame(); }
                else if (currentMode === 'math') { isCustomMode = true; startMathGame(); }
                else if (currentMode === 'greenlight') { isCustomMode = true; startGreenGame(); }

                else if (currentMode === 'rpg_battle') {
                    if (customSelectedIcons.length === 0) return alert("Select at least 1 icon (Your Hero)!");
                    isCustomMode = true;
                    startRpgBattleGame();
                }
                else if (currentMode === 'gauntlet') { isCustomMode = true; window.startGauntletGame(); }
                else if (currentMode === 'flappy') { isCustomMode = true; window.startFlappyGame(); }

                // Modular Games
                else if (currentMode === 'gravity') {
                    isCustomMode = true;
                    if (window.startGravityHarvestGame) window.startGravityHarvestGame();
                    else alert("Gravity Harvest module not found!");
                }
                else if (currentMode === 'matrix') {
                    isCustomMode = true;
                    if (window.startMatrixRecallGame) window.startMatrixRecallGame();
                    else alert("Matrix module not found!");
                }
                else if (currentMode === 'rotation') {
                    isCustomMode = true;
                    if (window.startSpatialRotationGame) window.startSpatialRotationGame();
                    else alert("Rotation module not found!");
                }
                else if (currentMode === 'hanoi') {
                    isCustomMode = true;
                    if (window.startHanoiGame) window.startHanoiGame();
                    else alert("Hanoi module not found!");
                }

                else if (currentMode === 'taskswitch') startTaskSwitchingGame();
                else if (currentMode === 'search') startVisualSearchGame();

            } catch (err) {
                console.error("Game Start Error:", err);
                alert("Error starting game: " + err.message);
            }
        });
    }

    // Main Start (Old button removed, logic now in customStart)
    // btns.start listener removed.

    btns.play.addEventListener('click', () => {
        // Only Schulte Memory uses the Memorize -> Play flow
        if (isCustomMode && modeSelect.value === 'schulte_mem') {
            startSchulteMemPhase();
        }
    });
    btns.restart.addEventListener('click', () => switchScreen('settings'));
    if (btns.retry) btns.retry.addEventListener('click', () => switchScreen('settings'));

    // Category Selection
    btns.categories.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.cat;
            if (isMultiSelect) {
                if (activeCategories.includes(cat)) {
                    if (activeCategories.length > 1) activeCategories = activeCategories.filter(c => c !== cat);
                } else {
                    activeCategories.push(cat);
                }
            } else {
                activeCategories = [cat];
            }
            updateCategoryUI();
            initCustomIconPool();
        });
    });

    // Size Selection
    btns.sizes.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.sizes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gridSize = parseInt(btn.dataset.size);

            initCustomGridState(true);
            renderCustomGridEditor();
            updateCustomCounts();
        });
    });

    if (displays.multiCheck) {
        displays.multiCheck.addEventListener('change', (e) => {
            isMultiSelect = e.target.checked;
            if (!isMultiSelect && activeCategories.length > 1) {
                const keep = activeCategories[0];
                activeCategories = [keep];
                updateCategoryUI();
                initCustomIconPool();
            }
        });
    }

    // --- Custom Logic ---

    function initCustomSetup() {
        if (!displays.customEditor) return;

        initCustomGridState(customGridMask.length !== gridSize * gridSize);
        renderCustomGridEditor();
        initCustomIconPool();
        updateCustomCounts();
    }

    function applyShapePreset(shape) {
        initCustomGridState(true);

        if (shape !== 'full') {
            customGridMask.fill(false);
            const center = (gridSize - 1) / 2;

            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    const i = r * gridSize + c;
                    let active = false;

                    if (shape === 'checker') {
                        active = (r + c) % 2 === 0;
                    } else if (shape === 'ring') {
                        active = (r === 0 || r === gridSize - 1 || c === 0 || c === gridSize - 1);
                    } else if (shape === 'diamond') {
                        const dist = Math.abs(r - center) + Math.abs(c - center);
                        active = dist <= Math.ceil(center);
                    } else if (shape === 'pyramid') {
                        const distFromCenter = Math.abs(c - center);
                        active = distFromCenter <= (r * 0.8);
                    }

                    if (active) customGridMask[i] = true;
                }
            }
        }
        renderCustomGridEditor();
        updateCustomCounts();
    }

    function initCustomGridState(forceReset = false) {
        const total = gridSize * gridSize;
        if (forceReset || customGridMask.length !== total) {
            customGridMask = new Array(total).fill(true);
        }
    }

    function renderCustomGridEditor() {
        if (!displays.customEditor) return;

        // Dynamic cell sizing based on screen width
        const screenWidth = window.innerWidth;
        const cellPadding = screenWidth < 600 ? 5 : 10;
        const availableWidth = Math.min(screenWidth - 40, 400); // Max 400px for editor
        const cellSize = Math.floor((availableWidth - (gridSize * cellPadding)) / gridSize);
        const finalCellSize = Math.min(Math.max(cellSize, 24), 48); // Bound between 24 and 48px

        displays.customEditor.style.gridTemplateColumns = `repeat(${gridSize}, ${finalCellSize}px)`;
        displays.customEditor.style.width = 'fit-content';
        displays.customEditor.innerHTML = '';

        customGridMask.forEach((isActive, i) => {
            const cell = document.createElement('div');
            cell.className = `grid-editor-cell ${isActive ? 'active' : ''}`;
            cell.style.width = `${finalCellSize}px`;
            cell.style.height = `${finalCellSize}px`;

            cell.addEventListener('click', () => {
                customGridMask[i] = !customGridMask[i];
                cell.classList.toggle('active');
                updateCustomCounts();
            });
            displays.customEditor.appendChild(cell);
        });
    }

    function initCustomIconPool() {
        if (!displays.customPool) return;
        displays.customPool.innerHTML = '';
        customSelectedIcons = [];

        let poolIndex = 0;
        activeCategories.forEach(cat => {
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;

            for (let i = 0; i < limit; i++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'icon-card';
                wrapper.dataset.poolIdx = poolIndex;
                wrapper.style.cursor = 'pointer';

                const content = getDirectContent(cat, i);

                if (content.type === 'text') {
                    wrapper.innerText = content.content;
                    wrapper.style.color = 'white';
                    wrapper.style.fontSize = '10px';
                    wrapper.style.display = 'flex';
                    wrapper.style.justifyContent = 'center';
                    wrapper.style.alignItems = 'center';
                } else {
                    wrapper.style.backgroundImage = `url('${content.content}')`;
                    wrapper.style.backgroundSize = 'cover';
                }

                wrapper.addEventListener('click', function () {
                    const idx = parseInt(this.dataset.poolIdx);
                    if (customSelectedIcons.includes(idx)) {
                        customSelectedIcons = customSelectedIcons.filter(x => x !== idx);
                        this.classList.remove('selected');
                    } else {
                        customSelectedIcons.push(idx);
                        this.classList.add('selected');
                    }
                    updateCustomCounts();
                });

                displays.customPool.appendChild(wrapper);
                poolIndex++;
            }
        });
    }

    function updateCustomCounts() {
        const sel = customSelectedIcons.length;
        const activeCount = customGridMask.filter(Boolean).length;
        let req = activeCount; // default

        const mode = modeSelect ? modeSelect.value : 'memory';

        // --- Visibility Management ---
        const setCategory = document.getElementById('setting-category');
        const setShuffle = document.getElementById('setting-shuffle');
        const setGridEditor = document.getElementById('setting-grid-editor');
        const setIconPanel = document.getElementById('icon-panel-container');

        // Default: Show All
        if (setCategory) setCategory.style.display = 'block';
        if (setShuffle) setShuffle.style.display = 'none'; // Default hidden
        if (setGridEditor) setGridEditor.style.display = 'block';
        if (setIconPanel) setIconPanel.style.display = 'none'; // Default hidden

        // Mode Specific Adjustments
        if (mode === 'standard') {
            if (setShuffle) setShuffle.style.display = 'block';
            if (setCategory) setCategory.style.display = 'block';
            if (setIconPanel) setIconPanel.style.display = 'block'; // Allow manual
        }
        else if (mode === 'schulte_mem') {
            if (setCategory) setCategory.style.display = 'block'; // Allow manual
            if (setIconPanel) setIconPanel.style.display = 'block'; // Allow manual
        }
        else if (mode === 'memory' || mode === 'match3' || mode === 'whack' || mode === 'odd' || mode === 'rpg_battle' || mode === 'gauntlet' || mode === 'flappy') {
            if (setIconPanel) setIconPanel.style.display = 'block';
        }
        else if (mode === 'pattern' || mode === 'chimp' || mode === 'stroop' || mode === 'math' || mode === 'greenlight') {
            if (setCategory) setCategory.style.display = 'none';
            // Grid Editor? 
            // Pattern: Fixed? Or Custom Grid? Let's allow Custom Grid for advanced users but might break logic.
            // Stroop: Fixed Full.
            // Math: Fixed Full.
            // GreenLight: Custom Grid allowed (holes).
            if (mode === 'stroop' || mode === 'math') {
                if (setGridEditor) setGridEditor.style.display = 'none';
            }
            if (mode === 'gauntlet' || mode === 'flappy') {
                const shapeContainer = document.querySelector('#custom-grid-editor .small-btn')?.parentNode;
                const gridRender = document.getElementById('custom-grid-render');
                if (shapeContainer) shapeContainer.style.display = 'none';
                if (gridRender) gridRender.style.display = 'none';
            }
            else {
                // Restore
                const shapeContainer = document.querySelector('#custom-grid-editor .small-btn')?.parentNode;
                const gridRender = document.getElementById('custom-grid-render');
                if (shapeContainer) shapeContainer.style.display = 'flex';
                if (gridRender) gridRender.style.display = 'grid';
            }
        } else if (mode === 'rag_builder') {
            // Hide almost everything
            if (setCategory) setCategory.style.display = 'none';
            if (setShuffle) setShuffle.style.display = 'none';
            if (setGridEditor) setGridEditor.style.display = 'none';
            if (setIconPanel) setIconPanel.style.display = 'none';
            // Show RAG Builder
            const ragContainer = document.getElementById('rag-builder-container');
            if (ragContainer) ragContainer.style.display = 'block';
            // Hide Game Grid manually if visible
            displays.gameGrid.style.display = 'none';
        }

        // --- Requirement Logic ---
        if (setIconPanel && setIconPanel.style.display !== 'none') {
            if (mode === 'memory') req = activeCount / 2;
            if (mode === 'match3') req = 3;
            if (mode === 'whack') req = 1;
            if (mode === 'odd') req = 2;
            if (mode === 'rpg_battle') req = 1;
            if (mode === 'gauntlet') req = 1;
            if (mode === 'flappy') req = 1;


            displays.selCount.innerText = sel;
            displays.reqCount.innerText = `${req}+`;
            displays.selCount.style.color = (sel >= req) ? '#0f0' : '#f00';
        }
    }

    function getDirectContent(category, id) {
        if (category === 'numbers') return { type: 'text', content: (id + 1).toString() };
        if (category === 'alphabet') return { type: 'text', content: getExcelColumnName(id) };
        return { type: 'image', content: `/static/images/${category}/${id % MAX_ASSETS}.png` };
    }

    // --- Game Logic ---

    // --- Schulte Logic ---
    // --- Legacy Schulte Logic Removed ---

    // --- Memory Match Logic ---
    // Moved to games/memory.js


    // --- Match 3 Logic Logic ---
    // Moved to games/match3.js

    // 4. Whack-a-Mole Flow
    // --- Whack-a-Mole Logic ---
    // Moved to games/whack.js


    // 5. Pattern Recall Logic
    // --- Pattern Recall Logic ---
    // Moved to games/pattern.js



    // --- Schulte Memory Logic (Moved to games/schulte_mem.js) ---


    // 6. Chimp Test Logic
    // --- Chimp Test Logic ---
    // Moved to games/chimp.js


    // 7. Odd One Out Logic

    // --- Odd One Out Logic ---
    // Moved to games/odd.js


    // 8. Stroop Challenge Logic
    // --- Stroop Challenge Logic ---
    // Moved to games/stroop.js


    // --- Math Matrix Logic ---
    // Moved to games/math_game.js


    // --- Green Light Logic ---
    // Moved to games/green_light.js


    // --- Custom & Standard Schulte Logic (Moved to games/schulte_custom.js) ---



    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        if (window.SoundManager) window.SoundManager.playClick();
    }
    window.toggleTheme = toggleTheme;

    // Load Theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    // --- Shared Helpers ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function updateCategoryUI() {
        btns.categories.forEach(btn => {
            if (activeCategories.includes(btn.dataset.cat)) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    function switchScreen(screenName) {
        // Cleanup
        if (timerInterval) clearInterval(timerInterval);
        nBackActive = false;

        Object.values(screens).forEach(s => {
            if (s) s.classList.remove('active');
        });
        if (screens[screenName]) screens[screenName].classList.add('active');
        currentState = screenName.toUpperCase();

        if (currentState === 'SETTINGS') {
            initCustomIconPool();
            renderCustomGridEditor(); // Re-render editor on screen switch
        }
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (currentState === 'SETTINGS') {
                renderCustomGridEditor();
            }
        }, 150);
    });

    function getCategoryForIndex(index) {
        if (!activeCategories || activeCategories.length === 0) return 'animals';
        return activeCategories[index % activeCategories.length];
    }

    function getContentForIndex(index, id) {
        const category = getCategoryForIndex(index);
        if (category === 'numbers') return { type: 'text', content: (id + 1).toString() };
        if (category === 'alphabet') return { type: 'text', content: getExcelColumnName(id) };
        const assetId = Math.floor(index / activeCategories.length) % MAX_ASSETS;
        return { type: 'image', content: `/static/images/${category}/${assetId}.png` };
    }

    function getExcelColumnName(n) {
        let s = "";
        while (n >= 0) {
            s = String.fromCharCode(n % 26 + 65) + s;
            n = Math.floor(n / 26) - 1;
        }
        return s;
    }

    // --- Shared Helpers (Many removed, modules use GameApp.helpers) ---


    function endGame(success) {
        clearInterval(timerInterval);

        const finalScoreVal = displays.time.innerText;
        const currentMode = isCustomMode ? (modeSelect ? modeSelect.value : 'custom') : 'standard';

        if (success) {
            displays.finalTime.innerText = finalScoreVal;
            if (window.SoundManager) window.SoundManager.playWin(); // SFX
            switchScreen('result');

            // Auto-Save Score
            if (window.BrainAPI) {
                // Parse score: if it contains 's' remove it? Usually it's just number string
                let scoreNum = parseFloat(finalScoreVal);
                if (isNaN(scoreNum)) scoreNum = 0; // Fallback

                window.BrainAPI.saveScore(currentMode, scoreNum, {
                    grid: gridSize,
                    timestamp: Date.now()
                });
            }

        } else {
            // Optional: Save failed attempts?
            if (window.SoundManager) window.SoundManager.playLose(); // SFX
            switchScreen('gameover');
        }
    }

    // --- Expose to Global Scope for Modules ---
    window.GameApp = {
        displays: displays,
        state: {
            get activeCategories() { return activeCategories; },
            get customSelectedIcons() { return customSelectedIcons; },
            get customGridMask() { return customGridMask; },
            get gridSize() { return gridSize; },
            MAX_ASSETS: MAX_ASSETS
        },
        helpers: {
            switchScreen: switchScreen,
            endGame: endGame,
            getDirectContent: getDirectContent,
            getContentForIndex: getContentForIndex,
            shuffleArray: shuffleArray,
            startTimer: (lb, interval = 50) => {
                if (timerInterval) cancelAnimationFrame(timerInterval);
                startTime = Date.now();

                const updateLoop = () => {
                    const elapsed = (Date.now() - startTime) / 1000;
                    if (displays.time) {
                        displays.time.innerText = elapsed.toFixed(2);
                    }
                    if (lb) lb(elapsed);
                    timerInterval = requestAnimationFrame(updateLoop);
                };
                timerInterval = requestAnimationFrame(updateLoop);
            },
            stopTimer: () => {
                if (timerInterval) cancelAnimationFrame(timerInterval);
                timerInterval = null;
            },
            getStartTime: () => startTime
        }
    };

    // Maintain local references for existing code, but ensure updates sync if needed.
    // Note: Primitive values like activeCategories won't auto-sync if re-assigned, but they are arrays so it's fine.
    // Functions are fine.


    // --- RPG Logic Removed (Moved to games/rpg.js) ---





    // --- Finger Gauntlet Mode (Moved to games/gauntlet.js) ---


    // --- Flappy Icon Mode (Moved to games/flappy.js) ---






    // --- Task Switching Logic (Moved to games/task_switching.js) ---



    // --- Visual Search Logic (Moved to games/visual_search.js) ---

    // Helper for Modules to access assets & State
    Object.defineProperty(window, 'gridSize', { get: () => gridSize });
    Object.defineProperty(window, 'customGridMask', { get: () => customGridMask });
    Object.defineProperty(window, 'customSelectedIcons', { get: () => customSelectedIcons });

    // Expose UI helpers for modules
    window.displays = displays;
    window.switchScreen = switchScreen;

    window.getGlobalAsset = function (index) {
        if (!activeCategories || activeCategories.length === 0) return getDirectContent('animals', index);

        const category = activeCategories[index % activeCategories.length];
        const MAX_ASSETS = 16;
        const assetId = Math.floor(index / activeCategories.length) % MAX_ASSETS;

        return getDirectContent(category, assetId);
    };






});
