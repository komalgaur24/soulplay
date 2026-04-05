// ============================================================
// SoulPlay — Audio Engine (Web Audio API)
// Fender Stratocaster simulation
// ============================================================

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;
let masterGain = null;
let reverbGain = null;
let delayNode  = null;

// ── CHORD FREQUENCIES ────────────────────────────────────────
const CHORDS = {
  G:  {
    I:  [196.00,246.94,293.66,392.00,493.88],
    IV: [174.61,220.00,261.63,349.23,440.00],
    V:  [146.83,196.00,246.94,293.66,392.00],
    vi: [164.81,196.00,246.94,329.63,392.00],
    riff:[196,220,246,261,293,329,349,392]
  },
  D:  {
    I:  [146.83,196.00,246.94,293.66,440.00],
    IV: [196.00,246.94,293.66,392.00,493.88],
    V:  [110.00,138.59,164.81,220.00,277.18],
    vi: [110.00,138.59,174.61,220.00,277.18],
    riff:[146,164,196,220,246,261,293]
  },
  A:  {
    I:  [110.00,138.59,164.81,220.00,277.18],
    IV: [146.83,196.00,246.94,293.66,440.00],
    V:  [123.47,164.81,196.00,246.94,329.63],
    vi: [116.54,146.83,185.00,220.00,277.18],
    riff:[110,123,138,146,164,185,196]
  },
  E:  {
    I:  [82.41,110.00,164.81,206.99,246.94],
    IV: [110.00,138.59,174.61,220.00,277.18],
    V:  [123.47,164.81,196.00,246.94,329.63],
    vi: [110.00,138.59,164.81,220.00,261.63],
    riff:[82,87,97,110,123,138,146]
  },
  C:  {
    I:  [130.81,164.81,196.00,261.63,329.63],
    IV: [174.61,220.00,261.63,349.23,440.00],
    V:  [146.83,196.00,246.94,293.66,392.00],
    vi: [110.00,138.59,164.81,220.00,261.63],
    riff:[130,146,164,174,196,220,246]
  },
  Am: {
    I:  [110.00,130.81,164.81,220.00,261.63],
    IV: [174.61,220.00,261.63,349.23,440.00],
    V:  [123.47,164.81,196.00,246.94,329.63],
    vi: [146.83,196.00,246.94,293.66,392.00],
    riff:[110,123,130,146,164,174,196]
  }
};

const CHORD_NAMES = {
  G:  {I:'G',  IV:'C',  V:'D',  vi:'Em'},
  D:  {I:'D',  IV:'G',  V:'A',  vi:'Bm'},
  A:  {I:'A',  IV:'D',  V:'E',  vi:'F#m'},
  E:  {I:'E',  IV:'A',  V:'B',  vi:'C#m'},
  C:  {I:'C',  IV:'F',  V:'G',  vi:'Am'},
  Am: {I:'Am', IV:'Dm', V:'E',  vi:'F'}
};

const PROG = ['I','I','IV','IV','V','V','vi','vi'];

// ── STATE ────────────────────────────────────────────────────
let currentKey     = 'G';
let currentTone    = 'clean';
let currentPattern = 'strum';
let currentBPM     = 90;
let currentVol     = 0.7;
let chordIdx       = 0;
let pickIdx        = 0;

// ── INIT ────────────────────────────────────────────────────
function initAudio() {
  if (ctx) return;
  ctx = new AudioCtx();

  masterGain = ctx.createGain();
  masterGain.gain.value = currentVol;

  // Reverb via delay feedback
  delayNode = ctx.createDelay(0.6);
  delayNode.delayTime.value = 0.15;

  const fbGain = ctx.createGain();
  fbGain.gain.value = 0.28;

  reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.3;

  delayNode.connect(fbGain);
  fbGain.connect(delayNode);
  delayNode.connect(reverbGain);
  reverbGain.connect(ctx.destination);

  masterGain.connect(delayNode);
  masterGain.connect(ctx.destination);
}

// ── SYNTH A NOTE ─────────────────────────────────────────────
function synthNote(freq, dur, tone) {
  if (!ctx) return;
  const osc    = ctx.createOscillator();
  const gain   = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';

  switch(tone) {
    case 'clean':
      osc.type = 'triangle';
      filter.frequency.value = 3400;
      filter.Q.value = 0.6;
      gain.gain.setValueAtTime(0.55, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001, ctx.currentTime + dur * 0.88);
      break;
    case 'crunch':
      osc.type = 'sawtooth';
      filter.frequency.value = 1600;
      filter.Q.value = 2.8;
      gain.gain.setValueAtTime(0.38, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001, ctx.currentTime + dur * 0.7);
      break;
    case 'blues':
      osc.type = 'square';
      filter.frequency.value = 2000;
      filter.Q.value = 1.8;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001, ctx.currentTime + dur * 1.1);
      break;
  }

  osc.frequency.value = freq;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

// ── PLAY PATTERNS ────────────────────────────────────────────
function playNote() {
  if (!ctx) initAudio();

  const degree = PROG[chordIdx % PROG.length];
  const freqs  = CHORDS[currentKey][degree];
  const name   = CHORD_NAMES[currentKey][degree];

  switch(currentPattern) {
    case 'strum':
      freqs.forEach((f,i) =>
        setTimeout(() => synthNote(f, 1.2, currentTone), i*16));
      vibrateAll();
      break;

    case 'pick': {
      const riff = CHORDS[currentKey].riff;
      const f = riff[pickIdx % riff.length];
      synthNote(f, 0.55, currentTone);
      vibrateString(pickIdx % 6);
      pickIdx++;
      break;
    }

    case 'arpeggio': {
      const f = freqs[pickIdx % freqs.length];
      synthNote(f, 0.7, currentTone);
      vibrateString(pickIdx % 6);
      pickIdx++;
      break;
    }

    case 'blues': {
      const blues = CHORDS[currentKey].riff;
      const f1 = blues[pickIdx % blues.length];
      const f2 = blues[(pickIdx+2) % blues.length];
      synthNote(f1, 0.5, 'blues');
      setTimeout(() => synthNote(f2, 0.5, 'blues'), 60);
      vibrateString(pickIdx % 6);
      pickIdx++;
      break;
    }
  }

  showChord(name);
  chordIdx = (chordIdx + 1) % PROG.length;
}

