(function () {
    let rpgHero = null;
    let rpgEnemies = {};
    let rpgScore = 0;
    let rpgHordeQueue = [];
    let rpgWaveCount = 0;

    const RPG_NAMES = ["Slime", "Goblin", "Bat", "Orc", "Skeleton", "Ghost", "Troll", "Dragon", "Vampire", "Demon", "Wolf", "Rat", "Spider", "Zombie"];
    const SPRITE_SIZE = 64;

    function startRpgBattleGame() {
        rpgScore = 0;
        rpgEnemies = {};

        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const customSelectedIcons = GameApp.state.customSelectedIcons;
        const activeCategories = GameApp.state.activeCategories;
        const MAX_ASSETS = GameApp.state.MAX_ASSETS;
        const customGridMask = GameApp.state.customGridMask;


        // Show Log
        const logBox = document.getElementById('rpg-battle-log');
        if (logBox) {
            logBox.style.display = 'flex';
            document.getElementById('rpg-log-text').innerText = "A wild horde appeared!";
        }

        // Setup Hero
        if (!customSelectedIcons || customSelectedIcons.length === 0) {
            alert("No icons selected!");
            return;
        }
        const heroPoolIdx = customSelectedIcons[0];
        let heroData = null;

        let runningCount = 0;
        for (const cat of activeCategories) {
            const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
            if (heroPoolIdx < runningCount + limit) {
                const localId = heroPoolIdx - runningCount;
                heroData = GameApp.helpers.getDirectContent(cat, localId);
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
            mp: 50,
            maxMp: maxMp,
            level: 50,
            buffs: { damageMult: 1, turns: 0 },
            tempSpell: null
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

        // Initialize Wave Queue
        rpgHordeQueue = [];
        rpgWaveCount = 0;

        let totalEnemies = 0;
        if (customGridMask) {
            customGridMask.forEach((isActive, i) => {
                if (isActive) {
                    rpgHordeQueue.push(i);
                    totalEnemies++;
                }
            });
        }
        GameApp.helpers.shuffleArray(rpgHordeQueue);

        spawnWave();

        const timerContainer = displays.time.parentElement;
        if (timerContainer) timerContainer.innerHTML = `Remaining: <span id="rpg-score">${totalEnemies}</span>`;
        displays.time = document.getElementById('rpg-score');
        displays.nextTarget.innerHTML = '<span style="font-size:10px; color:#e94560;">WAVE MODE</span>';

        GameApp.helpers.switchScreen('game');
    }

    function spawnWave() {
        if (rpgHordeQueue.length === 0) return;
        const customSelectedIcons = window.GameApp.state.customSelectedIcons;
        const activeCategories = window.GameApp.state.activeCategories;
        const MAX_ASSETS = window.GameApp.state.MAX_ASSETS;

        // Spawn 1 to 3 enemies
        const count = Math.min(Math.floor(Math.random() * 3) + 1, rpgHordeQueue.length);
        const indices = [];
        for (let k = 0; k < count; k++) {
            indices.push(rpgHordeQueue.pop());
        }

        const availablePool = customSelectedIcons.length > 1 ? customSelectedIcons.slice(1) : customSelectedIcons;

        indices.forEach(i => {
            const poolIdx = availablePool[Math.floor(Math.random() * availablePool.length)];
            let enemyData = null;
            let rc = 0;
            for (const cat of activeCategories) {
                const limit = (cat === 'numbers' || cat === 'alphabet') ? 100 : MAX_ASSETS;
                if (poolIdx < rc + limit) {
                    const localId = poolIdx - rc;
                    enemyData = window.GameApp.helpers.getDirectContent(cat, localId);
                    break;
                }
                rc += limit;
            }

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

        rpgWaveCount++;
        const logText = document.getElementById('rpg-log-text');
        if (logText) logText.innerText = `Wave ${rpgWaveCount}: ${count} enemies appeared!`;
        renderRpgGrid();
    }

    function renderRpgGrid() {
        const displays = window.GameApp.displays;
        const gridSize = window.GameApp.state.gridSize;
        const customGridMask = window.GameApp.state.customGridMask;

        displays.gameGrid.dataset.size = gridSize;
        let templateCols = `repeat(${gridSize}, ${SPRITE_SIZE + 10}px)`;
        if (window.innerWidth < 600) templateCols = `repeat(${gridSize}, 1fr)`;
        displays.gameGrid.style.gridTemplateColumns = templateCols;
        displays.gameGrid.innerHTML = '';

        if (customGridMask) {
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
    }

    function createRpgEnemyElement(i, enemy) {
        const div = document.createElement('div');
        div.className = 'icon-card';
        div.style.position = 'relative';
        div.dataset.id = i;

        const container = document.createElement('div');
        container.className = 'rpg-enemy';

        const hud = document.createElement('div');
        hud.className = 'poke-hud';
        hud.innerHTML = `<div class="poke-name-row"><span class="poke-name">${enemy.name}</span><span class="poke-lvl">${enemy.gender} Lv${enemy.level}</span></div>`;

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

        if (enemy.data.type === 'text') {
            const span = document.createElement('span');
            span.className = 'text-icon';
            span.innerText = enemy.data.content;
            span.style.filter = `hue-rotate(${enemy.hue}deg)`;
            container.appendChild(span);
        } else {
            const img = document.createElement('div');
            img.style.cssText = `background-image: url('${enemy.data.content}'); background-size: cover; width: 100%; height: 100%; filter: hue-rotate(${enemy.hue}deg);`;
            container.appendChild(img);
        }

        div.appendChild(container);
        div.addEventListener('mousedown', (e) => handleRpgClick(e, i));
        return div;
    }

    function getHpColor(pct) {
        if (pct > 50) return '#4caf50';
        if (pct > 20) return '#ffeb3b';
        return '#f44336';
    }

    function handleRpgClick(e, i) {
        if (!rpgEnemies[i]) return;
        const enemy = rpgEnemies[i];

        let damage = Math.floor(Math.random() * 20) + 10;
        if (rpgHero.buffs.turns > 0) damage = Math.floor(damage * rpgHero.buffs.damageMult);

        const isCrit = Math.random() < 0.15;
        const finalDamage = isCrit ? damage * 2 : damage;

        enemy.hp -= finalDamage;
        rpgHero.mp = Math.min(rpgHero.maxMp, rpgHero.mp + 5);
        updatePlayerHud();

        const logText = document.getElementById('rpg-log-text');
        if (logText) {
            if (isCrit) logText.innerText = "A critical hit!";
            else logText.innerText = `${rpgHero.name} attacked ${enemy.name}!`;
        }

        if (rpgHero.buffs.turns > 0) {
            rpgHero.buffs.turns--;
            if (rpgHero.buffs.turns <= 0) rpgHero.buffs.damageMult = 1;
        }

        showFloatingDamage(e.clientX, e.clientY, finalDamage, isCrit);
        if (window.SoundManager) window.SoundManager.playPop();

        if (enemy.hp <= 0) {
            delete rpgEnemies[i];
            rpgScore++;
            const scoreEl = document.getElementById('rpg-score');
            if (scoreEl) scoreEl.innerText = rpgScore;
            renderRpgGrid();

            // Check Win / Next
            if (Object.keys(rpgEnemies).length === 0) {
                if (rpgHordeQueue.length > 0) {
                    setTimeout(spawnWave, 1000);
                } else {
                    setTimeout(() => {
                        window.GameApp.helpers.endGame(true);
                    }, 1000);
                }
            }
        } else {
            // Counter Attack
            renderRpgGrid(); // Update HP bars
            setTimeout(() => {
                if (!rpgHero || rpgHero.hp <= 0) return;
                const enemyDmg = Math.floor(enemy.level * 0.5) + Math.floor(Math.random() * 10);
                rpgHero.hp -= enemyDmg;
                if (rpgHero.hp < 0) rpgHero.hp = 0;
                updatePlayerHud();

                document.body.style.backgroundColor = '#500';
                setTimeout(() => { document.body.style.backgroundColor = ''; }, 100);
                if (window.SoundManager) window.SoundManager.playError();

                if (rpgHero.hp <= 0) window.GameApp.helpers.endGame(false);
            }, 500);
        }
    }

    function updatePlayerHud() {
        if (!rpgHero) return;
        const bar = document.getElementById('player-hud-hp-bar');
        const txt = document.getElementById('player-hud-hp-text');
        if (bar) {
            const pct = (rpgHero.hp / rpgHero.maxHp) * 100;
            bar.style.width = `${pct}%`;
            bar.className = `poke-hp-bar ${pct > 50 ? 'high' : (pct > 20 ? 'mid' : 'low')}`;
        }
        if (txt) txt.innerText = `${rpgHero.hp}/${rpgHero.maxHp}`;

        const mpBar = document.getElementById('player-hud-mp-bar');
        const mpTxt = document.getElementById('player-hud-mp-text');
        if (mpBar) {
            const pct = (rpgHero.mp / rpgHero.maxMp) * 100;
            mpBar.style.width = `${pct}%`;
        }
        if (mpTxt) mpTxt.innerText = `${rpgHero.mp}/${rpgHero.maxMp}`;

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

    // Exported function for onclick
    window.triggerRpgAction = function (action) {
        if (!rpgHero || rpgHero.hp <= 0) return;
        const log = document.getElementById('rpg-log-text');

        if (action === 'recover') {
            if (rpgHero.mp >= 30) {
                rpgHero.mp -= 30;
                const heal = Math.floor(rpgHero.maxHp * 0.5);
                rpgHero.hp = Math.min(rpgHero.maxHp, rpgHero.hp + heal);
                if (log) log.innerText = `Recovered ${heal} HP!`;
                updatePlayerHud();
            } else {
                if (log) log.innerText = "Not enough MP!";
            }
        }
        else if (action === 'impute') {
            if (rpgHero.mp >= 20) {
                rpgHero.mp -= 20;
                rpgHero.buffs.damageMult = 2;
                rpgHero.buffs.turns = 5;
                if (log) log.innerText = "Attack power doubled for 5 turns!";
                updatePlayerHud();
            } else {
                if (log) log.innerText = "Not enough MP!";
            }
        }
        else if (action === 'smite') {
            if (rpgHero.mp >= 80) {
                rpgHero.mp -= 80;
                const keys = Object.keys(rpgEnemies);
                if (keys.length > 0) {
                    const targetId = keys[Math.floor(Math.random() * keys.length)];
                    const enemy = rpgEnemies[targetId];
                    enemy.hp -= 200;
                    if (log) log.innerText = `SMITE struck ${enemy.name} for 200 dmg!`;

                    showFloatingDamage(window.innerWidth / 2, window.innerHeight / 2, 200, true);

                    if (enemy.hp <= 0) {
                        // Mock click to trigger death logic properly from handleRpgClick flow
                        // Or call logic directly. calling handleRpgClick logic part:
                        delete rpgEnemies[targetId];
                        rpgScore++;
                        const scoreEl = document.getElementById('rpg-score');
                        if (scoreEl) scoreEl.innerText = rpgScore;
                        renderRpgGrid();
                        if (Object.keys(rpgEnemies).length === 0) {
                            if (rpgHordeQueue.length > 0) setTimeout(spawnWave, 1000);
                            else setTimeout(() => window.GameApp.helpers.endGame(true), 1000);
                        }
                    } else {
                        // Counter Attack
                        const cell = document.querySelector(`.icon-card[data-id="${targetId}"]`);
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
                            if (window.SoundManager) window.SoundManager.playError();
                            if (rpgHero.hp <= 0) window.GameApp.helpers.endGame(false);
                        }, 500);
                    }
                    updatePlayerHud();
                }
            } else {
                if (log) log.innerText = "Not enough MP!";
            }
        }
        else if (action === 'channel') {
            if (rpgHero.tempSpell) {
                const spell = rpgHero.tempSpell;
                if (log) log.innerText = `Used ${spell.name}!`;

                if (spell.type === 'aoe') {
                    let anyAlive = false;
                    Object.keys(rpgEnemies).forEach(k => {
                        const en = rpgEnemies[k];
                        en.hp -= spell.damage;
                        showFloatingDamage(window.innerWidth / 2 + (Math.random() * 100), window.innerHeight / 2, spell.damage, false);
                        if (en.hp <= 0) {
                            delete rpgEnemies[k];
                            rpgScore++;
                        } else {
                            anyAlive = true;
                        }
                    });
                    // Update header
                    const scoreEl = document.getElementById('rpg-score');
                    if (scoreEl) scoreEl.innerText = rpgScore;
                    renderRpgGrid();

                    if (!anyAlive && Object.keys(rpgEnemies).length === 0) {
                        if (rpgHordeQueue.length > 0) setTimeout(spawnWave, 1000);
                        else setTimeout(() => window.GameApp.helpers.endGame(true), 1000);
                    } else if (anyAlive) {
                        // One random enemy hits back?
                        const keys = Object.keys(rpgEnemies);
                        if (keys.length > 0) {
                            const k = keys[0]; // Just the first one hits back to save complexity
                            const enemy = rpgEnemies[k];
                            setTimeout(() => {
                                if (!rpgHero || rpgHero.hp <= 0) return;
                                const enemyDmg = Math.floor(enemy.level * 0.5);
                                rpgHero.hp -= enemyDmg;
                                if (rpgHero.hp < 0) rpgHero.hp = 0;
                                updatePlayerHud();
                                if (window.SoundManager) window.SoundManager.playError();
                                if (rpgHero.hp <= 0) window.GameApp.helpers.endGame(false);
                            }, 500);
                        }
                    }
                    if (log) log.innerText += " Hit all enemies!";
                }

                rpgHero.tempSpell = null;
                updatePlayerHud();

            } else {
                if (rpgHero.mp >= 10) {
                    rpgHero.mp -= 10;
                    const spells = [
                        { name: "🔥 FIREBALL", damage: 50, type: 'aoe' },
                        { name: "❄️ FREEZE", damage: 60, type: 'aoe' },
                        { name: "🦇 DRAIN", damage: 40, type: 'aoe' },
                        { name: "⚡ THUNDER", damage: 80, type: 'aoe' }
                    ];
                    const pick = spells[Math.floor(Math.random() * spells.length)];
                    rpgHero.tempSpell = pick;
                    if (log) log.innerText = `Channeled ${pick.name}! Use it next!`;
                    updatePlayerHud();
                } else {
                    if (log) log.innerText = "Not enough MP!";
                }
            }
        }
    };

    function showFloatingDamage(x, y, amount, isCrit) {
        const el = document.createElement('div');
        el.className = 'rpg-damage-text';
        el.innerText = amount + (isCrit ? "!" : "");
        if (isCrit) el.style.color = '#ff00ff';
        document.body.appendChild(el);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        setTimeout(() => el.remove(), 1000);
    }

    window.startRpgBattleGame = startRpgBattleGame;

})();
