class BrainAPI {
    static getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    static async saveScore(gameMode, score, metadata = {}) {
        const csrftoken = this.getCookie('csrftoken');
        try {
            const response = await fetch('/api/save_score/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    game_mode: gameMode,
                    score: score,
                    metadata: metadata
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                console.log("Score saved!");
                return true;
            } else {
                console.warn("Failed to save score:", data.message);
                return false;
            }
        } catch (error) {
            console.error("API Error:", error);
            return false;
        }
    }

    static async getLeaderboard(gameMode) {
        try {
            const response = await fetch(`/api/leaderboard/?game_mode=${gameMode}`);
            const data = await response.json();
            return data.leaderboard || [];
        } catch (error) {
            console.error("API Error:", error);
            return [];
        }
    }

    static async getMyProgress() {
        try {
            const response = await fetch('/api/my_progress/');
            const data = await response.json(); // Returns { history: { mode: [ {score, date}... ] } }
            return data.history || {};
        } catch (error) {
            console.error("API Error:", error);
            return {};
        }
    }
}

window.BrainAPI = BrainAPI;