function playStrum() {
  if (!ctx) initAudio();
  const degree = PROG[chordIdx % PROG.length];
  const freqs  = CHORDS[currentKey][degree];
  const name   = CHORD_NAMES[currentKey][degree];
  freqs.forEach((f,i) =>
    setTimeout(() => synthNote(f, 1.5, currentTone), i*20));
  vibrateAll();
  showChord(name);
  pulseAllVU();
  chordIdx = (chordIdx + 1) % PROG.length;
}

function playResolve() {
  if (!ctx) initAudio();
  const freqs = CHORDS[currentKey]['I'];
  freqs.forEach((f,i) =>
    setTimeout(() => synthNote(f, 2.0, currentTone), i*28));
  vibrateAll();
  showChord(CHORD_NAMES[currentKey]['I']);
  pulseAllVU();
  chordIdx = 0;
}

function playMute() {
  if (!ctx) initAudio();
  // Percussive mute
  const buf  = ctx.createBuffer(1, ctx.sampleRate*0.06, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i=0; i<data.length; i++)
    data[i] = (Math.random()-0.5)*0.06;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.4, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.05);
  src.connect(g);
  g.connect(masterGain);
  src.start();
  vibrateString(Math.floor(Math.random()*6));
}

function playDemo() {
  if (!ctx) initAudio();
  const riff = CHORDS[currentKey].riff;
  const pattern = [0,2,4,2,5,4,2,0];
  pattern.forEach((idx,step) => {
    setTimeout(() => {
      synthNote(riff[idx % riff.length], 0.4, currentTone);
      vibrateString(idx % 6);
      pulseVU(idx % 6);
    }, step * (60000 / currentBPM / 2));
  });
}

// ── CONTROLS ────────────────────────────────────────────────
function setKey(k, btn) {
  currentKey = k; chordIdx = 0; pickIdx = 0;
  document.querySelectorAll('.ctrl-grid .ctrl-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function setPattern(p, btn) {
  currentPattern = p; pickIdx = 0;
  document.querySelectorAll('.ctrl-stack .ctrl-btn-lg')
    .forEach(b => {
      if(b.onclick.toString().includes('setPattern'))
        b.classList.remove('active');
    });
  btn.classList.add('active');
}

function setTone(t, btn) {
  currentTone = t;
  if(reverbGain)
    reverbGain.gain.value = t==='clean' ? 0.3 : 0.1;
  document.querySelectorAll('.ctrl-stack .ctrl-btn-lg')
    .forEach(b => {
      if(b.onclick.toString().includes('setTone'))
        b.classList.remove('active');
    });
  btn.classList.add('active');
}

function setBPM(v) {
  currentBPM = parseInt(v);
  const el = document.getElementById('bpmVal');
  if(el) el.textContent = v;
}

function setVolume(v) {
  currentVol = v / 100;
  if(masterGain) masterGain.gain.value = currentVol;
}

// ── VISUALS ──────────────────────────────────────────────────
function vibrateString(idx) {
  const el = document.getElementById('sv'+idx);
  if(!el) return;
  el.classList.remove('vib');
  void el.offsetWidth;
  el.classList.add('vib');
  setTimeout(() => el.classList.remove('vib'), 380);
  pulseVU(idx);
}

function vibrateAll() {
  for(let i=0; i<6; i++)
    setTimeout(() => vibrateString(i), i*18);
  // Guitar strum animation
  const g = document.getElementById('appGuitar');
  if(g){
    g.classList.remove('strum');
    void g.offsetWidth;
    g.classList.add('strum');
    setTimeout(() => g.classList.remove('strum'), 400);
  }
}

function showChord(name) {
  const el = document.getElementById('chordBadge');
  if(!el) return;
  el.textContent = name;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

// VU METER
const VU_COUNT = 40;
let vuBars = [];

function initVU() {
  const meter = document.getElementById('vuMeter');
  if(!meter) return;
  for(let i=0; i<VU_COUNT; i++){
    const b = document.createElement('div');
    b.className = 'vu-bar';
    meter.appendChild(b);
    vuBars.push(b);
  }
}

function pulseVU(stringIdx) {
  const center = Math.round((stringIdx/5)*(VU_COUNT-1));
  vuBars.forEach((b,i) => {
    const dist = Math.abs(i-center);
    const h = Math.max(4, 44 - dist*5 + Math.random()*8);
    b.style.height = h+'px';
    setTimeout(() => { b.style.height='4px'; }, 280+dist*18);
  });
}

function pulseAllVU() {
  vuBars.forEach(b => {
    const h = 12 + Math.random()*32;
    b.style.height = h+'px';
    setTimeout(() => { b.style.height='4px'; },
      280+Math.random()*180);
  });
}

// ── SKIN SWITCHER ────────────────────────────────────────────
const GUITAR_IMGS = {
  sunburst: 'assets/images/guitar-sunburst.png',
  arctic:   'assets/images/guitar-arctic.png',
  ebony:    'assets/images/guitar-ebony.png'
};

function setSkin(skin, btn) {
  document.body.setAttribute('data-skin', skin);
  document.querySelectorAll('.skin-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const img = document.getElementById('appGuitar');
  if(img) img.src = GUITAR_IMGS[skin];
}