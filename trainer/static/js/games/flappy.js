(function () {
    // --- Flappy Icon Mode (Kaboom.js) ---
    let k = null;

    function startFlappyGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;
        const activeCategories = GameApp.state.activeCategories;
        const customSelectedIcons = GameApp.state.customSelectedIcons;
        const MAX_ASSETS = GameApp.state.MAX_ASSETS;

        displays.gameGrid.style.display = 'none';
        const hud = document.getElementById('rpg-player-hud');
        if (hud) hud.style.display = 'none';

        const container = document.getElementById('flappy-container');
        if (container) container.style.display = 'block';

        GameApp.helpers.switchScreen('game');

        if (k) {
            try { k.destroy(); } catch (e) { }
        }

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
        let birdSprite = null;
        if (customSelectedIcons && customSelectedIcons.length > 0) {
            const idx = customSelectedIcons[0]; // Use first
            const content = GameApp.helpers.getContentForIndex(idx, idx);
            if (content.type === 'image') {
                k.loadSprite("bird", content.content);
                birdSprite = "bird";
            }
        }

        // Fallback
        if (!birdSprite) {
            if (activeCategories.length > 0) {
                const cat = activeCategories[0];
                const id = Math.floor(Math.random() * MAX_ASSETS);
                const content = GameApp.helpers.getDirectContent(cat, id);
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

            player.onUpdate(() => {
                if (player.pos.y > k.height() + 50 || player.pos.y < -50) {
                    k.go("gameover", score);
                }

                k.get("pipe").forEach((p) => {
                    if (p.pos.x + 60 < player.pos.x && !p.passed && p.pos.y > 0) { // Only count one of the pair
                        p.passed = true;
                        score++;
                        scoreLabel.text = score;
                    }
                });
            });

            player.onCollide("pipe", () => {
                k.go("gameover", score);
            });
        });

        k.scene("gameover", (score) => {
            k.add([k.text("GAME OVER", { size: 48 }), k.pos(k.width() / 2, k.height() / 2 - 50), k.anchor("center"), k.color(255, 255, 255)]);
            k.add([k.text(`Score: ${score}`, { size: 32 }), k.pos(k.width() / 2, k.height() / 2 + 20), k.anchor("center"), k.color(255, 255, 255)]);
            k.add([k.text("Tap to Retry", { size: 24 }), k.pos(k.width() / 2, k.height() / 2 + 80), k.anchor("center"), k.color(200, 200, 200)]);
            k.onClick(() => k.go("main"));
            k.onKeyPress("space", () => k.go("main"));
        });

        k.go("main");
    }

    function closeFlappy() {
        const GameApp = window.GameApp;
        const container = document.getElementById('flappy-container');
        if (container) container.style.display = 'none';

        if (k) {
            try { k.quit(); } catch (e) { }
            const canvas = container.querySelector('canvas');
            if (canvas) canvas.remove();
            k = null;
        }

        GameApp.helpers.endGame(false);
    }

    window.startFlappyGame = startFlappyGame;
    window.closeFlappy = closeFlappy;

})();
