(function () {
    let k = null; // Kaboom instance

    window.startGravityHarvestGame = function () {
        // Since this module might be loaded before game.js variables are set, we need to check GameApp
        const app = window.GameApp;
        if (!app) {
            alert("GameApp not initialized! Reload page.");
            return;
        }

        // modeSelect might not be in GameApp, we accept it might be global or we need to pass it? 
        // game.js is loaded first. 
        // But logic relies on `modeSelect`. We should check it from app.displays if we exposed it, or existing global.
        // Actually `modeSelect` is a DOM element ID 'custom-game-mode'.
        const modeSelect = document.getElementById('custom-game-mode');
        if (!modeSelect || modeSelect.value !== 'gravity') return;

        // Ensure other overlays are hidden
        ['gauntlet-container', 'flappy-container', 'rpg-player-hud', 'rpg-player-sprite'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        app.displays.gameGrid.style.display = 'none';
        const container = document.getElementById('gravity-container');
        if (container) container.style.display = 'block';

        app.helpers.switchScreen('game');

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
            background: [32, 32, 48],
            global: false,
            touchToMouse: true,
            debug: false,
        });

        // Assets
        let goodSprites = [];
        if (app.state.customSelectedIcons && app.state.customSelectedIcons.length > 0) {
            app.state.customSelectedIcons.forEach((idx, i) => {
                const content = app.helpers.getContentForIndex(idx, idx);
                if (content.type === 'image') {
                    const key = `good_${i}`;
                    k.loadSprite(key, content.content);
                    goodSprites.push(key);
                }
            });
        }

        if (goodSprites.length === 0) {
            for (let i = 0; i < 5; i++) {
                const cat = app.state.activeCategories[0] || 'numbers';
                const id = Math.floor(Math.random() * 16);
                const content = app.helpers.getDirectContent(cat, id);
                if (content.type === 'image') {
                    const key = `good_fb_${i}`;
                    k.loadSprite(key, content.content);
                    goodSprites.push(key);
                }
            }
        }

        k.scene("main", () => {
            let score = 0;
            let lives = 3;

            const scoreLabel = k.add([
                k.text("0", { size: 48, font: "monospace" }),
                k.pos(20, 20),
                k.color(255, 255, 255)
            ]);

            const livesLabel = k.add([
                k.text("Lives: 3", { size: 24 }),
                k.pos(k.width() - 20, 20),
                k.anchor("topright"),
                k.color(255, 100, 100)
            ]);

            const player = k.add([
                k.rect(60, 20),
                k.pos(k.width() / 2, k.height() - 40),
                k.anchor("center"),
                k.area(),
                k.body({ isStatic: true }),
                k.color(0, 255, 213),
                "player"
            ]);

            k.onUpdate(() => {
                player.pos.x = k.mousePos().x;
                if (player.pos.x < 30) player.pos.x = 30;
                if (player.pos.x > k.width() - 30) player.pos.x = k.width() - 30;
            });

            function spawnItem() {
                const isBad = k.rand(0, 10) > 7;
                const x = k.rand(30, k.width() - 30);

                if (isBad) {
                    k.add([
                        k.rect(40, 40),
                        k.pos(x, -50),
                        k.anchor("center"),
                        k.area(),
                        k.body(),
                        k.move(k.vec2(0, 1), k.rand(200, 400)),
                        k.color(255, 0, 0),
                        k.offscreen({ destroy: true }),
                        "bad"
                    ]);
                } else {
                    let sprite = null;
                    if (goodSprites.length > 0) sprite = k.choose(goodSprites);
                    const comp = sprite ? k.sprite(sprite, { width: 40, height: 40 }) : k.rect(30, 30);

                    k.add([
                        comp,
                        k.pos(x, -50),
                        k.anchor("center"),
                        k.area(),
                        k.body(),
                        k.move(k.vec2(0, 1), k.rand(150, 350)),
                        k.color(255, 255, 255),
                        k.offscreen({ destroy: true }),
                        "good"
                    ]);
                }

                const waitTime = k.rand(0.5, 1.5) / (1 + (score / 20));
                k.wait(waitTime, spawnItem);
            }

            spawnItem();

            player.onCollide("good", (item) => {
                k.destroy(item);
                score++;
                scoreLabel.text = score;
                k.shake(2);
                k.add([
                    k.text("+1", { size: 20 }),
                    k.pos(player.pos.x, player.pos.y - 30),
                    k.move(k.vec2(0, -1), 100),
                    k.lifespan(0.5, { fade: 0.5 }),
                    k.color(0, 255, 0)
                ]);
            });

            player.onCollide("bad", (item) => {
                k.destroy(item);
                lives--;
                livesLabel.text = `Lives: ${lives}`;
                k.shake(20);
                k.add([
                    k.text("OUCH", { size: 20 }),
                    k.pos(player.pos.x, player.pos.y - 30),
                    k.move(k.vec2(0, -1), 100),
                    k.lifespan(0.5, { fade: 0.5 }),
                    k.color(255, 0, 0)
                ]);

                if (lives <= 0) {
                    k.go("gameover", score);
                }
            });
        });

        k.scene("gameover", (score) => {
            k.add([
                k.text("GAME OVER", { size: 48 }),
                k.pos(k.width() / 2, k.height() / 2 - 50),
                k.anchor("center"),
                k.color(255, 50, 50)
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
        });

        k.go("main");
    };

    window.closeGravityHarvest = function () {
        const app = window.GameApp;
        const container = document.getElementById('gravity-container');
        if (container) container.style.display = 'none';
        if (k) {
            try { k.quit(); } catch (e) { }
            const canvas = container.querySelector('canvas');
            if (canvas) canvas.remove();
            k = null;
        }
        app.helpers.endGame(false);
    };
})();
