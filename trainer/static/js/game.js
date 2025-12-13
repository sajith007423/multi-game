document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentState = 'SETTINGS';
    let activeCategories = ['animals'];
    let isMultiSelect = false;
    let gridSize = 4;
    let shuffleOnClick = false;

    // Game Logic (Standard)
    let sequence = [];
    let currentIndex = 0;
    let startTime = 0;
    let timerInterval = null;

    // Custom Mode State
    let isCustomMode = false;
    let customGridMask = [];
    let customSelectedIcons = [];
    let customContentMap = {};

    // Memory Match Game State
    let firstCard = null;
    let isProcessingMatch = false;
    let matchesFound = 0;
    let totalPairs = 0;

    // Match 3 Game State
    let match3Score = 0;
    let match3Target = 1000;
    let isSwapping = false;
    let selectedCell = null;

    // Whack-a-Mole State
    let whackScore = 0;
    let whackLives = 5;
    let activeMoleTimeouts = {}; // Map cell index -> timeout ID
    let whackSpawnInterval = null;

    // Pattern Game State
    let patternSequence = [];
    let patternInputIndex = 0;
    let isPatternPlaying = false;

    // Chimp Test State
    let chimpSequence = [];
    let chimpCurrentIndex = 0;
    let chimpLevel = 4;

    // Odd One Out State
    let oddTargetIndex = -1;
    let oddScore = 0;
    let oddLives = 3;
    let oddRoundStartTime = 0;

    // Stroop State
    let stroopScore = 0;
    let stroopLives = 3;
    let stroopTargetColor = '';

    // Math Matrix State
    let mathScore = 0;
    let mathTarget = 0;
    let mathCurrentSum = 0;
    let mathSelectedCells = [];
    let mathLives = 3;

    // Green Light State
    let greenScore = 0;
    let greenLives = 5;
    let greenSpawnInterval = null;
    let greenActiveTimeouts = {};

    // RPG Battle State
    let rpgHero = null; // { idx, hp, maxHp, attack }
    let rpgEnemies = {}; // map cellIndex -> { hp, maxHp, name, hue }
    let rpgScore = 0;
    const RPG_NAMES = [
        "Arog", "Balthazar", "Cthulhu", "Drago", "Elara", "Fenrir", "Gorlock", "Hades", "Ignis", "Jinx",
        "Kraken", "Loki", "Morgoth", "Necron", "Odin", "Pyros", "Quasar", "Ragnar", "Sauron", "Thanos",
        "Ultron", "Vader", "Warlock", "Xerxes", "Ymir", "Zeus", "Artemis", "Bane", "Cypher", "Dante",
        "Erebus", "Fay", "Goliath", "Hera", "Icarus", "Joker", "Kratos", "Leonidas", "Medusa", "Nemesis",
        "Orion", "Poseidon", "Quake", "Ra", "Scorpion", "Thor", "Uranus", "Venom", "Wraith", "Xena",
        "Yoda", "Zorro", "Ash", "Blaze", "Cole", "Drake", "Ember", "Flint", "Gage", "Hunter",
        "Iron", "Jax", "Kane", "Lance", "Maverick", "Nash", "Onyx", "Pike", "Quartz", "Rex",
        "Slash", "Talon", "Ursa", "Viper", "Wolf", "Xander", "Yuri", "Zane", "Ace", "Bolt",
        "Cash", "Duke", "Edge", "Frost", "Ghost", "Hawk", "Ice", "Jet", "Knox", "Link",
        "Mick", "Neo", "Oz", "Punk", "Q", "Riff", "Spike", "Tank", "Uzi", "Vox",
        "Web", "X", "Yalo", "Zed", "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta",
        "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi",
        "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega", "Aeris", "Barret",
        "Cloud", "Dva", "Ezreal", "Fox", "Garen", "Hanzo", "Irelia", "Jinx", "Katarina", "Lux",
        "Mario", "Nami", "Ornn", "Pikachu", "Qiyana", "Riven", "Sonic", "Teemo", "Urgot", "Vi",
        "Wukong", "Xayah", "Yasuo", "Zed", "Arthas", "Bowser", "Crash", "Diablo", "Eggman", "Freeman",
        "Ganon", "Heihachi", "Illidan", "Jak", "Kirby", "Link", "Mario", "Ness", "Olimar", "Pacman",
        "Qbert", "Ryu", "Samus", "Tracer", "Uub", "Voldo", "Wario", "X", "Yoshi", "Zelda",
        "Abomination", "Banshee", "Chimera", "Demon", "Elemental", "Fiend", "Ghoul", "Harpy", "Imp", "Jinn",
        "Kobold", "Lich", "Minotaur", "Naga", "Ogre", "Phantom", "Quasit", "Revenant", "Skeleton", "Troll",
        "Undead", "Vampire", "Werewolf", "Xorn", "Yeti", "Zombie", "Alien", "Borg", "Cylon", "Dalek",
        "Ewok", "Ferengi", "Gorn", "Hutt", "Insectoid", "Jawa", "Klingon", "Limpet", "Martian", "Na'vi",
        "Ood", "Predator", "Q", "Replicant", "Sith", "T-800", "Uruk-hai", "Vulcan", "Wookiee", "Xenomorph",
        "Yautja", "Zerg", "Apollo", "Bacchus", "Ceres", "Diana", "Eros", "Flora", "Gaea", "Hebe",
        "Iris", "Janus", "Kore", "Luna", "Mars", "Nox", "Ops", "Pluto", "Quirinus", "Roma",
        "Sol", "Terra", "Ulysses", "Venus", "Winds", "Xanthus", "Ymir", "Zephyr", "Amber", "Beryl",
        "Coral", "Diamond", "Emerald", "Feldspar", "Garnet", "Heliodor", "Iolite", "Jade", "Kunzite", "Lapis",
        "Malachite", "Nephrite", "Opal", "Pearl", "Quartz", "Ruby", "Sapphire", "Topaz", "Unakite", "Variscite",
        "Wavellite", "Xenotime", "Yellow", "Zircon", "Acorn", "Birch", "Cedar", "Dogwood", "Elm", "Fir",
        "Ginkgo", "Hazel", "Ivy", "Juniper", "Kelp", "Laurel", "Maple", "Nettle", "Oak", "Pine",
        "Quince", "Rose", "Spruce", "Tulip", "Umbrella", "Violet", "Willow", "Xylos", "Yew", "Zinnia",
        "Ant", "Bee", "Cicada", "Dragonfly", "Earwig", "Flea", "Gnat", "Hornet", "Inchworm", "June",
        "Katydid", "Locust", "Mantis", "Nit", "Owlfly", "Pugh", "Queen", "Roach", "Spider", "Termite",
        "Underwing", "Velvet", "Wasp", "Xerce", "Yellow", "Zebra", "Adder", "Boa", "Cobra", "Dart",
        "Eel", "Frog", "Gecko", "Hognose", "Iguana", "Jacky", "King", "Lizard", "Mamba", "Newt",
        "Olm", "Python", "Quetzal", "Rattler", "Skink", "Toad", "Urutu", "Viper", "Whip", "Xantus",
        "Yarrow", "Zamenis", "Albatross", "Bluejay", "Crow", "Dove", "Eagle", "Falcon", "Goose", "Hawk",
        "Ibis", "Jay", "Kite", "Loon", "Magpie", "Nighthawk", "Owl", "Parrot", "Quail", "Raven",
        "Stork", "Toucan", "Umbrellabird", "Vulture", "Wren", "Xeme", "Yellowthroat", "Zebra", "Aries", "Bull",
        "Crab", "Dragon", "Eagle", "Fish", "Goat", "Horse", "Ibex", "Jaguar", "Koi", "Lion",
        "Monkey", "Newt", "Otter", "Pig", "Quokka", "Rabbit", "Snake", "Tiger", "Urchin", "Vixen",
        "Wolf", "Xerus", "Yak", "Zebu", "Atom", "Byte", "Chip", "Data", "Electron", "Flux",
        "Glitch", "Hacker", "Ion", "Java", "Kernel", "Laser", "Mecha", "Nano", "Orbit", "Pixel",
        "Quantum", "Robot", "Spark", "Tech", "Unit", "Vector", "Wire", "Xenon", "Yottabyte", "Zap",
        "Aero", "Blast", "Cyclone", "Dust", "Echo", "Frost", "Gale", "Hail", "Ice", "Jolt",
        "Karma", "Lava", "Mist", "Nova", "Ozone", "Pulse", "Quake", "Rain", "Snow", "Thunder",
        "Umbra", "Void", "Wind", "X-Ray", "Zero", "Zone", "Axel", "Brick", "Clutch", "Diesel",
        "Engine", "Fuel", "Gear", "Horn", "Ignition", "Jeep", "Keys", "Lube", "Motor", "Nitro",
        "Oil", "Piston", "Quad", "Rim", "Speed", "Turbo", "U-Turn", "Valve", "Wheel", "Xenon",
        "Yamaha", "Zoom", "Anchor", "Boat", "Captain", "Deck", "Echo", "Fin", "Gill", "Hull",
        "Island", "Jib", "Keel", "Lake", "Mast", "Net", "Ocean", "Port", "Quay", "Reef",
        "Sail", "Tide", "Under", "Vessel", "Wave", "X-boat", "Yatch", "Zone", "Arid", "Badland",
        "Canyon", "Dune", "Earth", "Fossil", "Gulch", "Hill", "Igneous", "Jungle", "Karst", "Land",
        "Mesa", "Nadir", "Oasis", "Peak", "Quarry", "Ridge", "Sand", "Tundra", "Upland", "Valley",
        "Wasteland", "Xerophyte", "Yardang", "Zone"
    ];

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
            if (activeCount === 0) return alert("Define a valid shape (Even # of cells) first!");

            let countNeeded = 0;
            if (mode === 'memory') {
                if (activeCount % 2 !== 0) return alert("Shape needs EVEN number of cells for Memory Match!");
                countNeeded = activeCount / 2;
            } else if (mode === 'match3') {
                // Match 3
                countNeeded = Math.min(activeCount, 6);
            } else if (mode === 'whack') {
                // Whack: Just need a few distinct moles (1-4 types is enough variety)
                countNeeded = Math.min(activeCount, 4);
            } else {
                // Schulte / Standard
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
            const activeCount = customGridMask.filter(Boolean).length;
            if (activeCount === 0) return alert("Grid cannot be empty!");

            const mode = modeSelect ? modeSelect.value : 'memory';
            const currentMode = modeSelect ? modeSelect.value : 'memory';

            if (currentMode === 'memory') {
                if (activeCount % 2 !== 0) return alert(`Memory Match requires an EVEN number of active cells! (Current: ${activeCount})`);
                if (customSelectedIcons.length === 0) return alert("Select at least 1 icon type!");
                isCustomMode = true;
                startMemoryMatchGame();
            } else if (currentMode === 'match3') {
                if (customSelectedIcons.length < 3) return alert("Select at least 3 icon types for Match 3!");
                match3Target = parseInt(document.getElementById('target-score').value) || 1000;
                isCustomMode = true;
                startMatch3Game();
            } else if (currentMode === 'whack') {
                if (customSelectedIcons.length === 0) return alert("Select at least 1 icon type!");
                isCustomMode = true;
                startWhackAMoleGame();
            } else if (currentMode === 'pattern') {
                isCustomMode = true;
                startPatternGame();
            } else if (currentMode === 'chimp') {
                isCustomMode = true;
                startChimpGame();
            } else if (currentMode === 'odd') {
                isCustomMode = true;
                startOddGame();
            } else if (currentMode === 'stroop') {
                isCustomMode = true;
                startStroopGame();
            } else if (currentMode === 'math') {
                isCustomMode = true;
                startMathGame();
            } else if (currentMode === 'greenlight') {
                isCustomMode = true;
                startGreenGame();
            } else if (currentMode === 'rpg_battle') {
                if (customSelectedIcons.length === 0) return alert("Select at least 1 icon (Your Hero)!");
                isCustomMode = true;
                startRpgBattleGame();
            } else if (currentMode === 'gauntlet') {
                // Allow empty selection (will randomize)
                isCustomMode = true;
                startGauntletGame();
            } else if (currentMode === 'flappy') {
                isCustomMode = true;
                startFlappyGame();
            } else if (currentMode === 'schulte_mem') {
                isCustomMode = true;
                shuffleOnClick = displays.shuffleCheck.checked;
                startSchulteMemGame();
            } else {
                // Classic Schulte (Direct)
                isCustomMode = true;
                shuffleOnClick = displays.shuffleCheck.checked;
                startCustomSchulteGame();
            }
        });
    }

    // Main Start (Old button removed, logic now in customStart)
    // btns.start listener removed.

    btns.play.addEventListener('click', () => {
        // Determine which mode we are in. 
        // If we are in 'schulte_mem' mode (isCustomMode + modeSelect value)
        if (isCustomMode && modeSelect.value === 'schulte_mem') {
            startSchulteMemPhase();
        } else {
            startGamePhase(); // Classic fallback?
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
        displays.customEditor.style.gridTemplateColumns = `repeat(${gridSize}, 32px)`;
        displays.customEditor.style.width = 'fit-content';
        displays.customEditor.innerHTML = '';

        customGridMask.forEach((isActive, i) => {
            const cell = document.createElement('div');
            cell.className = `grid-editor-cell ${isActive ? 'active' : ''}`;
            cell.style.width = '32px';
            cell.style.height = '32px';

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
        if (mode === 'schulte_classic') {
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

    // 1. Memory Match Flow
    function startMemoryMatchGame() {
        matchesFound = 0;
        firstCard = null;
        isProcessingMatch = false;
        sequence = [];
        customContentMap = {};

        const activeCount = customGridMask.filter(Boolean).length;
        totalPairs = activeCount / 2;

        let pairTypes = [];
        let sourcePool = [...customSelectedIcons];

        while (pairTypes.length < totalPairs) {
            if (sourcePool.length === 0) sourcePool = [...customSelectedIcons];
            shuffleArray(sourcePool);
            pairTypes.push(sourcePool.pop());
        }

        const pairContentData = pairTypes.map(poolIdx => {
            let runningCount = 0;
            for (const cat of activeCategories) {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
                if (poolIdx < runningCount + limit) {
                    const localId = poolIdx - runningCount;
                    return getDirectContent(cat, localId);
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

        shuffleArray(deck);

        deck.forEach((data, i) => {
            customContentMap[i] = data;
        });

        renderMemoryMatchGrid(deck.length);

        startTime = Date.now();
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 50);

        displays.nextTarget.innerHTML = '<span style="font-size:10px;">MATCH</span>';
        switchScreen('game');
    }

    function renderMemoryMatchGrid(itemCount) {
        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        let deckIndex = 0;

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
                setTimeout(() => {
                    firstCard.el.classList.add('matched');
                    secondCard.el.classList.add('matched');
                    firstCard = null;
                    isProcessingMatch = false;

                    if (matchesFound >= totalPairs) {
                        endGame(true);
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    firstCard.el.classList.add('hidden');
                    secondCard.el.classList.add('hidden');
                    firstCard = null;
                    isProcessingMatch = false;
                }, 1000);
            }
        }
    }

    // 2. Match 3 Flow
    let match3Board = [];

    function startMatch3Game() {
        match3Score = 0;
        isSwapping = false;
        selectedCell = null;

        const count = gridSize * gridSize;
        match3Board = new Array(count).fill(null);

        customGridMask.forEach((isActive, i) => {
            if (isActive) {
                match3Board[i] = null;
            }
        });

        shuffleAndEnsureMoves();

        if (timerInterval) clearInterval(timerInterval);
        renderMatch3Grid();
        displays.nextTarget.innerHTML = '';

        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = `Score: <span id="time-display">${match3Score}</span> / ${match3Target}`;
        displays.time = document.getElementById('time-display');

        switchScreen('game');
    }

    function getRandomMatch3Icon() {
        const pool = customSelectedIcons.length > 0 ? customSelectedIcons : [0, 1, 2];
        const poolIdx = pool[Math.floor(Math.random() * pool.length)];

        let runningCount = 0;
        for (const cat of activeCategories) {
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
            if (poolIdx < runningCount + limit) {
                const localId = poolIdx - runningCount;
                return { ...getDirectContent(cat, localId), poolId: poolIdx };
            }
            runningCount += limit;
        }
        return { type: 'text', content: '?', poolId: -1 };
    }

    function hasInitialMatch(i) {
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
        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        match3Board.forEach((data, i) => {
            if (customGridMask[i]) {
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
                    selectedCell.el.classList.remove('selected');
                    selectedCell = null;
                } else {
                    selectedCell.el.classList.remove('selected');
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

        if (match3Score >= match3Target) {
            setTimeout(() => {
                const timerContainer = document.querySelector('.game-header .timer'); // Revert UI
                if (timerContainer) timerContainer.innerHTML = 'Time: <span id="time-display">0.00</span>s';

                displays.finalTime.innerText = `Score: ${match3Score}`;
                switchScreen('result');
            }, 500);
            return;
        }

        setTimeout(() => {
            applyGravity();
        }, 300);
    }

    function applyGravity() {
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
        // Collect all active items
        let stack = [];
        customGridMask.forEach((isActive, i) => {
            if (isActive) {
                // If board is empty/null (initial), generate new. Else keep existing.
                if (!match3Board[i]) match3Board[i] = getRandomMatch3Icon();
                stack.push(match3Board[i]);
            }
        });

        // Try to find a valid arrangement
        let attempts = 0;
        do {
            attempts++;
            shuffleArray(stack);

            let stackIdx = 0;
            customGridMask.forEach((isActive, i) => {
                if (isActive) match3Board[i] = stack[stackIdx++];
            });

        } while ((hasAnyInitialMatch() || !hasPossibleMoves()) && attempts < 100);

        // If we failed after 100 attempts, just leave it random (rare)
        renderMatch3Grid();
    }

    function hasAnyInitialMatch() {
        for (let i = 0; i < match3Board.length; i++) {
            if (hasInitialMatch(i)) return true;
        }
        return false;
    }

    function hasPossibleMoves() {
        // Check horizontal swaps
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize - 1; c++) {
                const i1 = r * gridSize + c;
                const i2 = r * gridSize + c + 1;
                if (checkSwapForMatch(i1, i2)) return true;
            }
        }
        // Check vertical swaps
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
        if (!customGridMask[i1] || !customGridMask[i2]) return false;
        if (!match3Board[i1] || !match3Board[i2]) return false;

        // Simulate swap
        const t = match3Board[i1];
        match3Board[i1] = match3Board[i2];
        match3Board[i2] = t;

        // Check matches
        const hasMatch = findMatchesAt(i1) || findMatchesAt(i2);

        // Swap back
        match3Board[i2] = match3Board[i1];
        match3Board[i1] = t;

        return hasMatch;
    }

    function findMatchesAt(idx) {
        const r = Math.floor(idx / gridSize);
        const c = idx % gridSize;
        const center = match3Board[idx];
        if (!center) return false;

        // Horizontal check
        let count = 1;
        // Left
        for (let k = c - 1; k >= 0; k--) {
            const n = match3Board[r * gridSize + k];
            if (n && n.poolId === center.poolId) count++; else break;
        }
        // Right
        for (let k = c + 1; k < gridSize; k++) {
            const n = match3Board[r * gridSize + k];
            if (n && n.poolId === center.poolId) count++; else break;
        }
        if (count >= 3) return true;

        // Vertical check
        count = 1;
        // Up
        for (let k = r - 1; k >= 0; k--) {
            const n = match3Board[k * gridSize + c];
            if (n && n.poolId === center.poolId) count++; else break;
        }
        // Down
        for (let k = r + 1; k < gridSize; k++) {
            const n = match3Board[k * gridSize + c];
            if (n && n.poolId === center.poolId) count++; else break;
        }
        if (count >= 3) return true;

        return false;
    }

    // 4. Whack-a-Mole Flow
    function startWhackAMoleGame() {
        whackScore = 0;
        whackLives = 5;
        activeMoleTimeouts = {};

        // UI Setup
        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = whackLives;

        // Clear Score Area
        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = `Score: <span id="time-display">${whackScore}</span>`;
        displays.time = document.getElementById('time-display');

        displays.nextTarget.innerHTML = '';

        // Render Empty Grid
        renderWhackGrid();

        // Start Spawning
        if (whackSpawnInterval) clearInterval(whackSpawnInterval);
        whackSpawnInterval = setInterval(spawnMole, 1000); // Spawn every second

        if (timerInterval) clearInterval(timerInterval); // No timer
        switchScreen('game');
    }

    function renderWhackGrid() {
        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        customGridMask.forEach((isActive, i) => {
            if (isActive) {
                const hole = document.createElement('div');
                hole.className = 'icon-card empty-hole'; // Add CSS for hole look if desired
                hole.dataset.id = i;
                // Empty initially
                displays.gameGrid.appendChild(hole);
            } else {
                const placeholder = document.createElement('div');
                placeholder.style.visibility = 'hidden';
                displays.gameGrid.appendChild(placeholder);
            }
        });
    }

    function spawnMole() {
        // Find empty holes (where no mole is currently active)
        const validIndices = [];
        customGridMask.forEach((isActive, i) => {
            if (isActive && !activeMoleTimeouts[i]) {
                validIndices.push(i);
            }
        });

        if (validIndices.length === 0) return; // Full board

        // Pick random hole
        const idx = validIndices[Math.floor(Math.random() * validIndices.length)];

        // Pick random icon
        const poolIdx = customSelectedIcons[Math.floor(Math.random() * customSelectedIcons.length)];
        let contentData = null;
        let runningCount = 0;

        // Locate content
        for (const cat of activeCategories) {
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
            if (poolIdx < runningCount + limit) {
                const localId = poolIdx - runningCount;
                contentData = getDirectContent(cat, localId);
                break;
            }
            runningCount += limit;
        }

        if (!contentData) return;

        // Show Mole
        const targetCell = displays.gameGrid.children[idx];
        targetCell.innerHTML = '';
        targetCell.className = 'icon-card mole-active';

        let contentEl;
        if (contentData.type === 'text') {
            const span = document.createElement('span');
            span.className = 'text-icon';
            span.innerText = contentData.content;
            contentEl = span;
        } else {
            const sprite = document.createElement('div');
            sprite.style.cssText = `
                background-image: url('${contentData.content}'); 
                background-size: cover;
                width: 100%;
                height: 100%;
                pointer-events: none; 
            `; // pointer-events: none on sprite so click hits container
            contentEl = sprite;
        }
        targetCell.appendChild(contentEl);

        // Click Listener
        const clickHandler = () => onMoleClick(idx);
        targetCell.onclick = clickHandler;

        // Timeout (Miss)
        // Speed increases with score?
        const duration = Math.max(600, 1500 - (whackScore * 20));

        activeMoleTimeouts[idx] = setTimeout(() => {
            onMoleMiss(idx);
        }, duration);
    }

    function onMoleClick(idx) {
        if (activeMoleTimeouts[idx]) {
            clearTimeout(activeMoleTimeouts[idx]);
            delete activeMoleTimeouts[idx];
        }

        const cell = displays.gameGrid.children[idx];
        cell.onclick = null;
        cell.className = 'icon-card correct'; // Flash green
        cell.innerHTML = ''; // Hide icon immediately or fade?

        whackScore += 100;
        if (displays.time) displays.time.innerText = whackScore; // Using time display for score

        setTimeout(() => {
            cell.className = 'icon-card empty-hole';
        }, 200);
    }

    function onMoleMiss(idx) {
        if (activeMoleTimeouts[idx]) {
            delete activeMoleTimeouts[idx];
        }

        const cell = displays.gameGrid.children[idx];
        cell.onclick = null;
        cell.className = 'icon-card wrong'; // Flash red

        whackLives--;
        if (displays.livesDisplay) displays.livesDisplay.innerText = whackLives;

        setTimeout(() => {
            cell.innerHTML = '';
            cell.className = 'icon-card empty-hole';

            if (whackLives <= 0) {
                endWhackGame();
            }
        }, 500);
    }

    function endWhackGame() {
        if (whackSpawnInterval) clearInterval(whackSpawnInterval);

        // Clear all pending timeouts
        Object.values(activeMoleTimeouts).forEach(mid => clearTimeout(mid));
        activeMoleTimeouts = {};

        displays.finalTime.innerText = `Final Score: ${whackScore}`;
        switchScreen('result');
        displays.livesContainer.style.display = 'none';
    }

    // 5. Pattern Recall Logic
    function startPatternGame() {
        patternSequence = [];
        patternInputIndex = 0;
        isPatternPlaying = false;

        // Reset UI
        displays.livesContainer.style.display = 'none';
        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = `Round: <span id="time-display">1</span>`;
        displays.time = document.getElementById('time-display');
        displays.nextTarget.innerHTML = '';

        renderPatternGrid();

        setTimeout(nextPatternRound, 1000);
        switchScreen('game');
    }

    function renderPatternGrid() {
        displays.gameGrid.dataset.size = gridSize;
        displays.gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Ensure fit
        displays.gameGrid.innerHTML = '';

        const count = gridSize * gridSize;
        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card pattern-cell';
            cell.dataset.id = i;
            cell.style.backgroundColor = '#444'; // Neutral
            cell.onclick = () => onPatternClick(i);
            displays.gameGrid.appendChild(cell);
        }
    }

    function nextPatternRound() {
        // Add random cell to sequence
        const count = gridSize * gridSize;
        const nextId = Math.floor(Math.random() * count);
        patternSequence.push(nextId);

        displays.time.innerText = patternSequence.length;
        playPatternSequence();
    }

    function playPatternSequence() {
        isPatternPlaying = true;
        patternInputIndex = 0;
        let i = 0;

        // Dynamic speed: Faster as you go
        let speed = 800;
        const lvl = patternSequence.length;
        if (lvl > 5) speed = 600;
        if (lvl > 10) speed = 400;
        if (lvl > 15) speed = 300;

        const interval = setInterval(() => {
            if (i >= patternSequence.length) {
                clearInterval(interval);
                isPatternPlaying = false;
                // Visual cue that it's user's turn?
                displays.gameGrid.style.borderColor = '#00ff00'; // Subtle green border
                setTimeout(() => displays.gameGrid.style.borderColor = '', 500);
                return;
            }

            const id = patternSequence[i];
            const cell = displays.gameGrid.children[id];

            // Flash
            cell.style.backgroundColor = '#00ffe0';
            cell.style.boxShadow = '0 0 15px #00ffe0'; // Glow
            setTimeout(() => {
                cell.style.backgroundColor = '#444';
                cell.style.boxShadow = '';
            }, speed * 0.7); // Flash duration relative to speed

            i++;
        }, speed);
    }

    function onPatternClick(id) {
        if (isPatternPlaying) return;

        const cell = displays.gameGrid.children[id];

        if (id === patternSequence[patternInputIndex]) {
            // Correct - Flash Green
            cell.style.backgroundColor = '#32cd32';
            setTimeout(() => {
                cell.style.backgroundColor = '#444';
            }, 150);

            patternInputIndex++;
            if (patternInputIndex >= patternSequence.length) {
                setTimeout(nextPatternRound, 800);
            }
        } else {
            // Wrong - Flash Red
            cell.style.backgroundColor = '#ff4444';
            setTimeout(() => {
                endGame(false); // Game Over
            }, 500);
        }
    }


    function startSchulteMemGame() {
        // Restore "Sequence Memory" Logic
        sequence = [];
        const activeCount = customGridMask.filter(Boolean).length;

        // Generate Sequence of Content
        let sequenceObjects = [];

        if (customSelectedIcons.length > 0) {
            // Manual Selection
            // Reconstruct Pool 
            const poolFn = [];
            activeCategories.forEach(cat => {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : 16;
                for (let i = 0; i < limit; i++) poolFn.push({ cat, id: i });
            });

            // Filter
            customSelectedIcons.forEach(idx => {
                if (poolFn[idx]) sequenceObjects.push(poolFn[idx]);
            });

            // Shuffle what we have
            shuffleArray(sequenceObjects);
            // Ensure distinct count?
            if (sequenceObjects.length < activeCount) {
                // Pad / Repeat?
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
            shuffleArray(pool);
            sequenceObjects = pool.slice(0, activeCount);
        }

        sequence = sequenceObjects.map(item => getDirectContent(item.cat, item.id));

        // Render Memorize Screen
        displays.sequence.innerHTML = '';
        displays.sequence.style.gridTemplateColumns = `repeat(auto-fit, minmax(64px, 1fr))`;

        sequence.forEach((item, idx) => {
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

        currentIndex = 0;
        switchScreen('memorize');
    }

    function startSchulteMemPhase() {
        // Shuffle and Place on Grid
        const gridItems = [...sequence];
        shuffleArray(gridItems);

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

        startTime = Date.now();
        if (timerInterval) clearInterval(timerInterval);

        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = `Time: <span id="time-display">0.00</span>s`;
        displays.time = document.getElementById('time-display');

        oddLives = 3; // Reset Lives (using generic variable)
        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = oddLives;

        updateSchulteMemTarget();

        timerInterval = setInterval(() => {
            const t = (Date.now() - startTime) / 1000;
            displays.time.innerText = t.toFixed(2);
        }, 50);

        switchScreen('game');
    }

    function updateSchulteMemTarget() {
        if (currentIndex < sequence.length) {
            const target = sequence[currentIndex];
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
        const expected = sequence[currentIndex];

        if (item === expected) {
            // Correct
            cell.style.opacity = '0.3';
            cell.onclick = null;

            currentIndex++;
            if (currentIndex >= sequence.length) {
                // Win
                clearInterval(timerInterval);
                const t = (Date.now() - startTime) / 1000;
                displays.finalTime.innerText = t.toFixed(2);
                switchScreen('result');
            } else {
                updateSchulteMemTarget();
            }
        } else {
            // Wrong
            oddLives--;
            displays.livesDisplay.innerText = oddLives;

            cell.style.backgroundColor = '#f00';
            setTimeout(() => cell.style.backgroundColor = '', 200);

            if (oddLives <= 0) {
                endGame(false);
            }
        }
    }

    // 6. Chimp Test Logic
    function startChimpGame() {
        chimpSequence = [];
        chimpCurrentIndex = 0;
        chimpLevel = 4; // Start with 4 numbers

        startChimpRound();
        switchScreen('game');
    }

    function startChimpRound() {
        chimpSequence = [];
        chimpCurrentIndex = 0;
        displays.time.innerText = `Lvl: ${chimpLevel}`;
        displays.nextTarget.innerHTML = '';

        const count = gridSize * gridSize;
        if (chimpLevel > count) chimpLevel = count; // Cap at max cells

        // Pick distinct positions
        const indices = [];
        for (let i = 0; i < count; i++) indices.push(i);
        shuffleArray(indices);

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
                // Wait, we need to map sequence 1..N to specific random positions
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
                setTimeout(startChimpRound, 500);
            }
        } else {
            // Wrong
            endGame(false);
        }
    }

    // 7. Odd One Out Logic

    function startOddGame() {
        oddScore = 0;
        oddLives = 3;

        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = oddLives;

        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = `Score: <span id="time-display">${oddScore}</span>`;
        displays.time = document.getElementById('time-display');

        nextOddRound();
        switchScreen('game');
    }

    function nextOddRound() {
        const count = gridSize * gridSize;
        displays.gameGrid.innerHTML = '';

        // Pick two icons
        const pool = customSelectedIcons.length >= 2 ? customSelectedIcons : [0, 1];
        shuffleArray(pool);
        const commonId = pool[0];
        const uniqueId = pool[1];

        oddTargetIndex = Math.floor(Math.random() * count);
        oddRoundStartTime = Date.now(); // Start Timer

        // Difficulty: Rotation
        const useRotation = oddScore > 500;

        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card';

            // Get content
            let activeId = (i === oddTargetIndex) ? uniqueId : commonId;

            let contentData = null;
            let running = 0;
            for (const cat of activeCategories) {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : 16;
                if (activeId < running + limit) {
                    contentData = getDirectContent(cat, activeId - running);
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
        if (i === oddTargetIndex) {
            // Score Calculation
            const diff = Date.now() - oddRoundStartTime;
            // Base 100 + Speed Bonus (Max 400 extra if under 500ms)
            const bonus = Math.max(0, 500 - (diff / 5));
            const points = Math.floor(100 + bonus);

            oddScore += points;
            displays.time.innerText = oddScore;

            // Visual feedback
            const cell = displays.gameGrid.children[i];
            cell.style.borderColor = '#0f0';
            cell.style.backgroundColor = '#2a2'; // Light green highlight
            setTimeout(nextOddRound, 300);
        } else {
            oddLives--;
            displays.livesDisplay.innerText = oddLives;
            const cell = displays.gameGrid.children[i];
            cell.style.borderColor = '#f00';
            cell.style.backgroundColor = '#522'; // Light red highlight

            if (oddLives <= 0) {
                displays.finalTime.innerText = `Final Score: ${oddScore}`;
                switchScreen('result');
            }
        }
    }

    // 8. Stroop Challenge Logic
    let stroopStartTime = 0;

    function startStroopGame() {
        stroopScore = 0;
        stroopLives = 3;

        // Clear potential previous states
        if (timerInterval) clearInterval(timerInterval);

        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = stroopLives;

        // Render
        renderStroopRound();
        switchScreen('game');
    }

    function renderStroopRound() {
        // Colors
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const hex = {
            'red': '#ff4444', 'blue': '#4444ff', 'green': '#00cc00',
            'yellow': '#eeee00', 'purple': '#9933cc', 'orange': '#ffaa00'
        };

        // Pick Target
        stroopTargetColor = colors[Math.floor(Math.random() * colors.length)];
        stroopStartTime = Date.now();

        // Display Prompt
        const promptSpan = document.createElement('span');
        promptSpan.style.fontSize = '20px';
        promptSpan.style.fontWeight = 'bold';
        promptSpan.innerText = `Select INK: ${stroopTargetColor.toUpperCase()}`;
        // Verify: Prompt color shouldn't match text to avoid confusion? Or plain white for clarity.
        promptSpan.style.color = '#fff';

        displays.nextTarget.innerHTML = '';
        displays.nextTarget.appendChild(promptSpan);

        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = `Score: <span id="time-display">${stroopScore}</span>`;
        displays.time = document.getElementById('time-display');

        // Render Grid
        displays.gameGrid.dataset.size = gridSize;
        displays.gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.innerHTML = '';

        const count = gridSize * gridSize;
        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card';

            // Random Word, Random Color
            const word = colors[Math.floor(Math.random() * colors.length)];
            const ink = colors[Math.floor(Math.random() * colors.length)];

            const span = document.createElement('span');
            span.innerText = word.toUpperCase();
            span.style.color = hex[ink];
            span.style.fontWeight = '900';
            span.style.fontSize = '20px';
            span.style.textShadow = '0 0 2px #000'; // Contrast

            cell.appendChild(span);

            // Data for check
            cell.dataset.ink = ink;

            cell.onclick = () => onStroopClick(cell);
            displays.gameGrid.appendChild(cell);
        }
    }

    function onStroopClick(cell) {
        const selectedInk = cell.dataset.ink;

        if (selectedInk === stroopTargetColor) {
            // Speed Bonus
            const reaction = Date.now() - stroopStartTime;
            const bonus = Math.max(0, 500 - (reaction / 4));
            stroopScore += Math.floor(50 + bonus);

            displays.time.innerText = stroopScore;

            // Visual feedback
            cell.style.backgroundColor = '#333';
            cell.style.opacity = '0'; // Disappear
            cell.onclick = null;

            // Check if all targets are gone? Or just continuous generation?
            // For flow, let's just refresh board every few correct clicks or just 1 click -> new round?
            // "1 click -> new round" is easier to control pacing.
            setTimeout(renderStroopRound, 200);
        } else {
            stroopLives--;
            displays.livesDisplay.innerText = stroopLives;

            cell.style.border = '2px solid #f00';

            if (stroopLives <= 0) {
                displays.finalTime.innerText = `Final Score: ${stroopScore}`;
                switchScreen('result');
            }
        }
    }

    // 9. Math Matrix Logic
    function startMathGame() {
        mathScore = 0;
        mathTarget = 0;
        mathCurrentSum = 0;
        mathSelectedCells = [];
        mathLives = 3;

        // Clear timers
        if (timerInterval) clearInterval(timerInterval);

        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = mathLives;

        renderMathRound();
        switchScreen('game');
    }

    function renderMathRound() {
        mathCurrentSum = 0;
        mathSelectedCells = [];

        // Determine Target: Progressive Difficulty
        // Base 10, plus up to 40 more based on score
        const difficulty = Math.min(40, Math.floor(mathScore / 50));
        mathTarget = Math.floor(Math.random() * (20 + difficulty)) + 10;

        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = `SUM: <span id="current-sum" style="color:#0ff">0</span> / Target: <span style="color:#ff0">${mathTarget}</span> (Score: <span id="time-display">${mathScore}</span>)`;
        displays.time = document.getElementById('time-display');
        const sumDisplay = document.getElementById('current-sum');

        displays.nextTarget.innerHTML = ''; // No icon

        // Render Grid
        displays.gameGrid.dataset.size = gridSize;
        displays.gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.innerHTML = '';

        const count = gridSize * gridSize;
        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            cell.className = 'icon-card';

            // Value 1-9
            const val = Math.floor(Math.random() * 9) + 1;
            cell.innerText = val;
            cell.style.fontSize = '32px';
            cell.style.fontWeight = 'bold';
            cell.dataset.val = val;
            cell.dataset.id = i;

            cell.onclick = () => onMathClick(cell, val, sumDisplay);
            displays.gameGrid.appendChild(cell);
        }
    }

    function onMathClick(cell, val, sumDisplay) {
        // Toggle
        if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            cell.style.backgroundColor = '';
            cell.style.boxShadow = '';
            cell.style.borderColor = '';
            mathCurrentSum -= val;
            const idx = mathSelectedCells.indexOf(cell);
            if (idx > -1) mathSelectedCells.splice(idx, 1);
        } else {
            cell.classList.add('selected');
            cell.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';
            cell.style.borderColor = '#00ffff';
            cell.style.boxShadow = '0 0 15px #00ffff';
            mathCurrentSum += val;
            mathSelectedCells.push(cell);
        }

        sumDisplay.innerText = mathCurrentSum;

        if (mathCurrentSum === mathTarget) {
            // Success
            mathScore += mathCurrentSum * 10;
            displays.time.innerText = mathScore;

            // Highlight and Reset
            mathSelectedCells.forEach(c => {
                c.style.backgroundColor = '#0f0';
                c.style.boxShadow = '0 0 20px #0f0'; // Green Success Glow
                c.style.borderColor = '#0f0'; // Green Success Border
                setTimeout(() => {
                    // Replace with new numbers? Or just new round?
                    // Let's New Round
                }, 200);
            });
            setTimeout(renderMathRound, 500);
        } else if (mathCurrentSum > mathTarget) {
            // Overshoot - Penalty
            mathLives--;
            displays.livesDisplay.innerText = mathLives;

            sumDisplay.style.color = '#f00';

            if (mathLives <= 0) {
                setTimeout(() => {
                    displays.finalTime.innerText = `Final Score: ${mathScore}`;
                    switchScreen('result');
                }, 500);
                return;
            }

            setTimeout(() => {
                sumDisplay.style.color = '#0ff';
                // Reset selection
                mathSelectedCells.forEach(c => {
                    c.classList.remove('selected');
                    c.style.backgroundColor = '';
                    c.style.boxShadow = '';
                    c.style.borderColor = '';
                });
                mathSelectedCells = [];
                mathCurrentSum = 0;
                sumDisplay.innerText = 0;
            }, 500);
        }
    }

    // 10. Green Light Logic
    function startGreenGame() {
        greenScore = 0;
        greenLives = 5;

        // Clear all previous timeouts carefully
        Object.values(greenActiveTimeouts).forEach(id => clearTimeout(id));
        greenActiveTimeouts = {};
        if (greenSpawnInterval) clearInterval(greenSpawnInterval);
        if (timerInterval) clearInterval(timerInterval);

        displays.livesContainer.style.display = 'block';
        displays.livesDisplay.innerText = greenLives;

        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = `Score: <span id="time-display">${greenScore}</span>`;
        displays.time = document.getElementById('time-display');
        displays.nextTarget.innerHTML = '';

        // Render Empty Grid
        renderWhackGrid();

        scheduleNextGreenSpawn();
        switchScreen('game');
    }

    function scheduleNextGreenSpawn() {
        // Dynamic speed: faster as score increases
        // Base 1000ms, min 400ms.
        const speed = Math.max(400, 1000 - (greenScore * 0.8));

        greenSpawnInterval = setTimeout(() => {
            if (currentState === 'GAME') { // Check if still playing
                spawnGreenItem();
                scheduleNextGreenSpawn();
            }
        }, speed);
    }

    function spawnGreenItem() {
        // Find empty
        const validIndices = [];
        Array.from(displays.gameGrid.children).forEach((c, i) => {
            if (c.children.length === 0 && customGridMask[i]) validIndices.push(i);
        });
        if (validIndices.length === 0) return;

        const idx = validIndices[Math.floor(Math.random() * validIndices.length)];
        const cell = displays.gameGrid.children[idx];

        // 30% Red (Decoy), 70% Green (Target)
        const isTarget = Math.random() > 0.3;

        const item = document.createElement('div');
        item.style.width = '70%';
        item.style.height = '70%';
        item.style.borderRadius = '50%';
        item.style.backgroundColor = isTarget ? '#0f0' : '#f00';
        item.style.boxShadow = isTarget ? '0 0 10px #0f0' : '0 0 10px #f00';
        item.pointerEvents = 'none';

        cell.appendChild(item);
        cell.onclick = () => onGreenClick(idx, isTarget);

        // Timeout
        const duration = Math.max(700, 1500 - (greenScore * 10));
        greenActiveTimeouts[idx] = setTimeout(() => {
            // Timeout Logic
            if (isTarget) {
                // Missed Green -> Lose 1 Life
                greenLives--;
                displays.livesDisplay.innerText = greenLives;
                const feedback = document.createElement('div'); // Visual feedback for miss?
                if (greenLives <= 0) {
                    if (greenSpawnInterval) clearTimeout(greenSpawnInterval); // Note: it's timeout now, but variable name stuck
                    // actually scheduleNextGreenSpawn uses recursive timeout stored in greenSpawnInterval
                    clearTimeout(greenSpawnInterval);
                    displays.finalTime.innerText = `Final Score: ${greenScore}`;
                    switchScreen('result');
                }
            }
            // If Decoy (Red) -> Good job avoiding effectively. 

            cell.innerHTML = '';
            cell.onclick = null;
            delete greenActiveTimeouts[idx];
        }, duration);
    }

    function onGreenClick(idx, isTarget) {
        if (greenActiveTimeouts[idx]) {
            clearTimeout(greenActiveTimeouts[idx]);
            delete greenActiveTimeouts[idx];
        }

        const cell = displays.gameGrid.children[idx];
        cell.onclick = null;
        cell.innerHTML = '';

        if (isTarget) {
            // Good
            greenScore += 50;
            displays.time.innerText = greenScore;
            cell.style.backgroundColor = '#1a1';
            setTimeout(() => cell.style.backgroundColor = '', 200);
        } else {
            // Bad (Clicked Red) -> Lose 2 Lives
            greenLives -= 2;
            displays.livesDisplay.innerText = greenLives;
            cell.style.backgroundColor = '#a11';
            setTimeout(() => cell.style.backgroundColor = '', 200);

            if (greenLives <= 0) {
                // Clean up main loop
                if (greenSpawnInterval) clearTimeout(greenSpawnInterval);

                displays.finalTime.innerText = `Final Score: ${greenScore}`;
                switchScreen('result');
            }
        }
    }

    // 3. Custom Schulte Flow
    function startCustomSchulteGame() {
        const activeCount = customGridMask.filter(Boolean).length;
        sequence = [];
        for (let i = 0; i < activeCount; i++) sequence.push(i);

        currentIndex = 0;
        let boardItems = [...sequence];
        renderCustomSchulteGrid(boardItems);

        startTime = Date.now();
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 50);

        updateNextTarget();
        switchScreen('game');
    }

    function renderCustomSchulteGrid(items) {
        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        const shuffled = [...items];
        shuffleArray(shuffled);

        let itemIndex = 0;
        customGridMask.forEach(isActive => {
            if (isActive) {
                if (itemIndex < shuffled.length) {
                    const seqId = shuffled[itemIndex++];
                    const el = createCustomSchulteElement(seqId);

                    if (seqId < sequence[currentIndex]) {
                        el.classList.add('correct');
                        el.style.opacity = '0.5';
                        el.removeEventListener('click', onStandardIconClick);
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
        const div = document.createElement('div');
        div.className = 'icon-card';
        div.dataset.id = seqId;

        // Custom Schulte Content Generation

        let content;

        if (isCustomMode && customSelectedIcons.length > 0) {
            // Manual Icons Strategy
            // Map seqId (0,1,2...) to selected icons

            const poolFn = [];
            activeCategories.forEach(cat => {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : 16;
                for (let i = 0; i < limit; i++) poolFn.push({ cat, id: i });
            });

            // Use modulo to cycle if less icons than seqId
            const idxInSelected = seqId % customSelectedIcons.length;
            const poolIdx = customSelectedIcons[idxInSelected];

            if (poolFn[poolIdx]) {
                const item = poolFn[poolIdx];
                content = getDirectContent(item.cat, item.id);
            } else {
                content = { type: 'text', content: '?' };
            }

        } else {
            // Standard Auto-Gen
            const cat = activeCategories[seqId % activeCategories.length];
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
            const assetId = Math.floor(seqId / activeCategories.length) % limit;
            content = getDirectContent(cat, assetId);
        }

        if (content.type === 'text') {
            const span = document.createElement('span');
            span.className = 'text-icon';
            span.innerText = content.content; // Use data.content if object
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

        div.addEventListener('click', onStandardIconClick);
        return div;
    }

    // 3. Standard Schulte Flow
    function startMemorizePhase() {
        generateStandardSequence();

        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;

        displays.sequence.style.gridTemplateColumns = templateCols;
        displays.sequence.innerHTML = '';

        sequence.forEach(id => {
            const el = createStandardIconElement(id);
            displays.sequence.appendChild(el);
        });

        switchScreen('memorize');
    }

    function startGamePhase() {
        currentIndex = 0;
        let boardItems = [...sequence];
        renderStandardGameGrid(boardItems);

        startTime = Date.now();
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 50);

        updateNextTarget();
        switchScreen('game');
    }

    function generateStandardSequence() {
        const count = gridSize * gridSize;
        sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(i);
        }
    }

    function createStandardIconElement(id, isClickable = false) {
        const div = document.createElement('div');
        div.className = 'icon-card';

        const data = getContentForIndex(id, id);

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

        if (isClickable) {
            div.dataset.id = id;
            div.addEventListener('click', onStandardIconClick);
        }

        return div;
    }

    function renderStandardGameGrid(items) {
        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        const shuffled = [...items];
        shuffleArray(shuffled);

        shuffled.forEach(id => {
            const el = createStandardIconElement(id, true);
            if (id < sequence[currentIndex]) {
                el.classList.add('correct');
                el.style.opacity = '0.5';
                el.removeEventListener('click', onStandardIconClick);
            }
            displays.gameGrid.appendChild(el);
        });
    }

    function onStandardIconClick(e) {
        const target = e.currentTarget;
        const clickedId = parseInt(target.dataset.id);

        if (clickedId === sequence[currentIndex]) {
            target.classList.add('correct');
            currentIndex++;

            if (currentIndex >= sequence.length) {
                endGame(true);
            } else {
                updateNextTarget();
                if (shuffleOnClick) {
                    setTimeout(() => {
                        let boardItems = [...sequence];
                        if (isCustomMode) {
                            renderCustomSchulteGrid(boardItems);
                        } else {
                            renderStandardGameGrid(boardItems);
                        }
                    }, 100);
                }
            }
        } else {
            target.classList.add('wrong');
            setTimeout(() => {
                endGame(false);
            }, 500);
        }
    }


    // --- Shared Helpers ---

    function updateCategoryUI() {
        btns.categories.forEach(btn => {
            if (activeCategories.includes(btn.dataset.cat)) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    function switchScreen(screenName) {
        Object.values(screens).forEach(s => {
            if (s) s.classList.remove('active');
        });
        if (screens[screenName]) screens[screenName].classList.add('active');
        currentState = screenName.toUpperCase();

        if (currentState === 'SETTINGS') {
            initCustomIconPool();
        }
    }

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

    // Updated Helper: unified preview
    function getPreviewContent(id) {
        if (isCustomMode && !modeSelect) {
            // Pure Memory Match usually doesn't show next target? 
            // But if we are in Schulte mode...
        }
        // If Custom Schulte:
        if (isCustomMode && modeSelect && modeSelect.value === 'schulte') {
            const cat = activeCategories[id % activeCategories.length];
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
            const assetId = Math.floor(id / activeCategories.length) % limit;
            return getDirectContent(cat, assetId);
        }
        // Standard
        return getContentForIndex(id, id);
    }

    function updateNextTarget() {
        // Skipped for Memory Match
        if (isCustomMode && modeSelect && modeSelect.value === 'memory') {
            displays.nextTarget.innerHTML = '<span style="font-size:10px;">MATCH</span>';
            return;
        }

        if (currentIndex < sequence.length) {
            const id = sequence[currentIndex];
            const data = getPreviewContent(id);
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
            displays.nextTarget.innerHTML = '';
            displays.nextTarget.appendChild(container);
        }
    }

    function updateTimer() {
        const now = Date.now();
        const diff = (now - startTime) / 1000;
        displays.time.innerText = diff.toFixed(2);
    }

    function endGame(success) {
        clearInterval(timerInterval);
        if (success) {
            displays.finalTime.innerText = displays.time.innerText;
            switchScreen('result');
        } else {
            switchScreen('gameover');
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // --- RPG Decision Battle Logic ---

    function startRpgBattleGame() {
        rpgScore = 0;
        rpgEnemies = {};

        // Show Log
        const logBox = document.getElementById('rpg-battle-log');
        if (logBox) {
            logBox.style.display = 'flex';
            document.getElementById('rpg-log-text').innerText = "A wild horde appeared!";
        }

        // Setup Hero
        const heroPoolIdx = customSelectedIcons[0];
        let heroData = null;

        let runningCount = 0;
        for (const cat of activeCategories) {
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
            if (heroPoolIdx < runningCount + limit) {
                const localId = heroPoolIdx - runningCount;
                heroData = getDirectContent(cat, localId);
                break;
            }
            runningCount += limit;
        }

        // Initialize Player HP & MP
        const maxHp = 300;
        const maxMp = 100;
        rpgHero = {
            data: heroData,
            poolIdx: heroPoolIdx,
            name: "HERO",
            hp: maxHp,
            maxHp: maxHp,
            mp: 50, // Start with half MP
            maxMp: maxMp,
            level: 50,
            buffs: {
                damageMult: 1,
                turns: 0
            },
            tempSpell: null // Stores { name: 'Fireball', damage: 50, cost: 0, type: 'aoe' } etc.
        };

        // Show Player HUD
        const playerHud = document.getElementById('rpg-player-hud');
        if (playerHud) {
            playerHud.style.display = 'flex';
            updatePlayerHud();
        }

        // Show Player Sprite
        const playerSprite = document.getElementById('rpg-player-sprite');
        if (playerSprite) {
            playerSprite.style.display = 'block';
            playerSprite.innerHTML = '';

            if (heroData.type === 'text') {
                playerSprite.innerText = heroData.content;
                playerSprite.style.backgroundImage = 'none';
                playerSprite.style.fontSize = '64px';
                playerSprite.style.color = '#fff';
                playerSprite.style.display = 'flex';
                playerSprite.style.justifyContent = 'center';
                playerSprite.style.alignItems = 'center';
            } else {
                playerSprite.style.backgroundImage = `url('${heroData.content}')`;
                playerSprite.innerText = '';
            }
        }

        // Initialize Wave Queue (Horde)
        rpgHordeQueue = []; // Global state
        rpgWaveCount = 0; // Initialize Wave Count
        const availablePool = customSelectedIcons.length > 1 ? customSelectedIcons.slice(1) : customSelectedIcons;

        let totalEnemies = 0;
        customGridMask.forEach((isActive, i) => {
            if (isActive) {
                rpgHordeQueue.push(i);
                totalEnemies++;
            }
        });
        shuffleArray(rpgHordeQueue);

        // Max enemies in horde (can be customized, but for now matches grid size)

        // Initial Spawn
        spawnWave();

        const timerContainer = displays.time.parentElement;
        timerContainer.innerHTML = `Remaining: <span id="rpg-score">${totalEnemies}</span>`;
        displays.time = document.getElementById('rpg-score');
        displays.nextTarget.innerHTML = '<span style="font-size:10px; color:#e94560;">WAVE MODE</span>';

        switchScreen('game');
    }

    function spawnWave() {
        if (rpgHordeQueue.length === 0) return;

        // Spawn 1 to 3 enemies
        const count = Math.min(Math.floor(Math.random() * 3) + 1, rpgHordeQueue.length);
        const indices = [];
        for (let k = 0; k < count; k++) {
            indices.push(rpgHordeQueue.pop());
        }

        const availablePool = customSelectedIcons.length > 1 ? customSelectedIcons.slice(1) : customSelectedIcons;

        indices.forEach(i => {
            // Create Enemy Logic (Duplicated from before, sorry for redundancy but keeps it self-contained)
            const poolIdx = availablePool[Math.floor(Math.random() * availablePool.length)];
            let enemyData = null;
            let rc = 0;
            for (const cat of activeCategories) {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
                if (poolIdx < rc + limit) {
                    const localId = poolIdx - rc;
                    enemyData = getDirectContent(cat, localId);
                    break;
                }
                rc += limit;
            }

            // Incremental Difficulty
            const baseLevel = 5;
            const waveScaling = rpgWaveCount * 3;
            const randomVar = Math.floor(Math.random() * 5);
            const level = baseLevel + waveScaling + randomVar;

            const hp = level * 10;
            const name = RPG_NAMES[Math.floor(Math.random() * RPG_NAMES.length)];
            const hue = Math.floor(Math.random() * 360);
            const gender = Math.random() > 0.5 ? '♂' : '♀';

            rpgEnemies[i] = {
                data: enemyData,
                hp: hp,
                maxHp: hp,
                name: name,
                hue: hue,
                level: level,
                gender: gender
            };
        });

        // Log
        rpgWaveCount++;
        const logText = document.getElementById('rpg-log-text');
        if (logText) logText.innerText = `Wave ${rpgWaveCount}: ${count} enemies appeared!`;

        renderRpgGrid();
    }

    function renderRpgGrid() {
        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        customGridMask.forEach((isActive, i) => {
            if (isActive && rpgEnemies[i]) {
                const el = createRpgEnemyElement(i, rpgEnemies[i]);
                displays.gameGrid.appendChild(el);
            } else if (isActive) {
                const el = document.createElement('div');
                el.className = 'icon-card empty';
                el.style.opacity = '0.1';
                el.style.border = '1px solid #333';
                displays.gameGrid.appendChild(el);
            } else {
                const placeholder = document.createElement('div');
                placeholder.style.visibility = 'hidden';
                displays.gameGrid.appendChild(placeholder);
            }
        });
    }

    function createRpgEnemyElement(i, enemy) {
        const div = document.createElement('div');
        div.className = 'icon-card';
        // Remove standard borders/background to let HUD take over? 
        // We keep standard card look but add HUD on top.
        div.style.position = 'relative';
        div.dataset.id = i;

        // Container
        const container = document.createElement('div');
        container.className = 'rpg-enemy';

        // HUD (Pokemon Style)
        const hud = document.createElement('div');
        hud.className = 'poke-hud';

        // Name Row
        const nameRow = document.createElement('div');
        nameRow.className = 'poke-name-row';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'poke-name';
        nameSpan.innerText = enemy.name;

        const lvlSpan = document.createElement('span');
        lvlSpan.className = 'poke-lvl';
        lvlSpan.innerText = `${enemy.gender} Lv${enemy.level}`;

        nameRow.appendChild(nameSpan);
        nameRow.appendChild(lvlSpan);
        hud.appendChild(nameRow);

        // HP Bar
        const hpCont = document.createElement('div');
        hpCont.className = 'poke-hp-container';
        const hpBar = document.createElement('div');
        hpBar.className = 'poke-hp-bar';

        const pct = (enemy.hp / enemy.maxHp) * 100;
        hpBar.style.width = `${pct}%`;
        hpBar.style.backgroundColor = getHpColor(pct);

        hpCont.appendChild(hpBar);
        hud.appendChild(hpCont);

        container.appendChild(hud);

        // Sprite
        if (enemy.data.type === 'text') {
            const span = document.createElement('span');
            span.className = 'text-icon';
            span.innerText = enemy.data.content;
            span.style.filter = `hue-rotate(${enemy.hue}deg)`;
            container.appendChild(span);
        } else {
            const img = document.createElement('div');
            img.style.cssText = `
                background-image: url('${enemy.data.content}'); 
                background-size: cover;
                width: 100%;
                height: 100%;
                filter: hue-rotate(${enemy.hue}deg);
            `;
            container.appendChild(img);
        }

        div.appendChild(container);
        div.addEventListener('mousedown', (e) => handleRpgClick(e, i));

        return div;
    }

    function getHpColor(pct) {
        if (pct > 50) return '#4caf50'; // Green
        if (pct > 20) return '#ffeb3b'; // Yellow
        return '#f44336'; // Red
    }

    function handleRpgClick(e, i) {
        if (!rpgEnemies[i]) return;

        const enemy = rpgEnemies[i];

        // Damage Logic
        let damage = Math.floor(Math.random() * 20) + 10;

        // Apply Buffs
        if (rpgHero.buffs.turns > 0) {
            damage = Math.floor(damage * rpgHero.buffs.damageMult);
        }

        const isCrit = Math.random() < 0.15;
        const finalDamage = isCrit ? damage * 2 : damage;

        enemy.hp -= finalDamage;

        // MP Regen on Hit
        rpgHero.mp = Math.min(rpgHero.maxMp, rpgHero.mp + 5);
        updatePlayerHud();

        // Log
        const logText = document.getElementById('rpg-log-text');
        if (logText) {
            if (isCrit) logText.innerText = "A critical hit!";
            else if (rpgHero.buffs.damageMult > 1) logText.innerText = `${rpgHero.name} hit hard with Impute!`;
            else logText.innerText = `${rpgHero.name} attacked ${enemy.name}!`;
        }

        // Reduce Buff Turns
        if (rpgHero.buffs.turns > 0) {
            rpgHero.buffs.turns--;
            if (rpgHero.buffs.turns <= 0) rpgHero.buffs.damageMult = 1;
        }

        // Show Floating Text
        showFloatingDamage(e.clientX, e.clientY, finalDamage, isCrit);

        if (enemy.hp <= 0) {
            delete rpgEnemies[i];
            rpgScore++;
            const scoreEl = document.getElementById('rpg-score');
            if (scoreEl) scoreEl.innerText = rpgScore;

            if (logText) logText.innerText = `${enemy.name} fainted!`;

            // Re-render
            renderRpgGrid();

            // Update Remaining Count
            const remDisplay = document.getElementById('rpg-score');
            if (remDisplay) {
                const activeCount = Object.keys(rpgEnemies).length;
                const queueCount = rpgHordeQueue.length;
                remDisplay.innerText = activeCount + queueCount;
            }

            // Check Win / Next Wave
            if (Object.keys(rpgEnemies).length === 0) {
                if (rpgHordeQueue.length > 0) {
                    setTimeout(() => {
                        spawnWave();
                    }, 1000);
                } else {
                    setTimeout(() => {
                        endGame(true);
                        displays.finalTime.innerText = "VICTORY!";
                        const prev = displays.finalTime.previousElementSibling;
                        if (prev) prev.innerText = "You are the Champion!";
                        const logText = document.getElementById('rpg-log-text');
                        if (logText) logText.innerText = "You defeated the entire horde!";
                    }, 1000);
                }
            }
        } else {

            // Update HUD locally
            const cell = document.querySelector(`.icon-card[data-id="${i}"]`);
            if (cell) {
                const bar = cell.querySelector('.poke-hp-bar');
                const pct = (enemy.hp / enemy.maxHp) * 100;
                bar.style.width = `${pct}%`;
                bar.style.backgroundColor = getHpColor(pct);
            }

            // --- Enemy Attack Back ---
            setTimeout(() => {
                if (!rpgHero || rpgHero.hp <= 0) return; // Player already dead

                // Enemy Damage Calculation
                const enemyDmg = Math.floor(enemy.level * 0.5) + Math.floor(Math.random() * 10);
                rpgHero.hp -= enemyDmg;
                if (rpgHero.hp < 0) rpgHero.hp = 0;

                // Update Player HUD
                updatePlayerHud();

                // Flash Screen Red
                document.body.style.backgroundColor = '#500';
                setTimeout(() => { document.body.style.backgroundColor = ''; }, 100);

                // Update Log
                if (logText) {
                    logText.innerText = `${enemy.name} used Tackle! You took ${enemyDmg} dmg!`;
                }

                // Check Game Over
                if (rpgHero.hp <= 0) {
                    endGame(false);
                    // Custom Game Over Text
                    const goTitle = document.querySelector('#gameover-screen h2');
                    if (goTitle) goTitle.innerText = "You Fainted!";
                    const goMsg = document.querySelector('#gameover-screen p');
                    if (goMsg) goMsg.innerText = "Whited out and scurried to center...";
                } else {
                    // --- RANDOM TURN EVENT (Happy Accident) ---
                    if (Math.random() < 0.20) { // 20% Chance turn end
                        const healAmt = 15;
                        const manaAmt = 10;
                        rpgHero.hp = Math.min(rpgHero.maxHp, rpgHero.hp + healAmt);
                        rpgHero.mp = Math.min(rpgHero.maxMp, rpgHero.mp + manaAmt);

                        updatePlayerHud();

                        // Visual
                        showFloatingDamage(window.innerWidth / 2, window.innerHeight / 2, "+HP/MP!", true);
                        const playerSprite = document.getElementById('rpg-player-sprite');
                        if (playerSprite) {
                            playerSprite.style.filter = "brightness(1.5) drop-shadow(0 0 10px gold)";
                            setTimeout(() => playerSprite.style.filter = "", 500);
                        }

                        if (logText) logText.innerText = "Lucky Turn! Gained HP & MP!";
                    }
                }
            }, 500); // Slight delay for turn-based feel
        }
    }

    function updatePlayerHud() {
        if (!rpgHero) return;
        const bar = document.getElementById('player-hud-hp-bar');
        const txt = document.getElementById('player-hud-hp-text');
        const lvl = document.getElementById('player-hud-lvl');

        if (bar) {
            const pct = (rpgHero.hp / rpgHero.maxHp) * 100;
            bar.style.width = `${pct}%`;
            bar.className = `poke-hp-bar ${pct > 50 ? 'high' : (pct > 20 ? 'mid' : 'low')}`;
        }
        if (txt) txt.innerText = `${rpgHero.hp}/${rpgHero.maxHp}`;
        if (lvl) lvl.innerText = `Lv${rpgHero.level}`;

        // Update MP
        const mpBar = document.getElementById('player-hud-mp-bar');
        const mpTxt = document.getElementById('player-hud-mp-text');
        if (mpBar) {
            const pct = (rpgHero.mp / rpgHero.maxMp) * 100;
            mpBar.style.width = `${pct}%`;
        }
        if (mpTxt) mpTxt.innerText = `${rpgHero.mp}/${rpgHero.maxMp}`;

        // Update Channel Button State
        const btnChannel = document.getElementById('btn-channel');
        if (btnChannel) {
            if (rpgHero.tempSpell) {
                btnChannel.innerText = rpgHero.tempSpell.name;
                btnChannel.classList.add('temp-spell');
            } else {
                btnChannel.innerText = "CHANNEL";
                btnChannel.classList.remove('temp-spell');
            }
        }
    }

    // Explicitly expose to window for onclick
    window.triggerRpgAction = function (action) {
        if (!rpgHero || rpgHero.hp <= 0) return;
        const log = document.getElementById('rpg-log-text');

        if (action === 'recover') {
            if (rpgHero.mp >= 30) {
                rpgHero.mp -= 30;
                const heal = Math.floor(rpgHero.maxHp * 0.5);
                rpgHero.hp = Math.min(rpgHero.maxHp, rpgHero.hp + heal);
                log.innerText = `Recovered ${heal} HP!`;
                updatePlayerHud();
            } else {
                log.innerText = "Not enough MP!";
            }
        }
        else if (action === 'impute') {
            if (rpgHero.mp >= 20) {
                rpgHero.mp -= 20;
                rpgHero.buffs.damageMult = 2;
                rpgHero.buffs.turns = 5;
                log.innerText = "Attack power doubled for 5 turns!";
                updatePlayerHud();
            } else {
                log.innerText = "Not enough MP!";
            }
        }
        else if (action === 'smite') {
            if (rpgHero.mp >= 80) {
                rpgHero.mp -= 80;
                // Massive Damage to random enemy
                const keys = Object.keys(rpgEnemies);
                if (keys.length > 0) {
                    const targetId = keys[Math.floor(Math.random() * keys.length)];
                    const enemy = rpgEnemies[targetId];
                    enemy.hp -= 200; // Instakill likely
                    log.innerText = `SMITE struck ${enemy.name} for 200 dmg!`;

                    showFloatingDamage(window.innerWidth / 2, window.innerHeight / 2, 200, true);

                    // Trigger death check logic manually or via re-render check (simplified here)
                    // Ideally we refactor 'handleRpgClick' logic to be reusable 'dealDamage'
                    // For now, let's just trigger update
                    if (enemy.hp <= 0) {
                        // Copy delete logic or mock click? Modifying state directly is cleaner
                        handleEnemyDeath(targetId);
                    } else {
                        // Enemy hits back
                        handleEnemyCounterAttack(targetId);
                    }
                    updatePlayerHud();
                }
            } else {
                log.innerText = "Not enough MP!";
            }
        }
        else if (action === 'channel') {
            if (rpgHero.tempSpell) {
                // Cast the spell
                const spell = rpgHero.tempSpell;
                log.innerText = `Used ${spell.name}!`;

                if (spell.type === 'aoe') {
                    Object.keys(rpgEnemies).forEach(k => {
                        const en = rpgEnemies[k];
                        en.hp -= spell.damage;
                        showFloatingDamage(window.innerWidth / 2 + (Math.random() * 100), window.innerHeight / 2, spell.damage, false);
                        if (en.hp <= 0) handleEnemyDeath(k);
                    });
                    log.innerText += " Hit all enemies!";
                }

                rpgHero.tempSpell = null;
                updatePlayerHud();

            } else {
                // Obtain Spell
                if (rpgHero.mp >= 10) {
                    rpgHero.mp -= 10;
                    const spells = [
                        { name: "🔥 FIREBALL", damage: 50, type: 'aoe' },
                        { name: "❄️ FREEZE", damage: 60, type: 'aoe' },
                        { name: "🦇 DRAIN", damage: 40, type: 'aoe' }, // Simplification: All AOE for fun
                        { name: "⚡ THUNDER", damage: 80, type: 'aoe' }
                    ];
                    const pick = spells[Math.floor(Math.random() * spells.length)];
                    rpgHero.tempSpell = pick;
                    log.innerText = `Channeled ${pick.name}! Use it next!`;
                    updatePlayerHud();
                } else {
                    log.innerText = "Not enough MP!";
                }
            }
        }
    };

    function handleEnemyDeath(i) {
        if (rpgEnemies[i]) {
            delete rpgEnemies[i];
            rpgScore++;
            const scoreEl = document.getElementById('rpg-score');
            if (scoreEl) scoreEl.innerText = rpgScore;
            renderRpgGrid();
            // Check Win
            if (Object.keys(rpgEnemies).length === 0) {
                if (rpgHordeQueue.length > 0) {
                    setTimeout(() => { spawnWave(); }, 1000);
                } else {
                    setTimeout(() => {
                        endGame(true);
                        displays.finalTime.innerText = "VICTORY!";
                    }, 1000);
                }
            }
        }
    }

    function handleEnemyCounterAttack(i) {
        // Logic duplicated from handleRpgClick - Refactoring would be better but keeping inline for speed
        const enemy = rpgEnemies[i];
        if (!enemy) return;

        const cell = document.querySelector(`.icon-card[data-id="${i}"]`);
        if (cell) {
            const bar = cell.querySelector('.poke-hp-bar');
            const pct = (enemy.hp / enemy.maxHp) * 100;
            bar.style.width = `${pct}%`;
            bar.style.backgroundColor = getHpColor(pct);
        }

        setTimeout(() => {
            if (!rpgHero || rpgHero.hp <= 0) return;
            const enemyDmg = Math.floor(enemy.level * 0.5) + Math.floor(Math.random() * 10);
            rpgHero.hp -= enemyDmg;
            if (rpgHero.hp < 0) rpgHero.hp = 0;
            updatePlayerHud();

            document.body.style.backgroundColor = '#500';
            setTimeout(() => { document.body.style.backgroundColor = ''; }, 100);

            const log = document.getElementById('rpg-log-text');
            if (log) log.innerText += ` ${enemy.name} hit back!`;

            if (rpgHero.hp <= 0) {
                endGame(false);
            }
        }, 500);
    }

    function showFloatingDamage(x, y, amount, isCrit) {
        const el = document.createElement('div');
        el.className = 'rpg-damage-text';
        el.innerText = amount;
        if (isCrit) {
            el.style.fontSize = '24px';
            el.style.color = '#ff00ff';
            el.innerText += '!';
        }

        // Append to body to be absolute
        document.body.appendChild(el);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        setTimeout(() => {
            el.remove();
        }, 1000);
    }




    // --- Finger Gauntlet Mode (Kaboom.js - Mmm Fingers Clone) ---
    let k = null;

    window.startGauntletGame = function () {
        if (!modeSelect || modeSelect.value !== 'gauntlet') return;

        displays.gameGrid.style.display = 'none';
        const hud = document.getElementById('rpg-player-hud');
        if (hud) hud.style.display = 'none';

        const container = document.getElementById('gauntlet-container');
        if (container) container.style.display = 'block';

        switchScreen('game');

        if (k) {
            try { k.destroy(); } catch (e) { }
        }

        // Force layout recalc
        container.offsetHeight;
        let width = container.clientWidth || window.innerWidth;
        let height = container.clientHeight || window.innerHeight;

        k = kaboom({
            root: container,
            width: width,
            height: height,
            background: [20, 20, 30], // Dark bluish gray
            global: false,
            touchToMouse: true, // Unified input
            debug: false,
        });

        // --- ASSET LOADING ---
        // Dynamically load selected icons as monster sprites
        let monsterSprites = [];

        if (customSelectedIcons && customSelectedIcons.length > 0) {
            customSelectedIcons.forEach((idx, i) => {
                const content = getContentForIndex(idx, idx);
                if (content.type === 'image') {
                    const key = `monster_${i}`;
                    // Kaboom handles Base64 Data URIs perfectly
                    k.loadSprite(key, content.content);
                    monsterSprites.push(key);
                }
            });
        }

        // Fallback if no images found
        if (monsterSprites.length === 0 && activeCategories.length > 0) {
            // Try to grab some from current category
            for (let i = 0; i < 5; i++) {
                const cat = activeCategories[0];
                const id = Math.floor(Math.random() * MAX_ASSETS);
                const content = getDirectContent(cat, id);
                if (content.type === 'image') {
                    const key = `monster_fb_${i}`;
                    k.loadSprite(key, content.content);
                    monsterSprites.push(key);
                }
            }
        }

        // --- SCENES ---

        k.scene("main", () => {
            let score = 0;
            let active = false;

            // UI Layers
            k.add([
                k.text("CLICK & HOLD\nTO START", { size: 32, align: "center" }),
                k.pos(k.width() / 2, k.height() / 2),
                k.anchor("center"),
                k.color(255, 255, 255),
                "startLabel"
            ]);

            const scoreLabel = k.add([
                k.text("0", { size: 48, font: "monospace" }),
                k.pos(k.width() / 2, 80),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.opacity(0.3)
            ]);

            // Player Setup
            const player = k.add([
                k.circle(20),
                k.pos(k.center()),
                k.color(0, 255, 213),
                k.area({ scale: 0.8 }), // Hitbox slightly smaller than visual
                k.body(),
                k.opacity(0.5),
                k.anchor("center"),
                "player"
            ]);

            // Trail Effect
            function addTrail() {
                if (!active) return;
                k.add([
                    k.circle(15),
                    k.pos(player.pos),
                    k.color(0, 255, 213),
                    k.opacity(0.3),
                    k.anchor("center"),
                    k.lifespan(0.2, { fade: 0.2 }), // Auto fade out
                    "trail"
                ]);
            }

            // Input Handling
            k.onMouseDown(() => {
                if (!active) {
                    active = true;
                    k.destroyAll("startLabel");
                    player.opacity = 1;
                    player.moveTo(k.mousePos());
                    spawnManager(); // Start spawning
                }
            });

            k.onMouseRelease(() => {
                if (active) {
                    k.go("gameover", score, "Don't Let Go!");
                }
            });

            k.onUpdate(() => {
                if (active) {
                    score += k.dt();
                    scoreLabel.text = Math.floor(score);

                    // Smooth movement to mouse
                    player.moveTo(k.mousePos());

                    // Add trail
                    if (k.time() % 0.05 < 0.02) addTrail();
                }
            });

            // Player Collision
            player.onCollide("deadly", () => {
                k.go("gameover", score, "OUCH!");
            });

            // --- SPAWNING SYSTEM ---
            function spawnManager() {
                if (!active) return;

                // Difficulty scaling
                const difficulty = 1 + (score / 15);
                const waitTime = k.rand(1.5, 3.0) / difficulty;

                const pattern = k.choose(["spinner", "spinner", "straight", "chaser"]);

                if (pattern === "spinner") spawnSpinner(difficulty);
                else if (pattern === "straight") spawnStraightLine(difficulty);
                else if (pattern === "chaser") spawnChaser(difficulty);

                k.wait(waitTime, spawnManager);
            }

            function getMonsterSprite() {
                if (monsterSprites.length > 0) {
                    return k.sprite(k.choose(monsterSprites), { width: 40, height: 40 });
                }
                return k.rect(30, 30); // Fallback
            }

            // 1. SPINNER PATTERN (Classic Mmm Fingers)
            function spawnSpinner(dif) {
                const centerPos = k.vec2(k.rand(50, k.width() - 50), -50); // Start above top
                const speedY = k.rand(100, 150) * dif;

                // Parent container for the text/shape group
                const parent = k.add([
                    k.pos(centerPos),
                    k.move(k.vec2(0, 1), speedY), // Move down
                    k.offscreen({ destroy: true }),
                    "spinner_parent"
                ]);

                // Add 2-4 monsters rotating around this parent
                const count = k.choose([2, 3, 4]);
                const radius = 70;

                for (let i = 0; i < count; i++) {
                    const angle = (360 / count) * i;
                    const mon = parent.add([
                        getMonsterSprite(),
                        k.pos(0, 0), // Relative to parent, set via update
                        k.anchor("center"),
                        k.area({ scale: 0.8 }),
                        k.color(255, 50, 50),
                        "deadly"
                    ]);

                    // Custom rotation logic
                    mon.onUpdate(() => {
                        const t = k.time() * 3; // Spin speed
                        const offX = Math.cos(t + angle) * radius;
                        const offY = Math.sin(t + angle) * radius;
                        mon.pos = k.vec2(offX, offY);
                        // Also rotate the sprite itself for visual flair
                        mon.angle += 2;
                    });
                }
            }

            // 2. STRAIGHT LINE PATTERN
            function spawnStraightLine(dif) {
                const y = -50;
                const x = k.rand(50, k.width() - 50);
                const speed = k.rand(200, 300) * dif;

                const mon = k.add([
                    getMonsterSprite(),
                    k.pos(x, y),
                    k.anchor("center"),
                    k.area(),
                    k.move(k.vec2(0, 1), speed),
                    k.offscreen({ destroy: true }),
                    k.color(255, 100, 100),
                    "deadly"
                ]);

                mon.onUpdate(() => { mon.angle += 5; });
            }

            // 3. CHASER (Drifts toward player)
            function spawnChaser(dif) {
                const mon = k.add([
                    getMonsterSprite(),
                    k.pos(k.rand(0, k.width()), -50),
                    k.anchor("center"),
                    k.area(),
                    k.color(255, 0, 0),
                    "deadly"
                ]);

                mon.onUpdate(() => {
                    const dir = player.pos.sub(mon.pos).unit();
                    mon.move(dir.scale(100 * dif));
                    mon.angle += 1;
                    if (mon.pos.y > k.height() + 50) mon.destroy();
                });
            }
        });

        k.scene("gameover", (score, reason) => {
            k.add([
                k.rect(k.width(), k.height()),
                k.color(0, 0, 0),
                k.opacity(0.8)
            ]);

            k.add([
                k.text("GAME OVER", { size: 48 }),
                k.pos(k.width() / 2, k.height() / 2 - 80),
                k.anchor("center"),
                k.color(255, 50, 50)
            ]);

            k.add([
                k.text(reason, { size: 32 }),
                k.pos(k.width() / 2, k.height() / 2 - 20),
                k.anchor("center"),
                k.color(255, 255, 255)
            ]);

            k.add([
                k.text(`Score: ${Math.floor(score)}`, { size: 40 }),
                k.pos(k.width() / 2, k.height() / 2 + 40),
                k.anchor("center"),
                k.color(0, 255, 213)
            ]);

            k.add([
                k.text("Tap to Retry", { size: 24 }),
                k.pos(k.width() / 2, k.height() / 2 + 100),
                k.anchor("center"),
                k.color(200, 200, 200)
            ]);

            // Simple debounce
            k.wait(0.5, () => {
                k.onMousePress(() => k.go("main"));
            });
        });

        k.go("main");
    };

    window.closeGauntlet = function () {
        const container = document.getElementById('gauntlet-container');
        if (container) container.style.display = 'none';

        if (k) {
            try { k.quit(); } catch (e) { }
            const canvas = container.querySelector('canvas');
            if (canvas) canvas.remove();
            k = null;
        }

        endGame(false);
    };

    // --- Flappy Icon Mode (Kaboom.js) ---
    window.startFlappyGame = function () {
        if (!modeSelect || modeSelect.value !== 'flappy') return;

        displays.gameGrid.style.display = 'none';
        const hud = document.getElementById('rpg-player-hud');
        if (hud) hud.style.display = 'none';

        const container = document.getElementById('flappy-container');
        if (container) container.style.display = 'block';

        switchScreen('game');

        if (k) {
            try { k.destroy(); } catch (e) { }
        }

        // Force layout
        container.offsetHeight;
        let width = container.clientWidth || window.innerWidth;
        let height = container.clientHeight || window.innerHeight;

        k = kaboom({
            root: container,
            width: width,
            height: height,
            background: [112, 197, 206], // Flappy Sky Blue
            global: false,
            touchToMouse: true,
            debug: false,
        });

        // --- ASSET LOADING ---
        // Use the FIRST selected icon as the bird
        let birdSprite = null;
        if (customSelectedIcons && customSelectedIcons.length > 0) {
            const idx = customSelectedIcons[0]; // Use first
            const content = getContentForIndex(idx, idx);
            if (content.type === 'image') {
                k.loadSprite("bird", content.content);
                birdSprite = "bird";
            }
        }

        // Fallback
        if (!birdSprite) {
            // Try random or circle
            if (activeCategories.length > 0) {
                const cat = activeCategories[0];
                const id = Math.floor(Math.random() * MAX_ASSETS);
                const content = getDirectContent(cat, id);
                if (content.type === 'image') {
                    k.loadSprite("bird_fallback", content.content);
                    birdSprite = "bird_fallback";
                }
            }
        }

        k.scene("main", () => {
            k.setGravity(1600);

            let score = 0;
            const scoreLabel = k.add([
                k.text("0", { size: 48, font: "monospace" }),
                k.pos(k.width() / 2, 80),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.z(100)
            ]);

            // Player
            const player = k.add([
                birdSprite ? k.sprite(birdSprite, { width: 40, height: 40 }) : k.rect(40, 40),
                k.pos(80, k.height() / 2),
                k.area(),
                k.body(),
                k.anchor("center"),
                "player"
            ]);

            // Jump
            function jump() {
                player.jump(600);
            }

            k.onKeyPress("space", jump);
            k.onMousePress(jump);

            // Pipes
            function spawnPipe() {
                const pipeGap = 160;
                const pipeY = k.rand(100, k.height() - 100 - pipeGap);

                // Top Pipe
                k.add([
                    k.rect(60, pipeY),
                    k.pos(k.width(), 0),
                    k.color(115, 191, 46), // Classic Green
                    k.outline(2),
                    k.area(),
                    k.move(k.vec2(-1, 0), 240), // Speed
                    "pipe"
                ]);

                // Bottom Pipe
                k.add([
                    k.rect(60, k.height() - pipeY - pipeGap),
                    k.pos(k.width(), pipeY + pipeGap),
                    k.color(115, 191, 46),
                    k.outline(2),
                    k.area(),
                    k.move(k.vec2(-1, 0), 240),
                    "pipe",
                    { passed: false } // Custom flag for scoring
                ]);

                k.wait(1.5, spawnPipe);
            }

            spawnPipe();

            // Scoring logic
            player.onUpdate(() => {
                // If fell off screen
                if (player.pos.y > k.height() + 50 || player.pos.y < -50) {
                    k.go("gameover", score);
                }

                // Score check (raycast or check pipes x pos)
                k.get("pipe").forEach((p) => {
                    if (p.pos.x + 60 < player.pos.x && !p.passed && p.pos.y > 0) { // Only count one of the pair
                        p.passed = true;
                        score++;
                        scoreLabel.text = score;
                    }
                });
            });

            // Collision
            player.onCollide("pipe", () => {
                k.go("gameover", score);
            });
        });

        k.scene("gameover", (score) => {
            k.add([
                k.text("GAME OVER", { size: 48 }),
                k.pos(k.width() / 2, k.height() / 2 - 50),
                k.anchor("center"),
                k.color(255, 255, 255)
            ]);

            k.add([
                k.text(`Score: ${score}`, { size: 32 }),
                k.pos(k.width() / 2, k.height() / 2 + 20),
                k.anchor("center"),
                k.color(255, 255, 255)
            ]);

            k.add([
                k.text("Tap to Retry", { size: 24 }),
                k.pos(k.width() / 2, k.height() / 2 + 80),
                k.anchor("center"),
                k.color(200, 200, 200)
            ]);

            k.onClick(() => k.go("main"));
            k.onKeyPress("space", () => k.go("main"));
        });

        k.go("main");
    };

    window.closeFlappy = function () {
        const container = document.getElementById('flappy-container');
        if (container) container.style.display = 'none';

        if (k) {
            try { k.quit(); } catch (e) { }
            const canvas = container.querySelector('canvas');
            if (canvas) canvas.remove();
            k = null;
        }

        endGame(false);
    };
});
