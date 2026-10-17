/**
 * Login form handling and role selection.
 * Defines: LOGIN_ROLE_USER, onLoginRoleChange(), login()
 */
/* Staff role → default account username (password-only login) */
var LOGIN_ROLE_USER = {
  Secretary: 'secretary',
  Treasurer: 'treasurer',
  Admin: 'admin'
};

function onLoginRoleChange(){
  var roleEl = document.getElementById('loginRole');
  var userGroup = document.getElementById('loginUsernameGroup');
  var passGroup = document.getElementById('loginPasswordGroup');
  var userEl = document.getElementById('loginUsername');
  var passEl = document.getElementById('loginPassword');
  var role = roleEl ? String(roleEl.value || '') : '';

  if(!role){
    if(userGroup) userGroup.style.display = 'none';
    if(passGroup) passGroup.style.display = 'none';
    return;
  }

  if(role === 'Resident'){
    if(userGroup) userGroup.style.display = 'block';
    if(passGroup) passGroup.style.display = 'block';
    if(userEl){ userEl.value = ''; userEl.placeholder = 'Enter your username'; }
    if(passEl){ passEl.value = ''; passEl.placeholder = 'Enter your password'; }
    if(userEl) try{ userEl.focus(); }catch(e){}
  } else {
    // Staff: password only — username auto-filled from role
    if(userGroup) userGroup.style.display = 'none';
    if(passGroup) passGroup.style.display = 'block';
    if(userEl) userEl.value = LOGIN_ROLE_USER[role] || '';
    if(passEl){ passEl.value = ''; passEl.placeholder = 'Enter your password'; try{ passEl.focus(); }catch(e){} }
  }
}

try { window.onLoginRoleChange = onLoginRoleChange; } catch(e){}

function login(){
  try {
    var roleEl = document.getElementById('loginRole');
    var userEl = document.getElementById('loginUsername');
    var passEl = document.getElementById('loginPassword');
    if(!passEl){
      alert('Login form not found. Please refresh the page.');
      return;
    }
    var selectedRole = roleEl ? String(roleEl.value || '').trim() : '';
    var pass = String(passEl.value || '');
    if(!selectedRole){
      showToast('Please select your user role','error');
      return;
    }
    if(!pass){
      showToast('Enter your password','error');
      return;
    }

    // Resident needs username; staff username comes from role
    var user = '';
    if(selectedRole === 'Resident'){
      user = userEl ? String(userEl.value || '').trim() : '';
      if(!user){
        showToast('Enter your username','error');
        return;
      }
    } else {
      user = LOGIN_ROLE_USER[selectedRole] || '';
      // Also accept captain username for Admin role
      if(selectedRole === 'Admin') user = 'admin';
    }

    if(typeof data === 'undefined' || !data) data = loadData();
    ensureDefaultUsers(data);

    var found = data.users.find(function(u){
      return u && String(u.username).toLowerCase() === String(user).toLowerCase() && String(u.password) === pass;
    });
    // Admin role: try captain account as alternate
    if(!found && selectedRole === 'Admin'){
      found = data.users.find(function(u){
        return u && String(u.username).toLowerCase() === 'captain' && String(u.password) === pass;
      });
    }
    if(!found){
      showToast(selectedRole === 'Resident' ? 'Invalid username or password' : 'Invalid password for this role','error');
      return;
    }

    var accountRole = String(found.role || '');
    if(accountRole === 'Captain') accountRole = 'Admin';
    if(accountRole !== selectedRole){
      showToast('Selected role does not match this account.','error');
      return;
    }

    data.currentUser = found;
    saveData();
    showApp();
    var roleLabel = selectedRole === 'Admin' ? 'Captain / Administrator' : selectedRole;
    showToast('Welcome, ' + (found.name || found.username) + ' (' + roleLabel + ')!');
  } catch(err){
    console.error('login error', err);
    alert('Sign in error: ' + (err && err.message ? err.message : err));
  }
}

try {
  window.login = login;
  window.showRegisterForm = showRegisterForm;
  window.showLoginForm = showLoginForm;
  window.submitRegistration = submitRegistration;
} catch(e){}
