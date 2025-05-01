class gameState {
	constructor() {
		this.healthBarFill = document.getElementById("healthBarFill");
		this.gameOverScreen = document.getElementById("gameOverScreen");
		this.isGameOver = false;
	}

	updateHealthBar(health) {
		if (this.isGameOver) return; // Don't update health if game is over
		if (!this.healthBarFill) return; // Don't update if healthBarFill doesn't exist

		this.healthBarFill.style.width = `${health}%`;

		if (health > 60) {
			this.healthBarFill.style.backgroundColor = "#4CAF50"; // green
		} else if (health > 30) {
			this.healthBarFill.style.backgroundColor = "#FFC107"; // yellow
		} else {
			this.healthBarFill.style.backgroundColor = "#F44336"; // red
		}

		// Check if health is 0 or below
		if (health <= 0) {
			this.showGameOverScreen();
		}
	}

	showGameOverScreen() {
		const gameOverScreen = document.getElementById("gameOverScreen");
		gameOverScreen.classList.remove("hidden");
	}

	resetGame() {
		this.isGameOver = false;
		this.gameOverScreen.classList.add("hidden");
		this.healthBarFill.style.width = "100%";
		this.healthBarFill.style.backgroundColor = "#4CAF50";
	}
}

export default gameState;
