export default class EnemyBullet {
	constructor(x, y, width = 4, height = 2, speed = 8, direction = -1, angle = 0) {
		this.x = x;
		this.y = y;
		this.initialX = x;
		this.initialY = y;
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.direction = direction;
		this.angle = angle;
		this.color = "#ff4444"; // Brighter red for better visibility
		this.trailLength = 5; // Number of trail segments
		this.trail = []; // Store previous positions for trail effect
		this.explosionImage = new Image();
		this.explosionImage.src = "/images/explosion.png";
	}

	update() {
		// Store current position for trail
		this.trail.unshift({ x: this.x, y: this.y });
		if (this.trail.length > this.trailLength) {
			this.trail.pop();
		}

		// Calculate movement based on angle
		const distance = this.speed;
		this.x += distance * this.direction;
		this.y += Math.sin(this.angle) * distance;
	}

	draw(ctx) {
		ctx.save();

		// Draw trail
		this.trail.forEach((pos, index) => {
			const alpha = 1 - index / this.trailLength;
			ctx.fillStyle = `rgba(255, 68, 68, ${alpha * 0.5})`;
			ctx.fillRect(pos.x - this.width / 2, pos.y - this.height / 2, this.width, this.height);
		});

		// Draw main bullet
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);

		// Make explosion image bigger (2x the size of the bullet)
		const explosionWidth = this.width * 3;
		const explosionHeight = this.height * 3;
		ctx.drawImage(this.explosionImage, -explosionWidth / 2, -explosionHeight / 2, explosionWidth, explosionHeight);

		// Add a small highlight for depth
		ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
		ctx.fillRect(-this.width / 2, -this.height / 2, this.width / 2, this.height);

		ctx.restore();
	}
}
