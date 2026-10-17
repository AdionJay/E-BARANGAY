/**
 * Logout and session cleanup.
 * Defines: logout()
 */
function logout(){
  try {
    // Instant UI switch first (avoid long freeze from large localStorage writes)
    if(data) data.currentUser = null;

    var appEl = document.getElementById('app');
    if(appEl){
      appEl.classList.remove('active');
      appEl.style.display = 'none';
    }
    try {
      if(document.body){
        document.body.classList.remove('in-app');
        document.body.classList.remove('login-open');
      }
    } catch(e){}

    // Show public site / home login immediately
    var ps = document.getElementById('publicSite');
    if(ps) ps.style.display = 'block';
    var ls = document.getElementById('loginScreen');
    if(ls){
      ls.style.display = 'flex';
      ls.style.visibility = 'visible';
    }
    try {
      if(typeof showPublicRoom === 'function') showPublicRoom('home');
      else if(typeof showPublicSite === 'function') showPublicSite();
    } catch(e){}

    var u = document.getElementById('loginUsername'); if(u) u.value = '';
    var p = document.getElementById('loginPassword'); if(p) p.value = '';
    var roleEl = document.getElementById('loginRole'); if(roleEl) roleEl.selectedIndex = 0;
    try { if(typeof onLoginRoleChange === 'function') onLoginRoleChange(); } catch(e){}
    try { showLoginForm(); } catch(e){}

    // Persist session clear in background (non-blocking)
    setTimeout(function(){
      try { saveData(); } catch(e){}
      try {
        if(typeof applyLoginTheme === 'function'){
          applyLoginTheme(localStorage.getItem('ebarangay_login_theme') || 'light');
        }
      } catch(e){}
    }, 0);
  } catch(err){ console.error(err); }
}

try { window.logout = logout; } catch(e){}
