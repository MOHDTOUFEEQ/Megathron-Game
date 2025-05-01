import EnemyBullet from './EnemyBullet.js';

class Enemy {
  constructor({ x, y, width = 40, height = 60, imageSrc, canvasWidth }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hitbox = {
      x: x,
      y: y,
      width: width,
      height: height
    };
    this.originalX = x; // Store original x position for patrolling
    this.velocity = { x: -50, y: 0 }; // Initial velocity to the left
    this.isOnGround = false;
    this.isImageLoaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.isImageLoaded = true;
    };
    this.image.onerror = () => {
      console.error('Failed to load enemy image:', imageSrc);
    };
    this.image.src = imageSrc;
    this.facing = 'left'; // Initial facing direction
    this.patrolDistance = 200; // Distance to patrol
    this.distanceTraveled = 0;
    this.health = 100;
    this.isDead = false;
    this.bullets = [];
    this.fireRate = 2; // Seconds between shots
    this.fireCooldown = 0;
    this.canvasWidth = canvasWidth; // Store canvas width for bullet boundary checks
    
    // Add position logging
    this.lastLogTime = 0;
    this.logInterval = 1; // Log every 1 second
  }

  update(deltaTime, collisionBlocks) {
    if (this.isDead) return;

    // Update position logging
    this.lastLogTime += deltaTime;
    if (this.lastLogTime >= this.logInterval) {
      this.lastLogTime = 0;
    }

    // Update shooting cooldown
    if (this.fireCooldown > 0) {
      this.fireCooldown -= deltaTime;
    } else {
      this.fire();
      this.fireCooldown = this.fireRate;
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update();
      
      // Remove bullets that are off screen
      if (bullet.x < 0 || bullet.x > this.canvasWidth) {
        this.bullets.splice(i, 1);
      }
    }

    // Update position
    this.x += this.velocity.x * deltaTime;
    this.distanceTraveled += Math.abs(this.velocity.x * deltaTime);

    // Update hitbox position
    this.hitbox.x = this.x;
    this.hitbox.y = this.y;

    // Check if we've reached patrol limit
    if (this.distanceTraveled >= this.patrolDistance) {
      this.velocity.x = -this.velocity.x; // Reverse direction
      this.distanceTraveled = 0;
      this.facing = this.velocity.x > 0 ? 'right' : 'left';
    }

    // Check collisions with blocks
    this.checkCollisions(collisionBlocks);
  }

  fire() {
    const bulletX = this.facing === 'right' ? this.x + this.width : this.x;
    const direction = this.facing === 'right' ? 1 : -1;
    
    this.bullets.push(new EnemyBullet(
      bulletX,
      this.y + this.height / 2,
      10,
      5,
      5,
      direction
    ));
  }

  checkCollisions(collisionBlocks) {
    for (let i = 0; i < collisionBlocks.length; i++) {
      const block = collisionBlocks[i];
      
      // Check horizontal collisions
      if (this.x <= block.x + block.width &&
          this.x + this.width >= block.x &&
          this.y + this.height >= block.y &&
          this.y <= block.y + block.height) {
        if (this.velocity.x > 0) {
          this.x = block.x - this.width;
          this.velocity.x = -this.velocity.x;
          this.facing = 'left';
        } else if (this.velocity.x < 0) {
          this.x = block.x + block.width;
          this.velocity.x = -this.velocity.x;
          this.facing = 'right';
        }
        this.distanceTraveled = 0;
      }
    }
  }

  draw(c) {
    if (!this.isImageLoaded) {
      // Draw a placeholder rectangle
      c.fillStyle = 'red';
      c.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    // Draw bullets
    this.bullets.forEach(bullet => bullet.draw(c));

    // Draw enemy
    let xScale = 1;
    let x = this.x;

    if (this.facing === 'right') {
      xScale = -1;
      x = -this.x - this.width;
    }

    c.save();
    c.scale(xScale, 1);

    // Draw health bar
    const healthBarWidth = 30;
    const healthBarHeight = 4;
    const healthBarX = x;
    const healthBarY = this.y - 10;

    // Background of health bar
    c.fillStyle = 'rgba(0, 0, 0, 0.5)';
    c.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Current health
    c.fillStyle = this.health > 50 ? 'green' : this.health > 25 ? 'yellow' : 'red';
    c.fillRect(healthBarX, healthBarY, (healthBarWidth * this.health) / 100, healthBarHeight);

    // Draw enemy sprite
    c.drawImage(
      this.image,
      x,
      this.y,
      this.width,
      this.height
    );

    c.restore();
  }

  die() {
    this.isDead = true;
  }
}

export default Enemy; 