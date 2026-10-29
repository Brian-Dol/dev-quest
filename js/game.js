import { LEVELS, buildLevel, TILE, ROWS } from './levels.js';

const W = 960;
const H = ROWS * TILE;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const GRAVITY = 0.55;
const MAX_FALL = 13;
const RUN = 4.2;
const JUMP = -11.6;
const SAVE_KEY = 'devquest.v1';

const save = (() => {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch { return {}; }
})();
save.done = save.done || {};
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* storage unavailable */ } };

/* ---------- input ---------- */
const keys = {};
const pressed = {};
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyZ: 'jump',
  Enter: 'confirm', KeyE: 'confirm', Escape: 'back', KeyP: 'back', ArrowDown: 'down', KeyS: 'down',
};
function press(k) { if (!keys[k]) pressed[k] = true; keys[k] = true; }
function release(k) { keys[k] = false; }
addEventListener('keydown', (e) => {
  const k = KEYMAP[e.code];
  if (!k) return;
  e.preventDefault();
  press(k);
  audio.unlock();
});
addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k) release(k); });
document.querySelectorAll('[data-key]').forEach((b) => {
  const k = b.dataset.key;
  const on = (e) => { e.preventDefault(); press(k); audio.unlock(); };
  const off = (e) => { e.preventDefault(); release(k); };
  b.addEventListener('pointerdown', on);
  b.addEventListener('pointerup', off);
  b.addEventListener('pointerleave', off);
  b.addEventListener('pointercancel', off);
});

/* ---------- audio ---------- */
const audio = (() => {
  let ac = null;
  let muted = false;
  const unlock = () => {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
  };
  const tone = (f, d, type = 'square', vol = 0.05, slide = 0) => {
    if (!ac || muted) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, ac.currentTime);
    if (slide) o.frequency.linearRampToValueAtTime(f + slide, ac.currentTime + d);
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + d);
  };
  return {
    unlock,
    toggle: () => { muted = !muted; return muted; },
    jump: () => tone(330, 0.15, 'square', 0.05, 250),
    coin: () => { tone(988, 0.08); setTimeout(() => tone(1319, 0.18), 70); },
    stomp: () => tone(200, 0.12, 'triangle', 0.08, -120),
    bump: () => tone(130, 0.08, 'square', 0.06),
    lesson: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'triangle', 0.07), i * 90)),
    die: () => tone(400, 0.5, 'sawtooth', 0.06, -330),
    win: () => [523, 587, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'square', 0.05), i * 110)),
  };
})();

/* ---------- state ---------- */
let state = 'title';
let menuIndex = 0;
let level = null;
let player = null;
let enemies = [];
let particles = [];
let popups = [];
let camX = 0;
let card = null;
let tick = 0;
let currentDef = null;
let run = null;
let lessonsFound = 0;

const solidCh = new Set(['#', 'B', '?', 'Q']);

function startLevel(idx) {
  currentDef = LEVELS[idx];
  const built = buildLevel(currentDef);
  level = { width: built.width, tiles: built.rows.map((r) => r.split('')), lessonIdx: 0 };
  enemies = [];
  particles = [];
  popups = [];
  lessonsFound = 0;
  run = { coins: 0, bugs: 0, deaths: 0, score: 0, time: 0 };
  let start = { x: 64, y: 300 };
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < level.width; x++) {
      const c = level.tiles[y][x];
      if (c === 'P') { start = { x: x * TILE + 4, y: y * TILE }; level.tiles[y][x] = ' '; }
      if (c === 'E') { enemies.push({ x: x * TILE + 2, y: y * TILE + 4, w: 28, h: 28, vx: -0.9, vy: 0, alive: true, squash: 0 }); level.tiles[y][x] = ' '; }
    }
  }
  level.start = start;
  respawn();
  card = {
    title: `World ${currentDef.id}: ${currentDef.phase}`,
    body: currentDef.goal,
    footer: 'Collect coins, hit ? blocks to learn, squash bugs, reach the flag!',
    next: 'play',
  };
  state = 'card';
}

function respawn() {
  player = { x: level.start.x, y: level.start.y, w: 24, h: 30, vx: 0, vy: 0, onGround: false, face: 1, coyote: 0, buffer: 0, inv: 90, dead: false, deadT: 0 };
  camX = 0;
}

