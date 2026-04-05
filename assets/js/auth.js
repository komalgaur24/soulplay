// SoulPlay — auth.js
// Validation helpers + UI utilities
// Firebase auth is handled directly in login.html and signup.html

function togglePass(id, btn) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.style.opacity = input.type === 'text' ? '1' : '0.5';
}

function checkStrength(val) {
  const fill  = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if (!fill) return;

  let score = 0;
  if (val.length >= 8)           score++;
  if (/[A-Z]/.test(val))         score++;
  if (/[0-9]/.test(val))         score++;
  if (/[^A-Za-z0-9]/.test(val))  score++;

  const levels = [
    { w:'0%',   c:'transparent', t:'' },
    { w:'25%',  c:'#EF4444',     t:'Weak' },
    { w:'50%',  c:'#F59E0B',     t:'Fair' },
    { w:'75%',  c:'#3B82F6',     t:'Good' },
    { w:'100%', c:'#34D399',     t:'Strong' },
  ];
  const l = levels[score];
  fill.style.width      = l.w;
  fill.style.background = l.c;
  label.textContent     = l.t;
  label.style.color     = l.c;
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function showToast(msg, type='info') {
  const existing = document.querySelector('.sp-toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.className = 'sp-toast';
  t.textContent = msg;

  const colors = {
    error:   '#EF4444',
    info:    '#C084FC',
    success: '#34D399'
  };
  Object.assign(t.style, {
    position:'fixed', bottom:'28px', left:'50%',
    transform:'translateX(-50%) translateY(10px)',
    background: colors[type] || colors.info,
    color:'#050508',
    fontFamily:"'DM Mono', monospace",
    fontSize:'11px', letterSpacing:'.14em',
    textTransform:'uppercase',
    padding:'12px 24px', borderRadius:'8px',
    zIndex:'9999', opacity:'0',
    transition:'opacity .25s, transform .25s',
    boxShadow:'0 8px 32px rgba(0,0,0,.4)',
    whiteSpace:'nowrap',
  });

  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}