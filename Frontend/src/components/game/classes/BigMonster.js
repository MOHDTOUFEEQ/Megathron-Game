import EnemyBullet from "./EnemyBullet.js";
import { store } from "../../../store/store";
import { setMonsterKilled } from "../../../store/playerSlice";

class BigMonster {
	constructor({ x = 3000, y = 100, width = 150, height = 150, imageSrc }) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.hitbox = {
			x: x,
			y: y,
			width: width,
			height: height,
		};
		this.isImageLoaded = false;
		this.image = new Image();
		this.image.onload = () => {
			this.isImageLoaded = true;
		};
		this.image.onerror = () => {
			console.error("Failed to load big monster image:", imageSrc);
		};
		this.image.src = imageSrc;
		this.health = 200;
		this.isDead = false;
		this.bullets = [];

		// Rapid-fire settings
		this.burstCount = 5; // Number of bullets per burst
		this.burstDelay = 0.05; // Very short delay between bullets
		this.waveDelay = 0.8; // Shorter delay between waves
		this.fireCooldown = 0;
		this.burstCooldown = 0;
		this.currentBurst = 0;
		this.bulletAngles = [0, -0.15, 0.15, -0.1, 0.1]; // More angles for spread pattern

		// Lower straight bullet settings
		this.lowerBulletCooldown = 1.6; // Fire lower bullet every 1.5 seconds
	}

	update(deltaTime) {
		if (this.isDead) return;

		// Check if health is depleted
		if (this.health <= 0) {
			this.die();
			return;
		}

		// Update wave cooldown
		if (this.fireCooldown > 0) {
			this.fireCooldown -= deltaTime;
		} else if (this.currentBurst < this.burstCount) {
			// Handle rapid-fire burst
			if (this.burstCooldown <= 0) {
				this.fireBullet(this.currentBurst);
				this.currentBurst++;
				this.burstCooldown = this.burstDelay;
			} else {
				this.burstCooldown -= deltaTime;
			}
		} else {
			// Reset for next wave
			this.currentBurst = 0;
			this.fireCooldown = this.waveDelay;
		}

		// Handle lower straight bullet
		if (this.lowerBulletCooldown > 0) {
			this.lowerBulletCooldown -= deltaTime;
		} else {
			this.fireLowerBullet();
			this.lowerBulletCooldown = 1.5; // Reset cooldown
		}

		// Update bullets
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			const bullet = this.bullets[i];
			bullet.update();

			// Remove bullets that have traveled their maximum distance
			if (Math.abs(bullet.x - bullet.initialX) >= 400) {
				this.bullets.splice(i, 1);
			}
		}
	}

	fireBullet(burstIndex) {
		const bulletX = this.x;
		const bulletY = this.y + this.height / 2;

		this.bullets.push(
			new EnemyBullet(
				bulletX,
				bulletY,
				6, // Smaller width
				4, // Smaller height
				8, // Faster speed
				-1, // Direction (left)
				this.bulletAngles[burstIndex] // Use different angle for each bullet
			)
		);
	}

	fireLowerBullet() {
		const bulletX = this.x;
		const bulletY = this.y + this.height - 20; // Position at lower part of monster

		this.bullets.push(
			new EnemyBullet(
				bulletX,
				bulletY,
				8, // Slightly wider
				5, // Slightly taller
				6, // Speed
				-1, // Direction (left)
				0 // No angle (straight line)
			)
		);
	}

	draw(c) {
		if (this.isDead) return;

		if (!this.isImageLoaded) {
			// Draw a placeholder rectangle
			c.fillStyle = "purple";
			c.fillRect(this.x, this.y, this.width, this.height);
			return;
		}

		// Draw bullets
		this.bullets.forEach((bullet) => bullet.draw(c));

		// Draw health bar
		const healthBarWidth = 60;
		const healthBarHeight = 6;
		const healthBarX = this.x;
		const healthBarY = this.y - 15;

		// Background of health bar
		c.fillStyle = "rgba(0, 0, 0, 0.5)";
		c.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

		// Current health
		c.fillStyle = this.health > 100 ? "green" : this.health > 50 ? "yellow" : "red";
		c.fillRect(healthBarX, healthBarY, (healthBarWidth * this.health) / 200, healthBarHeight);

		// Draw monster sprite
		c.drawImage(this.image, this.x, this.y, this.width, this.height);
	}

	die() {
		store.dispatch(setMonsterKilled(true));
		this.isDead = true;
		this.bullets = []; // Clear all bullets
	}
}

export default BigMonster;