const tileAt = (tx, ty) => (ty < 0 ? ' ' : ty >= ROWS ? ' ' : tx < 0 ? '#' : tx >= level.width ? '#' : level.tiles[ty][tx]);
const isSolid = (tx, ty) => solidCh.has(tileAt(tx, ty));

function moveBody(b, onHitBelow) {
  b.x += b.vx;
  let x0 = Math.floor(b.x / TILE), x1 = Math.floor((b.x + b.w - 0.01) / TILE);
  let y0 = Math.floor(b.y / TILE), y1 = Math.floor((b.y + b.h - 0.01) / TILE);
  b.hitWall = false;
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (!isSolid(tx, ty)) continue;
      b.hitWall = true;
      b.x = b.vx > 0 ? tx * TILE - b.w : (tx + 1) * TILE;
      x0 =  Math.floor(b.x / TILE); x1 = Math.floor((b.x + b.w - 0.01) / TILE);
    }
  }
  b.y += b.vy;
  x0 = Math.floor(b.x / TILE); x1 = Math.floor((b.x + b.w - 0.01) / TILE);
  y0 = Math.floor(b.y / TILE); y1 = Math.floor((b.y + b.h - 0.01) / TILE);
  b.onGround = false;
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (!isSolid(tx, ty)) continue;
      if (b.vy > 0) { b.y = ty * TILE - b.h; b.vy = 0; b.onGround = true; }
      else if (b.vy < 0) { b.y = (ty + 1) * TILE; b.vy = 0.5; if (onHitBelow) onHitBelow(tx, ty); }
      y0 = Math.floor(b.y / TILE); y1 = Math.floor((b.y + b.h - 0.01) / TILE);
    }
  }
}

function burst(x, y, color, n = 8) {
  for (let i = 0; i < n; i++) particles.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 5 - 1, life: 30 + Math.random() * 20, color });
}
function popup(x, y, text) { popups.push({ x, y, text, life: 50 }); }

function addScore(n) { run.score += n; }

function hitBlock(tx, ty) {
  const c = tileAt(tx, ty);
  if (c === '?') {
    level.tiles[ty][tx] = 'Q';
    const lesson = currentDef.lessons[level.lessonIdx++];
    lessonsFound++;
    addScore(500);
    audio.lesson();
    burst(tx * TILE + 16, ty * TILE, currentDef.theme.accent, 14);
    if (lesson) card = { title: `💡 ${lesson.title}`, body: lesson.text, footer: `Lesson ${lessonsFound} of ${currentDef.lessons.length}`, next: 'play' };
    if (lesson) state = 'card';
  } else if (c === 'B') {
    audio.bump();
    burst(tx * TILE + 16, ty * TILE + 16, '#b5651d', 6);
  }
}

function die() {
  if (player.dead) return;
  player.dead = true;
  player.vy = -9;
  player.deadT = 0;
  run.deaths++;
  audio.die();
}

function finishLevel() {
  audio.win();
  const prev = save.done[currentDef.id];
  const best = Math.max(prev ? prev.score : 0, run.score);
  save.done[currentDef.id] = { score: best };
  persist();
  state = 'summary';
}

