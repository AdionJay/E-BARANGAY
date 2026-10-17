/**
 * Forgot-password flow (find account, verify identity, reset).
 * Defines: _forgotUser, forgotFindAccount(), forgotVerifyIdentity(), forgotResetPassword()
 */
/* >>> TITLE: FORGOT PASSWORD FLOW <<< */
var _forgotUser = null;

function forgotFindAccount(){
  try {
    if(typeof data === 'undefined' || !data) data = loadData();
    ensureDefaultUsers(data);
  } catch(e){}
  var username = ($('#forgotUsername') && $('#forgotUsername').value || '').trim();
  if(!username){ showToast('Enter your username','error'); return; }
  var user = (data.users || []).find(function(u){
    return u && String(u.username).toLowerCase() === username.toLowerCase();
  });
  if(!user){
    showToast('Account not found. Check your username or register.','error');
    return;
  }
  _forgotUser = user;
  var s1 = $('#forgotStep1'), s2 = $('#forgotStep2'), s3 = $('#forgotStep3');
  if(s1) s1.style.display = 'none';
  if(s2) s2.style.display = 'block';
  if(s3) s3.style.display = 'none';

  var label = $('#forgotVerifyLabel');
  var input = $('#forgotVerifyValue');
  var hint = $('#forgotStepHint');
  var res = null;
  if(user.residentId){
    res = (data.residents || []).find(function(r){ return r.id === user.residentId; });
  }
  // Resident: verify with registered contact number
  if(res && res.contact){
    if(label) label.textContent = 'Enter your registered contact number';
    if(input){ input.placeholder = '09XXXXXXXXX'; input.value = ''; }
    if(hint) hint.textContent = "Verify your identity for account \""+user.username+"\".";
  } else {
    // Staff / no contact: verify with full registered name
    if(label) label.textContent = 'Enter your full registered name';
    if(input){ input.placeholder = user.name ? ('e.g. '+user.name) : 'Full name'; input.value = ''; }
    if(hint) hint.textContent = "Verify identity for \""+user.username+"\" ("+(user.role||"User")+").";
  }
  if(input) try{ input.focus(); }catch(e){}
}

function forgotVerifyIdentity(){
  if(!_forgotUser){ showForgotForm(); return; }
  var val = ($('#forgotVerifyValue') && $('#forgotVerifyValue').value || '').trim();
  if(!val){ showToast('Enter verification details','error'); return; }

  var user = _forgotUser;
  var res = null;
  if(user.residentId){
    res = (data.residents || []).find(function(r){ return r.id === user.residentId; });
  }

  var ok = false;
  if(res && res.contact){
    // normalize digits only
    var a = String(res.contact).replace(/\D/g,'');
    var b = String(val).replace(/\D/g,'');
    ok = a && b && (a === b || a.slice(-10) === b.slice(-10));
  } else {
    // compare name loosely
    var registered = String(user.name || '').toLowerCase().replace(/\s+/g,' ').trim();
    var typed = String(val).toLowerCase().replace(/\s+/g,' ').trim();
    ok = registered && typed && (registered === typed || registered.indexOf(typed) >= 0 || typed.indexOf(registered) >= 0);
  }

  if(!ok){
    showToast('Verification failed. Please try again or visit the barangay hall.','error');
    return;
  }

  var s1 = $('#forgotStep1'), s2 = $('#forgotStep2'), s3 = $('#forgotStep3');
  if(s1) s1.style.display = 'none';
  if(s2) s2.style.display = 'none';
  if(s3) s3.style.display = 'block';
  var hint = $('#forgotStepHint');
  if(hint) hint.textContent = "Create a new password for \""+user.username+"\".";
  var p1 = $('#forgotNewPass'); if(p1) try{ p1.focus(); }catch(e){}
  showToast('Identity verified. Set your new password.','success');
}

function forgotResetPassword(){
  if(!_forgotUser){ showForgotForm(); return; }
  var p1 = ($('#forgotNewPass') && $('#forgotNewPass').value) || '';
  var p2 = ($('#forgotNewPass2') && $('#forgotNewPass2').value) || '';
  if(p1.length < 6){ showToast('Password must be at least 6 characters','error'); return; }
  if(p1 !== p2){ showToast('Passwords do not match','error'); return; }

  var user = (data.users || []).find(function(u){
    return u && u.username === _forgotUser.username;
  });
  if(!user){ showToast('Account not found','error'); return; }
  user.password = p1;
  try { saveData(); } catch(e){}
  showToast('Password updated. You can log in now.','success');

  // Prefill login
  var lu = $('#loginUsername'); if(lu) lu.value = user.username;
  var lp = $('#loginPassword'); if(lp) lp.value = '';
  _forgotUser = null;
  showLoginForm();
  if(lp) try{ lp.focus(); }catch(e){}
}

try {
  window.showForgotForm = showForgotForm;
  window.forgotFindAccount = forgotFindAccount;
  window.forgotVerifyIdentity = forgotVerifyIdentity;
  window.forgotResetPassword = forgotResetPassword;
} catch(e){}
