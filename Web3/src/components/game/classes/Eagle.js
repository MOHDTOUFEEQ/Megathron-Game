const EAGLE_X_VELOCITY = -20
const EAGLE_JUMP_POWER = 250
const EAGLE_GRAVITY = 580

class Eagle {
  constructor(
    { x, y, width, height, velocity = { x: EAGLE_X_VELOCITY, y: 0 } },
    turningDistance = 100,
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.velocity = velocity
    this.isOnGround = false
    this.isImageLoaded = false
    this.image = new Image()
    this.image.onload = () => {
      this.isImageLoaded = true
    }
    this.image.src = '/src/components/game/images/eagle.png'
    this.image.onerror = () => {
      console.error("Failed to load eagle image:", this.image.src);
    };
    this.deathEffect = new Image()
    this.deathEffect.src = '/src/components/game/images/enemy-death.png'
    this.deathEffectLoaded = false
    this.deathEffect.onload = () => {
      this.deathEffectLoaded = true
    }
    this.elapsedTime = 0
    this.currentFrame = 0
    this.sprites = {
      run: {
        x: 0,
        y: 0,
        width: 40,
        height: 41,
        frames: 4,
      },
    }
    this.currentSprite = this.sprites.run
    this.facing = 'right'
    this.hitbox = {
      x: 0,
      y: 0,
      width: 40,
      height: 41,
    }
    this.distanceTraveled = 0
    this.turningDistance = turningDistance
    this.health = 100
    this.isDead = false
    this.deathAnimationTime = 0
    this.deathAnimationDuration = 0.5 // seconds
  }

  draw(c) {
    if (this.isDead) {
      return;
    }

    // Red square debug code
    // c.fillStyle = 'rgba(255, 0, 0, 0.5)'
    // c.fillRect(this.x, this.y, this.width, this.height)

    // Hitbox
    // c.fillStyle = 'rgba(0, 0, 255, 0.5)'
    // c.fillRect(
    //   this.hitbox.x,
    //   this.hitbox.y,
    //   this.hitbox.width,
    //   this.hitbox.height,
    // )

    if (this.isImageLoaded === true) {
      let xScale = 1
      let x = this.x

      if (this.facing === 'right') {
        xScale = -1
        x = -this.x - this.width
      }

      c.save()
      c.scale(xScale, 1)

      // Draw health bar only if not dead
      if (!this.isDead) {
        const healthBarWidth = 30
        const healthBarHeight = 4
        const healthBarX = x
        const healthBarY = this.y - 10

        // Background of health bar
        c.fillStyle = 'rgba(0, 0, 0, 0.5)'
        c.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight)

        // Current health
        c.fillStyle = this.health > 50 ? 'green' : this.health > 25 ? 'yellow' : 'red'
        c.fillRect(healthBarX, healthBarY, (healthBarWidth * this.health) / 100, healthBarHeight)
      }

      // Add rotation when dead
      if (this.isDead) {
        c.translate(x + this.width/2, this.y + this.height/2)
        c.rotate(Math.PI/2 * (this.deathAnimationTime / this.deathAnimationDuration))
        c.translate(-(x + this.width/2), -(this.y + this.height/2))
      }

      c.drawImage(
        this.image,
        this.currentSprite.x + this.currentSprite.width * this.currentFrame,
        this.currentSprite.y,
        this.currentSprite.width,
        this.currentSprite.height,
        x,
        this.y,
        this.width,
        this.height,
      )
      c.restore()
    }
  }

  update(deltaTime, collisionBlocks) {
    if (this.isDead) {
      this.deathAnimationTime += deltaTime
      this.velocity.y += 980 * deltaTime // Fall when dead
      this.y += this.velocity.y * deltaTime
      return
    }
    if (!deltaTime) return

    // Updating animation frames
    this.elapsedTime += deltaTime
    const secondsInterval = 0.1
    if (this.elapsedTime > secondsInterval) {
      this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frames
      this.elapsedTime -= secondsInterval
    }

    // Update hitbox position
    this.hitbox.x = this.x
    this.hitbox.y = this.y + 9

    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime)
    this.checkForHorizontalCollisions(collisionBlocks)

    // Check for any platform collisions
    if (window.platforms) {
      this.checkPlatformCollisions(window.platforms, deltaTime)
    }

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime)
    this.checkForVerticalCollisions(collisionBlocks)

    this.determineDirection()
  }

  determineDirection() {
    if (this.velocity.x > 0) {
      this.facing = 'right'
    } else if (this.velocity.x < 0) {
      this.facing = 'left'
    }
  }

  jump() {
    this.velocity.y = -EAGLE_JUMP_POWER
    this.isOnGround = false
  }

  updateHorizontalPosition(deltaTime) {
    if (Math.abs(this.distanceTraveled) > this.turningDistance) {
      this.velocity.x = -this.velocity.x
      this.distanceTraveled = 0
    }

    this.x += this.velocity.x * deltaTime
    this.hitbox.x += this.velocity.x * deltaTime
    this.distanceTraveled += this.velocity.x * deltaTime
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
    this.hitbox.y += this.velocity.y * deltaTime
  }

  applyGravity(deltaTime) {
    this.velocity.y += EAGLE_GRAVITY * deltaTime
  }

  handleInput(keys) {
    this.velocity.x = 0

    if (keys.d.pressed) {
      this.velocity.x = EAGLE_X_VELOCITY
    } else if (keys.a.pressed) {
      this.velocity.x = -EAGLE_X_VELOCITY
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // Check if a collision exists on all axes
      if (
        this.hitbox.x <= collisionBlock.x + collisionBlock.width &&
        this.hitbox.x + this.hitbox.width >= collisionBlock.x &&
        this.hitbox.y + this.hitbox.height >= collisionBlock.y &&
        this.hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going left
        // eslint-disable-next-line no-compare-neg-zero
        if (this.velocity.x < -0) {
          this.hitbox.x = collisionBlock.x + collisionBlock.width + buffer
          this.x = this.hitbox.x
          break
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.hitbox.x = collisionBlock.x - this.hitbox.width - buffer
          this.x = this.hitbox.x
          break
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // If a collision exists
      if (
        this.hitbox.x <= collisionBlock.x + collisionBlock.width &&
        this.hitbox.x + this.hitbox.width >= collisionBlock.x &&
        this.hitbox.y + this.hitbox.height >= collisionBlock.y &&
        this.hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going up
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          this.hitbox.y = collisionBlock.y + collisionBlock.height + buffer
          this.y = this.hitbox.y - 9
          break
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y - this.height - buffer
          this.hitbox.y = collisionBlock.y - this.hitbox.height - buffer
          this.isOnGround = true
          break
        }
      }
    }
  }

  checkPlatformCollisions(platforms = [], deltaTime) {
    if (!platforms || !Array.isArray(platforms)) return;
    const buffer = 0.0001
    for (let platform of platforms) {
      if (platform.checkCollision(this, deltaTime)) {
        this.velocity.y = 0
        this.y = platform.y - this.height - buffer
        this.isOnGround = true
        return
      }
    }
    this.isOnGround = false
  }

  die() {
    if (!this.isDead) {
      this.isDead = true
      this.velocity.y = -100 // Small jump when dying
    }
  }
}

export default Eagle;