function updatePlay() {
  run.time++;
  const p = player;
  if (pressed.back) { state = 'paused'; return; }

  if (p.dead) {
    p.deadT++;
    p.vy = Math.min(p.vy + GRAVITY, MAX_FALL);
    p.y += p.vy;
    if (p.deadT > 70) respawn();
    return;
  }

  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const accel = p.onGround ? 0.6 : 0.4;
  if (dir) { p.vx += dir * accel; p.face = dir; } else p.vx *= p.onGround ? 0.78 : 0.95;
  p.vx = Math.max(-RUN, Math.min(RUN, p.vx));
  if (Math.abs(p.vx) < 0.05) p.vx = 0;

  p.coyote = p.onGround ? 6 : p.coyote - 1;
  p.buffer = pressed.jump ? 7 : p.buffer - 1;
  if (p.buffer > 0 && p.coyote > 0) {
    p.vy = JUMP; p.coyote = 0; p.buffer = 0; p.onGround = false;
    audio.jump();
  }
  if (!keys.jump && p.vy < -3.5) p.vy = -3.5;
  p.vy = Math.min(p.vy + GRAVITY, MAX_FALL);
  if (p.inv > 0) p.inv--;

  moveBody(p, hitBlock);
  if (p.hitWall) p.vx = 0;
  if (state !== 'play') return;

  const cx0 = Math.floor(p.x / TILE), cx1 = Math.floor((p.x + p.w) / TILE);
  const cy0 = Math.floor(p.y / TILE), cy1 = Math.floor((p.y + p.h - 1) / TILE);
  for (let ty = cy0; ty <= cy1; ty++) {
    for (let tx = cx0; tx <= cx1; tx++) {
      const c = tileAt(tx, ty);
      if (c === 'c') {
        level.tiles[ty][tx] = ' ';
        run.coins++; addScore(100);
        audio.coin();
        popup(tx * TILE, ty * TILE, '+100');
      } else if (c === '^') {
        const sx = tx * TILE + 4, sy = ty * TILE + 14;
        if (p.x + p.w > sx && p.x < sx + 24 && p.y + p.h > sy) { die(); return; }
      } else if (c === 'F') { finishLevel(); return; }
    }
  }
  if (p.y > H + 60) die();

  for (const e of enemies) {
    if (!e.alive) { e.squash++; continue; }
    e.vy = Math.min(e.vy + GRAVITY, MAX_FALL);
    const aheadX = e.vx > 0 ? e.x + e.w + 2 : e.x - 2;
    const footY = Math.floor((e.y + e.h + 2) / TILE);
    if (e.onGround && !isSolid(Math.floor(aheadX / TILE), footY)) e.vx = -e.vx;
    moveBody(e);
    if (e.hitWall) e.vx = -e.vx;
    if (e.y > H + 60) e.alive = false;
    if (Math.abs(e.x - p.x) < 40 && p.x + p.w > e.x && p.x < e.x + e.w && p.y + p.h > e.y && p.y < e.y + e.h) {
      if (p.vy > 0 && p.y + p.h - e.y < 18) {
        e.alive = false; e.squash = 0;
        p.vy = JUMP * 0.65;
        run.bugs++; addScore(200);
        audio.stomp();
        burst(e.x + 14, e.y + 14, '#e63946', 10);
        popup(e.x, e.y, 'Bug fixed! +200');
      } else if (p.inv <= 0) { die(); return; }
    }
  }

  camX += (Math.max(0, Math.min(p.x - W * 0.4, level.width * TILE - W)) - camX) * 0.12;
}

function updateFx() {
  for (const q of particles) { q.x += q.vx; q.y += q.vy; q.vy += 0.3; q.life--; }
  particles = particles.filter((q) => q.life > 0);
  for (const q of popups) { q.y -= 0.7; q.life--; }
  popups = popups.filter((q) => q.life > 0);
}

