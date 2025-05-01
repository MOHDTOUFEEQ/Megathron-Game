window.addEventListener('keydown', (event) => {
  if (window.isGameOver) return; // Don't process input if game is over
  
  switch (event.key) {
    case 'w':
      player.jump()
      keys.w.pressed = true
      break
    case 'a':
      keys.a.pressed = true
      break
    case 'd':
      keys.d.pressed = true
      break
    case ' ':
      player.roll()
      break
  }
})

window.addEventListener('keyup', (event) => {
  if (window.isGameOver) return; // Don't process input if game is over
  
  switch (event.key) {
    case 'a':
      keys.a.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

window.addEventListener("mousedown", (e) => {
  if (window.isGameOver) return; // Don't process input if game is over
  
  if (e.button === 0) {
    player.fire();
  }
});

window.addEventListener("mouseup", (e) => {
  if (window.isGameOver) return; // Don't process input if game is over
  
  if (e.button === 0) {
  }
});

// On return to game's tab, ensure delta time is reset
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    lastTime = performance.now()
  }
})
