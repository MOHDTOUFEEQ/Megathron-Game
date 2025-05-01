// # Bullet behavior (position, direction, collisions)

class Bullet {
	constructor(x, y, velocity) {
		this.x = x;
		this.y = y;
		this.velocity = velocity;
		this.width = 16; // Adjust based on your bullet sprite size
		this.height = 16; // Adjust based on your bullet sprite size

		// Add sprite image
		this.image = new Image();
		this.isImageLoaded = false;

		this.image.onload = () => {
			this.isImageLoaded = true;
		};

		this.image.onerror = () => {
			console.error("Failed to load bullet sprite");
		};

		// Set the path to your bullet sprite
		this.image.src = "/images/laser.png";

		// Sprite animation properties
		this.currentFrame = 0;
		this.elapsedTime = 0;
		this.frameWidth = 1024; // Width of each frame in the sprite
		this.frameHeight = 1024; // Height of each frame in the sprite
		this.frames = 1; // Number of animation frames
	}

	draw(c) {
		if (this.isImageLoaded) {
			try {
				c.drawImage(
					this.image,
					this.currentFrame * this.frameWidth, // Source X
					0, // Source Y
					this.frameWidth, // Source Width
					this.frameHeight, // Source Height
					this.x, // Destination X
					this.y, // Destination Y
					this.width, // Destination Width
					this.height // Destination Height
				);
			} catch (err) {
				console.error("Error drawing bullet sprite:", err);
				// Fallback to rectangle if sprite fails
				c.fillStyle = "yellow";
				c.fillRect(this.x, this.y, this.width, this.height);
			}
		} else {
			// Placeholder while image loads
			c.fillStyle = "yellow";
			// c.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	update(deltaTime) {
		// Update position
		this.x += this.velocity;

		// Update animation if you have multiple frames
		if (this.frames > 1) {
			this.elapsedTime += deltaTime;
			if (this.elapsedTime >= 0.1) {
				// Change frame every 0.1 seconds
				this.currentFrame = (this.currentFrame + 1) % this.frames;
				this.elapsedTime = 0;
			}
		}
	}
}

export default Bullet;