/* ---------- drawing ---------- */
function wrap(text, maxW, font) {
  ctx.font = font;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground(def) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, def.theme.sky[0]);
  g.addColorStop(1, def.theme.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.07;
  ctx.font = '220px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000';
  ctx.fillText(def.icon, W / 2 - (camX * 0.05) % 40, 270);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 7; i++) {
    const cx = ((i * 330 - camX * 0.25 + 4000) % (W + 300)) - 150;
    const cy = 60 + (i * 53) % 110;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, 7); ctx.arc(cx + 26, cy + 4, 20, 0, 7); ctx.arc(cx - 26, cy + 6, 18, 0, 7);
    ctx.fill();
  }
  ctx.fillStyle = def.theme.grass;
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 8; i++) {
    const hx = ((i * 260 - camX * 0.5 + 4000) % (W + 400)) - 200;
    ctx.beginPath();
    ctx.ellipse(hx, 13 * TILE, 150, 90 + (i % 3) * 25, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTile(c, x, y, tx, ty, def) {
  switch (c) {
    case '#': {
      ctx.fillStyle = def.theme.ground;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x + 4, y + 18, 8, 6); ctx.fillRect(x + 18, y + 8, 8, 6);
      if (!isSolid(tx, ty - 1)) { ctx.fillStyle = def.theme.grass; ctx.fillRect(x, y, TILE, 8); }
      break;
    }
    case 'B':
      ctx.fillStyle = '#c4682b'; ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = '#7a3d14'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
      ctx.beginPath(); ctx.moveTo(x, y + 16); ctx.lineTo(x + TILE, y + 16); ctx.moveTo(x + 16, y); ctx.lineTo(x + 16, y + 16); ctx.moveTo(x + 8, y + 16); ctx.lineTo(x + 8, y + TILE); ctx.moveTo(x + 24, y + 16); ctx.lineTo(x + 24, y + TILE); ctx.stroke();
      break;
    case '?': {
      const bob = Math.sin(tick / 8) * 1.5;
      ctx.fillStyle = def.theme.accent; ctx.fillRect(x, y + bob, TILE, TILE);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1 + bob, TILE - 2, TILE - 2);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center';
      ctx.fillText('?', x + 16, y + 24 + bob);
      break;
    }
    case 'Q':
      ctx.fillStyle = '#8d8d8d'; ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
      break;
    case 'c': {
      const w = Math.abs(Math.cos(tick / 12 + tx)) * 9 + 3;
      ctx.fillStyle = '#ffd60a'; ctx.beginPath(); ctx.ellipse(x + 16, y + 16, w, 11, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2; ctx.stroke();
      break;
    }
    case '^':
      ctx.fillStyle = '#d9d9d9';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + i * 10 + 1, y + TILE); ctx.lineTo(x + i * 10 + 6, y + 14); ctx.lineTo(x + i * 10 + 11, y + TILE); ctx.fill(); }
      break;
    case 'F': {
      ctx.fillStyle = '#eee'; ctx.fillRect(x + 14, y, 4, TILE);
      if (!(tileAt(tx, ty - 1) === 'F')) {
        ctx.fillStyle = '#ffd60a'; ctx.beginPath(); ctx.arc(x + 16, y, 6, 0, 7); ctx.fill();
        ctx.fillStyle = '#06d6a0';
        ctx.beginPath(); ctx.moveTo(x + 18, y + 2); ctx.lineTo(x + 18 + 30 + Math.sin(tick / 8) * 3, y + 14); ctx.lineTo(x + 18, y + 26); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left'; ctx.fillText('v1', x + 21, y + 18);
      }
      break;
    }
    default:
  }
}

function drawPlayer() {
  const p = player;
  if (p.inv > 0 && !p.dead && Math.floor(p.inv / 4) % 2) return;
  const x = Math.round(p.x - camX), y = Math.round(p.y);
  ctx.save();
  ctx.translate(x + p.w / 2, y);
  ctx.scale(p.face, 1);
  if (p.dead) ctx.rotate(p.deadT / 8);
  const step = p.onGround && Math.abs(p.vx) > 0.5 ? Math.sin(tick / 2.5) * 4 : 0;
  ctx.fillStyle = '#1d3557'; ctx.fillRect(-9 + step, 22, 8, 8); ctx.fillRect(1 - step, 22, 8, 8);
  ctx.fillStyle = '#7b2cbf'; rrect(-12, 10, 24, 15, 4); ctx.fill();
  ctx.fillStyle = '#ffcb9a'; rrect(-10, -2, 20, 15, 5); ctx.fill();
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(-11, -4, 22, 6);
  ctx.fillStyle = '#111'; ctx.fillRect(3, 4, 3, 4);
  ctx.fillStyle = '#9ad1ff'; ctx.fillRect(-8, 12, 16, 7);
  ctx.fillStyle = '#073b4c'; ctx.fillRect(-6, 13, 12, 4);
  ctx.restore();
}

function drawEnemy(e) {
  const x = Math.round(e.x - camX), y = Math.round(e.y);
  if (x < -40 || x > W + 40) return;
  if (!e.alive) {
    if (e.squash < 25) { ctx.fillStyle = '#c1121f'; ctx.fillRect(x, y + 22, 28, 6); }
    return;
  }
  const leg = Math.sin(tick / 4) * 3;
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ly = y + 14 + i * 5;
    ctx.beginPath(); ctx.moveTo(x + 4, ly); ctx.lineTo(x - 3, ly + leg * (i % 2 ? 1 : -1)); ctx.moveTo(x + 24, ly); ctx.lineTo(x + 31, ly - leg * (i % 2 ? 1 : -1)); ctx.stroke();
  }
  ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.ellipse(x + 14, y + 17, 13, 11, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#9d0208'; ctx.beginPath(); ctx.arc(x + 14, y + 11, 2.5, 0, 7); ctx.arc(x + 8, y + 17, 2.5, 0, 7); ctx.arc(x + 20, y + 17, 2.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(x + 6, y + 6, 6, 6); ctx.fillRect(x + 16, y + 6, 6, 6);
  ctx.fillStyle = '#000'; ctx.fillRect(x + 8 + (e.vx > 0 ? 2 : 0), y + 8, 3, 3); ctx.fillRect(x + 18 + (e.vx > 0 ? 2 : 0), y + 8, 3, 3);
}

