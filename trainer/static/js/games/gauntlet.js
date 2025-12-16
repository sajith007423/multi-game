(function () {
    // --- Finger Gauntlet Mode (Kaboom.js) ---
    let k = null;

    function startGauntletGame() {
        // We assume valid call if routing here.
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const activeCategories = GameApp.state.activeCategories;
        const customSelectedIcons = GameApp.state.customSelectedIcons;
        const MAX_ASSETS = GameApp.state.MAX_ASSETS;

        displays.gameGrid.style.display = 'none';
        const hud = document.getElementById('rpg-player-hud');
        if (hud) hud.style.display = 'none';

        const container = document.getElementById('gauntlet-container');
        if (container) container.style.display = 'block';

        GameApp.helpers.switchScreen('game');

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
        let monsterSprites = [];

        if (customSelectedIcons && customSelectedIcons.length > 0) {
            customSelectedIcons.forEach((idx, i) => {
                const content = GameApp.helpers.getContentForIndex(idx, idx);
                if (content.type === 'image') {
                    const key = `monster_${i}`;
                    k.loadSprite(key, content.content);
                    monsterSprites.push(key);
                }
            });
        }

        // Fallback if no images found
        if (monsterSprites.length === 0 && activeCategories.length > 0) {
            for (let i = 0; i < 5; i++) {
                const cat = activeCategories[0];
                const id = Math.floor(Math.random() * MAX_ASSETS);
                const content = GameApp.helpers.getDirectContent(cat, id);
                if (content.type === 'image') {
                    const key = `monster_fb_${i}`;
                    k.loadSprite(key, content.content);
                    monsterSprites.push(key);
                }
            }
        }

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
                    player.moveTo(k.mousePos());
                    if (k.time() % 0.05 < 0.02) addTrail();
                }
            });

            player.onCollide("deadly", () => {
                k.go("gameover", score, "OUCH!");
            });

            // --- SPAWNING SYSTEM ---
            function spawnManager() {
                if (!active) return;

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
                return k.rect(30, 30);
            }

            function spawnSpinner(dif) {
                const centerPos = k.vec2(k.rand(50, k.width() - 50), -50);
                const speedY = k.rand(100, 150) * dif;
                const parent = k.add([
                    k.pos(centerPos),
                    k.move(k.vec2(0, 1), speedY),
                    k.offscreen({ destroy: true }),
                    "spinner_parent"
                ]);

                const count = k.choose([2, 3, 4]);
                const radius = 70;

                for (let i = 0; i < count; i++) {
                    const angle = (360 / count) * i;
                    const mon = parent.add([
                        getMonsterSprite(),
                        k.pos(0, 0),
                        k.anchor("center"),
                        k.area({ scale: 0.8 }),
                        k.color(255, 50, 50),
                        "deadly"
                    ]);

                    mon.onUpdate(() => {
                        const t = k.time() * 3;
                        const offX = Math.cos(t + angle) * radius;
                        const offY = Math.sin(t + angle) * radius;
                        mon.pos = k.vec2(offX, offY);
                        mon.angle += 2;
                    });
                }
            }

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
            k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0), k.opacity(0.8)]);
            k.add([k.text("GAME OVER", { size: 48 }), k.pos(k.width() / 2, k.height() / 2 - 80), k.anchor("center"), k.color(255, 50, 50)]);
            k.add([k.text(reason, { size: 32 }), k.pos(k.width() / 2, k.height() / 2 - 20), k.anchor("center"), k.color(255, 255, 255)]);
            k.add([k.text(`Score: ${Math.floor(score)}`, { size: 40 }), k.pos(k.width() / 2, k.height() / 2 + 40), k.anchor("center"), k.color(0, 255, 213)]);
            k.add([k.text("Tap to Retry", { size: 24 }), k.pos(k.width() / 2, k.height() / 2 + 100), k.anchor("center"), k.color(200, 200, 200)]);
            k.wait(0.5, () => { k.onMousePress(() => k.go("main")); });
        });

        k.go("main");
    }

    function closeGauntlet() {
        const GameApp = window.GameApp;
        const container = document.getElementById('gauntlet-container');
        if (container) container.style.display = 'none';

        if (k) {
            try { k.quit(); } catch (e) { }
            const canvas = container.querySelector('canvas');
            if (canvas) canvas.remove();
            k = null;
        }

        GameApp.helpers.endGame(false);
    }

    window.startGauntletGame = startGauntletGame;
    window.closeGauntlet = closeGauntlet;

})();
