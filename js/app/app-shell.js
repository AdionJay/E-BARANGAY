/**
 * Show the app after login and apply role-based menu visibility.
 * Defines: showApp(), applyRoleVisibility(), showNav()
 */
function showApp(){
  try { forcePortalLightTheme(); } catch(e){}

  try {
    var ls = document.getElementById('loginScreen');
    var appEl = document.getElementById('app');
    if(ls){
      ls.style.display = 'none';
      ls.style.visibility = 'hidden';
    }
    if(appEl){
      appEl.classList.add('active');
      appEl.style.display = 'flex';
    }
    // Portals always light — strip any dark mode from document
    try {
      document.documentElement.removeAttribute('data-theme');
      if(document.body){
        document.body.removeAttribute('data-theme');
        document.body.classList.add('in-app', 'theme-light');
        var _ps=document.getElementById('publicSite'); if(_ps) _ps.style.display='none';
        document.body.classList.remove('theme-dark');
      }
    } catch(e){}
    var u = data && data.currentUser;
    if(!u){
      alert('No user session. Please sign in again.');
      return;
    }
    var name = u.name || u.username || 'User';
    var elName = document.getElementById('userName');
    var elRole = document.getElementById('userRole');
    var elAv = document.getElementById('userAvatar');
    if(elName) elName.textContent = name;
    if(elRole) elRole.textContent = displayRole(u.role);
    try { updateUserAvatar(); } catch(e){ if(elAv) elAv.textContent = String(name).charAt(0).toUpperCase(); }
    try { updateNotifBadge(); } catch(e){ console.warn(e); }
    try {
      applyRoleVisibility();
    } catch(e){
      console.warn('applyRoleVisibility', e);
    }
    // Guarantee a module is visible (blank content fix)
    try {
      var anyActive = document.querySelector('.module.active');
      if(!anyActive){
        var r = (data.currentUser && data.currentUser.role) || '';
        if(r === 'Resident') navigate('portal');
        else if(r === 'Secretary') navigate('secretary');
        else if(r === 'Treasurer') navigate('treasurer');
        else navigate('dashboard');
      }
    } catch(e3){
      try { navigate('dashboard'); } catch(e4){}
    }
  } catch(err){
    console.error('showApp error', err);
    alert('Could not open app: ' + (err && err.message ? err.message : err));
  }
}

try { window.showApp = showApp; } catch(e){}

function applyRoleVisibility(){
  var r=role();
  // Hide all role-specific nav first
  $$('.nav-admin-only, .nav-secretary-only, .nav-treasurer-only, .nav-captain-only, .nav-resident-only').forEach(function(el){ el.style.display='none'; });
  if(r==='Resident'){
    // Residents only: Portal, My Profile, My Requests, Notifications
    $$('.nav-resident-only').forEach(function(el){ el.style.display=''; });
    $$('.nav-link[data-module="notifications"]').forEach(function(l){
      if(l.closest('.nav-item')) l.closest('.nav-item').style.display='';
    });
    navigate('portal'); return;
  }
  // Officials never see Portal / My Profile
  if(r==='Admin'){
    $$('.nav-admin-only, .nav-secretary-only, .nav-treasurer-only').forEach(function(el){ el.style.display=''; });
    navigate('dashboard');
  } else if(r==='Secretary'){
    $$('.nav-secretary-only').forEach(function(el){ el.style.display=''; });
    $$('.nav-secretary-residents').forEach(function(el){ el.style.display=''; });
    // Separate dashboard: Secretary Module is their home (not shared Admin dashboard)
    showNav(['residents','documents','notifications','secretary']);
    // Hide generic dashboard nav for secretary
    $$('.nav-link[data-module="dashboard"]').forEach(function(l){ if(l.closest('.nav-item')) l.closest('.nav-item').style.display='none'; });
    navigate('secretary');
  } else if(r==='Treasurer'){
    $$('.nav-treasurer-only').forEach(function(el){ el.style.display=''; });
    // Separate dashboard: Treasurer Module is their home
    showNav(['payments','notifications','treasurer']);
    $$('.nav-link[data-module="dashboard"]').forEach(function(l){ if(l.closest('.nav-item')) l.closest('.nav-item').style.display='none'; });
    navigate('treasurer');
  }
  // Legacy: if any account still has role Captain, treat as Admin powers
  if(r==='Captain'){
    $$('.nav-admin-only, .nav-secretary-only, .nav-treasurer-only').forEach(function(el){ el.style.display=''; });
    navigate('dashboard');
  }
}

function showNav(mods){ mods.forEach(function(m){ var l=$('.nav-link[data-module="'+m+'"]'); if(l&&l.closest('.nav-item')) l.closest('.nav-item').style.display=''; }); }