function drawHud() {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, 34);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
  ctx.fillText(`${currentDef.icon} World ${currentDef.id}: ${currentDef.phase}`, 12, 22);
  ctx.textAlign = 'right';
  ctx.fillText(`🪙 ${run.coins}   🐛 ${run.bugs}   💡 ${lessonsFound}/${currentDef.lessons.length}   ⭐ ${run.score}`, W - 12, 22);
}

function drawLevel() {
  drawBackground(currentDef);
  const t0 = Math.floor(camX / TILE), t1 = t0 + Math.ceil(W / TILE) + 1;
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = t0; tx <= t1; tx++) {
      const c = tileAt(tx, ty);
      if (c !== ' ') drawTile(c, tx * TILE - Math.round(camX), ty * TILE, tx, ty, currentDef);
    }
  }
  enemies.forEach(drawEnemy);
  drawPlayer();
  for (const q of particles) { ctx.fillStyle = q.color; ctx.fillRect(q.x - camX, q.y, 4, 4); }
  ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
  for (const q of popups) { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(q.text, q.x - camX, q.y); ctx.fillText(q.text, q.x - camX, q.y); }
  drawHud();
}

function panel(x, y, w, h) {
  ctx.fillStyle = 'rgba(10,12,30,0.92)'; rrect(x, y, w, h, 16); ctx.fill();
  ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 3; rrect(x, y, w, h, 16); ctx.stroke();
}

function drawCard() {
  const w = 700, x = (W - w) / 2;
  const lines = wrap(card.body, w - 70, '20px sans-serif');
  const h = 150 + lines.length * 28;
  const y = (H - h) / 2;
  panel(x, y, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 26px sans-serif';
  ctx.fillText(card.title, W / 2, y + 48);
  ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, W / 2, y + 90 + i * 28));
  ctx.fillStyle = '#9ad1ff'; ctx.font = '15px sans-serif';
  if (card.footer) ctx.fillText(card.footer, W / 2, y + h - 48);
  ctx.fillStyle = '#06d6a0'; ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Press Enter / tap to continue ▶', W / 2, y + h - 20);
}

function drawSummary() {
  const d = currentDef, s = d.summary;
  const x = 90, y = 40, w = W - 180, h = H - 80;
  panel(x, y, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#06d6a0'; ctx.font = 'bold 30px sans-serif';
  ctx.fillText(`🏁 World ${d.id} complete!`, W / 2, y + 48);
  ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`${d.icon} ${d.phase}`, W / 2, y + 82);
  ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif';
  ctx.fillText(`🪙 ${run.coins}   🐛 ${run.bugs} bugs squashed   💡 ${lessonsFound}/${d.lessons.length} lessons   💀 ${run.deaths}   ⭐ ${run.score}`, W / 2, y + 112);
  const col = (title, items, cx) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9ad1ff'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText(title, cx, y + 156);
    ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif';
    items.forEach((it, i) => ctx.fillText(`• ${it}`, cx, y + 186 + i * 26));
  };
  col('Deliverables', s.deliverables, x + 40);
  col('Common tools', s.tools, W / 2 + 10);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffb703'; ctx.font = 'italic 16px sans-serif';
  wrap(`⚠ ${s.risk}`, w - 80, 'italic 16px sans-serif').forEach((l, i) => ctx.fillText(l, W / 2, y + 310 + i * 22));
  ctx.fillStyle = '#06d6a0'; ctx.font = 'bold 17px sans-serif';
  const last = d.id === LEVELS.length;
  ctx.fillText(last ? 'Enter: finish the journey ▶' : `Enter: next world ▶     Esc: world map`, W / 2, y + h - 22);
}

