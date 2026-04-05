// SoulPlay — auth.js
// Firebase will be connected in Step 5
// For now: frontend validation + UI feedback

function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email', 'error');
    return;
  }
  // Firebase login will go here in Step 5
  showToast('Firebase coming in Step 5!', 'info');
}

function handleSignup() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('signupEmail').value.trim();
  const password  = document.getElementById('signupPassword').value;
  const confirm   = document.getElementById('confirmPassword').value;
  const agreed    = document.getElementById('agreeTerms').checked;

  if (!firstName || !lastName || !email || !password || !confirm) {
    showToast('Please fill in all fields', 'error'); return;
  }
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email', 'error'); return;
  }
  if (password.length < 8) {
    showToast('Password must be at least 8 characters', 'error'); return;
  }
  if (password !== confirm) {
    showToast('Passwords do not match', 'error'); return;
  }
  if (!agreed) {
    showToast('Please agree to the Terms', 'error'); return;
  }
  // Firebase signup will go here in Step 5
  showToast('Firebase coming in Step 5!', 'info');
}

function handleGoogle() {
  showToast('Google auth coming in Step 5!', 'info');
}

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
  if (val.length >= 8)              score++;
  if (/[A-Z]/.test(val))            score++;
  if (/[0-9]/.test(val))            score++;
  if (/[^A-Za-z0-9]/.test(val))     score++;

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

// Toast notification
function showToast(msg, type='info') {
  const existing = document.querySelector('.sp-toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.className = 'sp-toast';
  t.textContent = msg;

  const colors = {
    error: '#EF4444',
    info:  '#C084FC',
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