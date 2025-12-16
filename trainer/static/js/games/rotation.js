(function () {
    let rotationScore = 0;
    let rotationLives = 3;
    let rotationIsMirror = false;
    let rotationActive = false;

    window.startSpatialRotationGame = function () {
        const app = window.GameApp;
        if (!app) {
            alert("GameApp not initialized! Reload page.");
            return;
        }

        rotationScore = 0;
        rotationLives = 3;
        rotationActive = true;

        app.displays.livesContainer.style.display = 'block';
        app.displays.livesDisplay.innerText = rotationLives;

        const timerContainer = app.displays.time.parentElement;
        timerContainer.innerHTML = `Score: <span id="time-display">0</span>`;
        app.displays.time = document.getElementById('time-display');

        // Ensure overlays are hidden
        ['gravity-container', 'gauntlet-container', 'flappy-container', 'rpg-player-hud', 'rpg-player-sprite'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        app.displays.gameGrid.innerHTML = '';
        app.displays.gameGrid.style.display = 'flex';
        app.displays.gameGrid.style.flexDirection = 'column';
        app.displays.gameGrid.style.alignItems = 'center';
        app.displays.gameGrid.style.justifyContent = 'center';
        app.displays.gameGrid.style.gap = '20px';

        const iconContainer = document.createElement('div');
        iconContainer.style.display = 'flex';
        iconContainer.style.gap = '50px';
        iconContainer.style.marginBottom = '20px';

        const leftIcon = document.createElement('div');
        leftIcon.id = 'rot-left';
        leftIcon.style.width = '120px';
        leftIcon.style.height = '120px';
        leftIcon.style.background = '#222';
        leftIcon.style.borderRadius = '10px';

        const rightIcon = document.createElement('div');
        rightIcon.id = 'rot-right';
        rightIcon.style.width = '120px';
        rightIcon.style.height = '120px';
        rightIcon.style.background = '#222';
        rightIcon.style.borderRadius = '10px';

        iconContainer.appendChild(leftIcon);
        iconContainer.appendChild(rightIcon);
        app.displays.gameGrid.appendChild(iconContainer);

        const btnsDiv = document.createElement('div');
        btnsDiv.style.display = 'flex';
        btnsDiv.style.gap = '20px';

        const btnSame = document.createElement('button');
        btnSame.className = 'action-btn';
        btnSame.innerText = "SAME (Left)";
        btnSame.style.background = '#4caf50';
        btnSame.onclick = () => checkRotationInput(false);

        const btnMirror = document.createElement('button');
        btnMirror.className = 'action-btn';
        btnMirror.innerText = "MIRRORED (Right)";
        btnMirror.style.background = '#f44336';
        btnMirror.onclick = () => checkRotationInput(true);

        btnsDiv.appendChild(btnSame);
        btnsDiv.appendChild(btnMirror);
        app.displays.gameGrid.appendChild(btnsDiv);

        window.onkeydown = (e) => {
            if (!rotationActive) return;
            if (e.key === 'ArrowLeft') checkRotationInput(false);
            if (e.key === 'ArrowRight') checkRotationInput(true);
        };

        nextRotationTurn();
        app.helpers.switchScreen('game');
    };

    function nextRotationTurn() {
        if (!rotationActive) return;
        const app = window.GameApp;

        const cat = app.state.activeCategories[0] || 'numbers';
        const id = Math.floor(Math.random() * app.state.MAX_ASSETS);
        const content = app.helpers.getDirectContent(cat, id);

        rotationIsMirror = Math.random() > 0.5;
        const angle = Math.floor(Math.random() * 4) * 90;

        const left = document.getElementById('rot-left');
        left.innerHTML = '';
        renderIconContent(left, content);

        const right = document.getElementById('rot-right');
        right.innerHTML = '';
        renderIconContent(right, content);

        const inner = right.children[0];
        if (inner) {
            let transform = `rotate(${angle}deg)`;
            if (rotationIsMirror) transform += ` scaleX(-1)`;
            inner.style.transform = transform;
            inner.style.transition = 'none';
        }
    }

    function renderIconContent(container, data) {
        if (data.type === 'text') {
            const span = document.createElement('span');
            span.className = 'text-icon';
            span.innerText = data.content;
            span.style.fontSize = '64px';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.appendChild(span);
        } else {
            const img = document.createElement('img');
            img.src = data.content;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            container.appendChild(img);
        }
    }

    function checkRotationInput(inputIsMirror) {
        const app = window.GameApp;
        if (inputIsMirror === rotationIsMirror) {
            rotationScore += 100;
            app.displays.time.innerText = rotationScore;

            document.body.style.backgroundColor = '#050';
            setTimeout(() => { document.body.style.backgroundColor = ''; }, 100);

            nextRotationTurn();
        } else {
            rotationLives--;
            app.displays.livesDisplay.innerText = rotationLives;

            document.body.style.backgroundColor = '#500';
            setTimeout(() => { document.body.style.backgroundColor = ''; }, 100);

            if (rotationLives <= 0) {
                rotationActive = false;
                app.helpers.endGame(false);
            } else {
                nextRotationTurn();
            }
        }
    }
})();