function drawTitle() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b1f4b'); g.addColorStop(1, '#5a3a9e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + ((i * 7) % 5) / 10})`; ctx.fillRect((i * 163) % W, (i * 97) % 300, 2, 2); }
  ctx.fillStyle = '#4cc24c'; ctx.fillRect(0, H - 64, W, 64);
  ctx.fillStyle = '#8a5a2b'; ctx.fillRect(0, H - 48, W, 48);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000'; ctx.font = 'bold 76px monospace'; ctx.fillText('DEV QUEST', W / 2 + 4, 154);
  ctx.fillStyle = '#ffd60a'; ctx.fillText('DEV QUEST', W / 2, 150);
  ctx.fillStyle = '#fff'; ctx.font = '22px sans-serif';
  ctx.fillText('A platformer through the entire Software Development Lifecycle', W / 2, 200);
  ctx.fillStyle = '#9ad1ff'; ctx.font = '17px sans-serif';
  ctx.fillText('12 worlds  ·  Requirements → Design → Build → Test → Ship → Support → Retire', W / 2, 232);
  const bob = Math.sin(tick / 10) * 4;
  player = player || { x: 0, y: 0, w: 24, h: 30, face: 1, onGround: true, vx: 0, inv: 0, dead: false, deadT: 0 };
  const sp = { ...player, x: W / 2 - 12 + camX, y: H - 94 + bob, face: 1, onGround: false, inv: 0, dead: false };
  const keep = player; player = sp; drawPlayer(); player = keep;
  if (Math.floor(tick / 30) % 2 === 0) { ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('Press Enter or tap to start', W / 2, 330); }
  ctx.fillStyle = '#c7c7e8'; ctx.font = '15px sans-serif';
  ctx.fillText('← → / A D move   ·   ↑ / W / Space jump   ·   Esc pause   ·   M mute', W / 2, 368);
}

const MENU_COLS = 4;
function menuRects() {
  const rects = [];
  const bw = 200, bh = 90, gx = 24, gy = 20;
  const x0 = (W - (MENU_COLS * bw + (MENU_COLS - 1) * gx)) / 2, y0 = 100;
  LEVELS.forEach((_, i) => rects.push({ x: x0 + (i % MENU_COLS) * (bw + gx), y: y0 + Math.floor(i / MENU_COLS) * (bh + gy), w: bw, h: bh }));
  return rects;
}

function drawMenu() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b1f4b'); g.addColorStop(1, '#3d2c8d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 34px sans-serif';
  ctx.fillText('World Map: The SDLC Journey', W / 2, 60);
  ctx.fillStyle = '#c7c7e8'; ctx.font = '15px sans-serif';
  ctx.fillText('Pick a world · arrows + Enter, or click / tap', W / 2, 84);
  menuRects().forEach((r, i) => {
    const d = LEVELS[i], done = save.done[d.id], sel = i === menuIndex;
    ctx.fillStyle = sel ? d.theme.accent : 'rgba(255,255,255,0.1)';
    rrect(r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.strokeStyle = sel ? '#fff' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = sel ? 4 : 2; rrect(r.x, r.y, r.w, r.h, 12); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = sel ? '#111' : '#fff'; ctx.font = 'bold 30px sans-serif';
    ctx.fillText(d.icon, r.x + 12, r.y + 48);
    ctx.font = 'bold 14px sans-serif'; ctx.fillText(`World ${d.id}`, r.x + 58, r.y + 30);
    wrap(d.phase, r.w - 70, 'bold 14px sans-serif').slice(0, 2).forEach((l, k) => ctx.fillText(l, r.x + 58, r.y + 50 + k * 17));
    ctx.font = '13px sans-serif';
    ctx.fillText(done ? `✅ best ${done.score}` : 'not completed', r.x + 12, r.y + r.h - 10);
  });
  const total = LEVELS.filter((l) => save.done[l.id]).length;
  ctx.textAlign = 'center'; ctx.fillStyle = '#9ad1ff'; ctx.font = '16px sans-serif';
  ctx.fillText(`Progress: ${total}/${LEVELS.length} worlds complete`, W / 2, H - 30);
}

