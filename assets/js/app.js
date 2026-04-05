// SoulPlay — app.js
// More logic coming in Step 4
console.log('SoulPlay loaded 🎸');

// ============================================================
// SoulPlay — App Controller
// ============================================================

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initVU();
  loadUserInfo();
  document.getElementById('lyricsInput').focus();
});

// ── LYRICS ENGINE ────────────────────────────────────────────
const input   = document.getElementById('lyricsInput');
const display = document.getElementById('lyricsDisplay');

let keysHit = 0;
const CHORD_EVERY = 7;

function updateDisplay(text) {
  if (!text.trim()) {
    display.innerHTML = `
      <span class="ld-placeholder">
        Start typing your lyrics...<br/>
        <small>every key plays a note ♪</small>
      </span>`;
    return;
  }
  const words = text.split(/(\s+)/);
  let html = '';
  words.forEach(w => {
    if (w.trim()) {
      html += `<span class="w-played">${w}</span>`;
    } else {
      html += w;
    }
  });
  html += '<span class="ld-cursor"></span>';
  display.innerHTML = html;
  display.scrollTop = display.scrollHeight;
}

input.addEventListener('keydown', e => {
  initAudio();

  if (e.key === ' ') {
    playStrum();
    return;
  }
  if (e.key === 'Enter') {
    playResolve();
    return;
  }
  if (e.key === 'Backspace') {
    playMute();
    return;
  }
  if (e.key.length === 1) {
    keysHit++;
    if (keysHit >= CHORD_EVERY) {
      chordIdx = (chordIdx + 1) % PROG.length;
      keysHit = 0;
    }
    playNote();
  }
});

input.addEventListener('input', () => {
  updateDisplay(input.value);
});

// ── UTILS ────────────────────────────────────────────────────
function clearLyrics() {
  input.value = '';
  updateDisplay('');
  chordIdx = 0;
  pickIdx  = 0;
  keysHit  = 0;
}

function saveLyrics() {
  const text = input.value.trim();
  if (!text) return;
  const blob = new Blob([text], {type:'text/plain'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'soulplay-lyrics.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function loadUserInfo() {
  // Will be replaced by Firebase in Step 5
  const user = JSON.parse(
    localStorage.getItem('soulplay_user') || 'null');
  const el = document.getElementById('userInitial');
  if (el && user && user.name) {
    el.textContent = user.name.charAt(0).toUpperCase();
  }
}

function toggleUserMenu() {
  document.getElementById('userMenu')
    .classList.toggle('open');
}

// Close menu on outside click
document.addEventListener('click', e => {
  const avatar = document.querySelector('.user-avatar');
  const menu   = document.getElementById('userMenu');
  if (menu && avatar && !avatar.contains(e.target)) {
    menu.classList.remove('open');
  }
});