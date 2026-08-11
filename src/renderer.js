const pet = document.getElementById('pet')
const petImg = document.querySelector('.pet-img')
const bubble = document.getElementById('bubble')
const settingsPanel = document.getElementById('settings-panel')
const settingsClose = document.getElementById('settings-close')
const sizeSlider = document.getElementById('size-slider')
const sizeValue = document.getElementById('size-value')

let isDragging = false
let startX = 0
let startY = 0
let totalDragX = 0
let totalDragY = 0
const DRAG_THRESHOLD = 5

const IDLE_TIMEOUT_MS = 30 * 1000
let idleTimer = null

const BASE_IMG_WIDTH = 260
const STORAGE_KEY_SCALE = 'pet-scale'

const STATES = {
  hello: {
    img: './assets/hello.png',
    messages: [
      '哇！你好呀~',
      '终于等到你啦！',
      '今天也要元气满满哦！',
      '主人，我好想你！',
      '嘿嘿，你来啦~',
      '开心！我在这儿！',
    ],
  },
  rest: {
    img: './assets/rest.png',
    messages: [
      '我在休息一下~',
      'zzZ...好困啊',
      '让我眯一会儿...',
      '今天好累呀~',
      '休息好了再陪你玩~',
      '嘘...别吵我睡觉~',
    ],
  },
  happy: {
    img: './assets/happy.png',
    messages: [
      '好开心！被你点到啦~',
      '嘻嘻，就喜欢你摸我！',
      '哇！心情瞬间变好了！',
      '一起玩吧一起玩吧！',
      '嘿嘿嘿，我最可爱~',
      '被你发现啦！耶！',
    ],
  },
  wink: {
    img: './assets/wink.png',
    messages: [
      '眨眨眼~想我没？',
      '嘿嘿，我知道你喜欢我~',
      '偷偷给你一个wink！',
      '只有你能看到哦~',
      '小心心都给你！',
      '嗯？你在偷看我吗~',
    ],
  },
}

let currentState = 'hello'
let currentScale = 1.0

function setState(state, options = {}) {
  if (!(state in STATES)) return
  currentState = state
  const cfg = STATES[state]
  petImg.src = cfg.img
  if (options.showMessage !== false) {
    const msg = cfg.messages[Math.floor(Math.random() * cfg.messages.length)]
    showBubble(msg)
  }
  resetIdleTimer()
}

function showBubble(message, duration = 2000) {
  bubble.textContent = message
  bubble.classList.remove('hidden')
  bubble.style.animation = 'none'
  bubble.offsetHeight
  bubble.style.animation = ''
  clearTimeout(showBubble._timer)
  showBubble._timer = setTimeout(() => {
    bubble.classList.add('hidden')
  }, duration)
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    setState('rest')
  }, IDLE_TIMEOUT_MS)
}

function applyScale(scale) {
  currentScale = scale
  petImg.style.width = Math.round(BASE_IMG_WIDTH * scale) + 'px'
  window.petAPI.resizeWindow(scale)
  localStorage.setItem(STORAGE_KEY_SCALE, String(scale))
  sizeValue.textContent = Math.round(scale * 100) + '%'
  sizeSlider.value = Math.round(scale * 100)
}

function loadScale() {
  const saved = localStorage.getItem(STORAGE_KEY_SCALE)
  if (saved) {
    const scale = parseFloat(saved)
    if (scale >= 0.5 && scale <= 2.0) {
      currentScale = scale
      petImg.style.width = Math.round(BASE_IMG_WIDTH * scale) + 'px'
      sizeSlider.value = Math.round(scale * 100)
      sizeValue.textContent = Math.round(scale * 100) + '%'
      window.petAPI.resizeWindow(scale)
    }
  }
}

function openSettings() {
  settingsPanel.classList.remove('hidden')
  sizeSlider.value = Math.round(currentScale * 100)
  sizeValue.textContent = Math.round(currentScale * 100) + '%'
}

function closeSettings() {
  settingsPanel.classList.add('hidden')
}

pet.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return
  isDragging = true
  startX = e.screenX
  startY = e.screenY
  totalDragX = 0
  totalDragY = 0
  pet.classList.add('dragging')
  resetIdleTimer()
})

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return
  const deltaX = e.screenX - startX
  const deltaY = e.screenY - startY
  totalDragX = deltaX
  totalDragY = deltaY

  if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
    window.petAPI.moveWindow(deltaX, deltaY)
    startX = e.screenX
    startY = e.screenY
  }
})

document.addEventListener('mouseup', (e) => {
  if (!isDragging) return
  isDragging = false
  pet.classList.remove('dragging')
  resetIdleTimer()

  if (Math.abs(totalDragX) < DRAG_THRESHOLD && Math.abs(totalDragY) < DRAG_THRESHOLD) {
    handleClick()
  }
})

function handleClick() {
  pet.classList.add('bounce')
  setTimeout(() => pet.classList.remove('bounce'), 300)
  const choice = Math.random() < 0.5 ? 'happy' : 'wink'
  setState(choice)
}

pet.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  window.petAPI.showContextMenu()
  resetIdleTimer()
})

pet.addEventListener('mouseenter', resetIdleTimer)
document.addEventListener('mousemove', resetIdleTimer)
document.addEventListener('keydown', resetIdleTimer)

window.petAPI.onSetMood((mood) => {
  if (mood in STATES) {
    setState(mood)
  }
})

window.petAPI.onOpenSettings(() => {
  openSettings()
})

settingsClose.addEventListener('click', closeSettings)

sizeSlider.addEventListener('input', (e) => {
  const scale = parseInt(e.target.value) / 100
  applyScale(scale)
})

document.addEventListener('click', (e) => {
  if (
    !settingsPanel.classList.contains('hidden') &&
    !settingsPanel.contains(e.target) &&
    !pet.contains(e.target)
  ) {
    closeSettings()
  }
})

loadScale()

setTimeout(() => {
  setState('hello', { showMessage: true })
}, 300)