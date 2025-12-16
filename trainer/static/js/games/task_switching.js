(function () {
    // --- Task Switching State ---
    let taskScore = 0;
    let taskLives = 3;
    let taskRule = 'number'; // 'number' (Even/Odd) or 'letter' (Vowel/Consonant)
    let currentTaskItem = null; // { val: 'A', type: 'letter' }

    function startTaskSwitchingGame() {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        taskScore = 0;
        taskLives = 3;
        taskRule = 'number';

        GameApp.helpers.stopTimer();

        displays.gameGrid.innerHTML = '';
        displays.gameGrid.style.display = 'flex';
        displays.gameGrid.style.flexDirection = 'column';
        displays.gameGrid.style.alignItems = 'center';
        displays.gameGrid.style.justifyContent = 'center';

        // Rule Header
        const ruleHeader = document.createElement('h2');
        ruleHeader.id = 'task-rule-header';
        ruleHeader.style.color = '#ffeb3b';
        ruleHeader.style.marginBottom = '20px';
        ruleHeader.innerText = "RULE: NUMBERS (Even vs Odd)";
        displays.gameGrid.appendChild(ruleHeader);

        // Card Container
        const card = document.createElement('div');
        card.id = 'task-card';
        card.style.width = '150px';
        card.style.height = '200px';
        card.style.background = '#fff';
        card.style.color = '#000';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'center';
        card.style.alignItems = 'center';
        card.style.fontSize = '48px';
        card.style.fontWeight = 'bold';
        card.style.borderRadius = '10px';
        card.innerText = "?";
        displays.gameGrid.appendChild(card);

        // Buttons
        const btnsDiv = document.createElement('div');
        btnsDiv.style.marginTop = '30px';
        btnsDiv.style.display = 'flex';
        btnsDiv.style.gap = '50px';

        const btnL = document.createElement('button');
        btnL.className = 'action-btn';
        btnL.id = 'task-btn-left';
        btnL.innerText = "Left";
        btnL.onclick = () => handleTaskInput('left');

        const btnR = document.createElement('button');
        btnR.className = 'action-btn';
        btnR.id = 'task-btn-right';
        btnR.innerText = "Right";
        btnR.onclick = () => handleTaskInput('right');

        btnsDiv.appendChild(btnL);
        btnsDiv.appendChild(btnR);
        displays.gameGrid.appendChild(btnsDiv);

        // Key Listener with cleanup handled by simple overwrite (Module doesn't own EndGame yet)
        window.onkeydown = (e) => {
            if (e.key === 'ArrowLeft') handleTaskInput('left');
            if (e.key === 'ArrowRight') handleTaskInput('right');
        };

        nextTaskTurn();
        GameApp.helpers.switchScreen('game');

        // Update UI initially
        if (displays.livesContainer) {
            displays.livesContainer.style.display = 'block';
            displays.livesDisplay.innerText = taskLives;
        }
        if (displays.time) displays.time.innerText = taskScore;
    }

    function nextTaskTurn() {
        // Randomly switch rule (40% chance)
        if (Math.random() < 0.4) {
            taskRule = taskRule === 'number' ? 'letter' : 'number';
        }

        // Update UI
        const h = document.getElementById('task-rule-header');
        const btnL = document.getElementById('task-btn-left');
        const btnR = document.getElementById('task-btn-right');

        if (taskRule === 'number') {
            h.innerText = "RULE: NUMBERS";
            h.style.color = '#4fc3f7';
            btnL.innerText = "EVEN";
            btnR.innerText = "ODD";
        } else {
            h.innerText = "RULE: LETTERS";
            h.style.color = '#ff9800';
            btnL.innerText = "VOWEL";
            btnR.innerText = "CONSONANT";
        }

        // Generate Content
        // We need a pair: Letter + Number, e.g. "K 7" or "A 2"
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const letters = "ABCDEFGHIJKMNOPQRSTUVWXYZ".split(''); // L excluded?
        const vowels = ['A', 'E', 'I', 'O', 'U'];

        const num = numbers[Math.floor(Math.random() * numbers.length)];
        const lettr = letters[Math.floor(Math.random() * letters.length)];

        // Randomize position: Number Top/Bottom?
        // Actually just display format: "5 K" or "K 5"
        const order = Math.random() > 0.5;
        const text = order ? `${num} ${lettr}` : `${lettr} ${num}`;

        const card = document.getElementById('task-card');
        card.innerText = text;

        // Store truth
        currentTaskItem = {
            num: num,
            char: lettr,
            isEven: (num % 2 === 0),
            isVowel: vowels.includes(lettr)
        };
    }

    function handleTaskInput(side) {
        const GameApp = window.GameApp;
        const displays = GameApp.displays;

        if (!currentTaskItem) return;

        let correct = false;

        if (taskRule === 'number') {
            // Left: Even, Right: Odd
            if (side === 'left' && currentTaskItem.isEven) correct = true;
            if (side === 'right' && !currentTaskItem.isEven) correct = true;
        } else {
            // Left: Vowel, Right: Consonant
            if (side === 'left' && currentTaskItem.isVowel) correct = true;
            if (side === 'right' && !currentTaskItem.isVowel) correct = true;
        }

        if (correct) {
            taskScore += 100;
            if (displays.time) displays.time.innerText = taskScore;

            if (window.SoundManager) window.SoundManager.playPop();

            const card = document.getElementById('task-card');
            card.style.background = '#cfc';
            setTimeout(() => card.style.background = '#fff', 150);

            nextTaskTurn();
        } else {
            taskLives--;
            if (displays.livesDisplay) displays.livesDisplay.innerText = taskLives;

            if (window.SoundManager) window.SoundManager.playError();

            const card = document.getElementById('task-card');
            card.style.background = '#fcc';
            setTimeout(() => card.style.background = '#fff', 150);

            if (taskLives <= 0) {
                window.onkeydown = null; // Cleanup
                if (displays.finalTime) displays.finalTime.innerText = `Final Score: ${taskScore}`;
                GameApp.helpers.switchScreen('result');
            }
        }
    }

    window.startTaskSwitchingGame = startTaskSwitchingGame;

})();