function drawEnding() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#ffe066'); g.addColorStop(1, '#ff9e7d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = ['#e63946', '#06d6a0', '#4361ee', '#ffd60a'][i % 4];
    ctx.fillRect((i * 97 + tick * (1 + (i % 3))) % W, (i * 53 + tick * 2) % H, 8, 8);
  }
  panel(120, 60, W - 240, H - 120);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 40px sans-serif';
  ctx.fillText('🎉 You shipped it!', W / 2, 130);
  ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
  [
    'You walked the full lifecycle:',
    'Requirements → Analysis → Planning → Design → Development →',
    'Review & CI → Testing → Security → Deployment → Operations →',
    'Maintenance → Evolution. And then the loop begins again.',
  ].forEach((l, i) => ctx.fillText(l, W / 2, 190 + i * 32));
  ctx.fillStyle = '#9ad1ff'; ctx.font = '17px sans-serif';
  ctx.fillText('Thanks for playing! Built by Brian Dol  ·  github.com/Brian-Dol', W / 2, 350);
  ctx.fillStyle = '#06d6a0'; ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Enter: back to world map', W / 2, 410);
}

function drawPaused() {
  drawLevel();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 44px sans-serif';
  ctx.fillText('⏸ Paused', W / 2, H / 2 - 20);
  ctx.font = '20px sans-serif'; ctx.fillStyle = '#9ad1ff';
  ctx.fillText('Esc: resume   ·   Enter: world map   ·   M: mute', W / 2, H / 2 + 24);
}

/* ---------- main loop ---------- */
function step() {
  tick++;
  switch (state) {
    case 'title':
      if (pressed.confirm || pressed.jump) { state = 'menu'; }
      break;
    case 'menu':
      if (pressed.right) menuIndex = Math.min(LEVELS.length - 1, menuIndex + 1);
      if (pressed.left) menuIndex = Math.max(0, menuIndex - 1);
      if (pressed.down) menuIndex = Math.min(LEVELS.length - 1, menuIndex + MENU_COLS);
      if (pressed.jump && !pressed.confirm) menuIndex = Math.max(0, menuIndex - MENU_COLS);
      if (pressed.confirm) startLevel(menuIndex);
      break;
    case 'card':
      if (pressed.confirm || pressed.jump) state = card.next;
      break;
    case 'play':
      updatePlay();
      updateFx();
      break;
    case 'paused':
      if (pressed.back) state = 'play';
      if (pressed.confirm) state = 'menu';
      break;
    case 'summary':
      if (pressed.back) state = 'menu';
      if (pressed.confirm) {
        if (currentDef.id === LEVELS.length) state = 'ending';
        else { menuIndex = currentDef.id; startLevel(menuIndex); }
      }
      break;
    case 'ending':
      if (pressed.confirm) state = 'menu';
      break;
    default:
  }
  for (const k in pressed) delete pressed[k];
}

function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  switch (state) {
    case 'title': drawTitle(); break;
    case 'menu': drawMenu(); break;
    case 'play': drawLevel(); break;
    case 'card': drawLevel(); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H); drawCard(); break;
    case 'paused': drawPaused(); break;
    case 'summary': drawLevel(); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H); drawSummary(); break;
    case 'ending': drawEnding(); break;
    default:
  }
}

canvas.addEventListener('pointerdown', (e) => {
  audio.unlock();
  const r = canvas.getBoundingClientRect();
  const mx = ((e.clientX - r.left) / r.width) * W, my = ((e.clientY - r.top) / r.height) * H;
  if (state === 'menu') {
    menuRects().forEach((b, i) => {
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) { menuIndex = i; pressed.confirm = true; }
    });
  } else if (['title', 'card', 'summary', 'ending'].includes(state)) pressed.confirm = true;
  else if (state === 'paused') pressed.back = true;
});

addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') { const m = audio.toggle(); const b = document.getElementById('mute'); if (b) b.textContent = m ? '🔇' : '🔊'; }
});
const muteBtn = document.getElementById('mute');
if (muteBtn) muteBtn.addEventListener('click', () => { muteBtn.textContent = audio.toggle() ? '🔇' : '🔊'; });
const pauseBtn = document.getElementById('pause');
if (pauseBtn) pauseBtn.addEventListener('click', () => { pressed.back = true; });

// Fixed 60 Hz timestep regardless of display refresh rate.
let last = performance.now();
let acc = 0;
function frame(now) {
  acc += Math.min(100, now - last);
  last = now;
  while (acc >= 1000 / 60) { step(); acc -= 1000 / 60; }
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.__devquest = {
  get state() { return state; },
  get player() { return player; },
  get level() { return level; },
  get enemies() { return enemies; },
  get run() { return run; },
  startLevel,
  step,
  LEVELS,
};
