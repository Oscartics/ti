const ring = document.getElementById('ringProgress');
const number = document.getElementById('timeNumber');
const statusText = document.getElementById('statusText');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const fullscreenButton = document.getElementById('fullscreenButton');
const bottomProgress = document.getElementById('bottomProgress');
const app = document.querySelector('.timer-app');
const radius = 218;
const circumference = 2 * Math.PI * radius;
ring.style.strokeDasharray = circumference;

let duration = 30;
let remaining = duration;
let running = false;
let startedAt = 0;
let animationId = null;

function colorFor(progress) {
  if (progress > .5) return '#2095ff';
  if (progress > .2) return '#f6c344';
  return '#ff5252';
}
function render(seconds) {
  const progress = Math.max(0, seconds / duration);
  const color = colorFor(progress);
  document.documentElement.style.setProperty('--accent', color);
  ring.style.strokeDashoffset = circumference * (1 - progress);
  bottomProgress.style.width = `${progress * 100}%`;
  number.textContent = Math.ceil(seconds);
  ring.parentElement.setAttribute('aria-label', `${Math.ceil(seconds)} segundos restantes`);
}
function stop() { cancelAnimationFrame(animationId); animationId = null; running = false; }
function ding() {
  try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type='sine'; osc.frequency.setValueAtTime(880,ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1320,ctx.currentTime+.3); gain.gain.setValueAtTime(.001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.16,ctx.currentTime+.02); gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.75); osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+.8); } catch (_) {}
}
function finish() { stop(); remaining = 0; render(0); app.classList.add('finished'); statusText.textContent = '¡TIEMPO FINALIZADO!'; startButton.innerHTML = '<span class="play-icon">▶</span> INICIAR'; ding(); }
function tick(now) { remaining = Math.max(0, duration - (now - startedAt) / 1000); render(remaining); if (remaining <= 0) finish(); else animationId = requestAnimationFrame(tick); }
function start() { if (running) { stop(); startButton.innerHTML = '<span class="play-icon">▶</span> CONTINUAR'; statusText.textContent = 'PAUSADO'; return; } if (remaining <= 0) remaining = duration; app.classList.remove('finished'); startedAt = performance.now() - (duration - remaining) * 1000; running = true; statusText.textContent = 'TIEMPO EN CURSO'; startButton.textContent = '❚❚ PAUSAR'; animationId = requestAnimationFrame(tick); }
function reset() { stop(); remaining = duration; app.classList.remove('finished'); statusText.textContent = 'LISTO PARA COMENZAR'; startButton.innerHTML = '<span class="play-icon">▶</span> INICIAR'; render(remaining); }
document.querySelectorAll('[data-duration]').forEach(button => button.addEventListener('click', () => { duration = Number(button.dataset.duration); document.querySelectorAll('[data-duration]').forEach(item => item.classList.toggle('selected', item === button)); reset(); }));
startButton.addEventListener('click', start); resetButton.addEventListener('click', reset);
fullscreenButton.addEventListener('click', async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch (_) {} });
document.addEventListener('fullscreenchange', () => { fullscreenButton.setAttribute('aria-label', document.fullscreenElement ? 'Salir de pantalla completa' : 'Activar pantalla completa'); });
document.addEventListener('keydown', e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); start(); } if (e.key.toLowerCase() === 'r') reset(); });
render(remaining);
