/**
 * Switch between login, register and forgot-password forms.
 * Defines: showRegisterForm(), showLoginForm(), showForgotForm()
 */
function showRegisterForm(){
  var lf = $('#loginForm'), rf = $('#registerForm'), ff = $('#forgotForm');
  if(lf){ lf.style.display = 'none'; lf.style.visibility = 'hidden'; }
  if(ff){ ff.style.display = 'none'; ff.style.visibility = 'hidden'; }
  if(rf){ rf.style.display = 'block'; rf.style.visibility = 'visible'; rf.style.opacity = '1'; }
  var first = $('#regFirstName'); if(first) try{ first.focus(); }catch(e){}
}

function showLoginForm(){
  var lf = $('#loginForm'), rf = $('#registerForm'), ff = $('#forgotForm');
  if(rf){ rf.style.display = 'none'; rf.style.visibility = 'hidden'; }
  if(ff){ ff.style.display = 'none'; ff.style.visibility = 'hidden'; }
  if(lf){ lf.style.display = 'block'; lf.style.visibility = 'visible'; lf.style.opacity = '1'; }
  var user = $('#loginUsername'); if(user) try{ user.focus(); }catch(e){}
}

function showForgotForm(){
  var lf = $('#loginForm'), rf = $('#registerForm'), ff = $('#forgotForm');
  if(lf){ lf.style.display = 'none'; lf.style.visibility = 'hidden'; }
  if(rf){ rf.style.display = 'none'; rf.style.visibility = 'hidden'; }
  if(ff){
    ff.style.display = 'block';
    ff.style.visibility = 'visible';
    ff.style.opacity = '1';
  }
  // reset steps
  _forgotUser = null;
  var s1 = $('#forgotStep1'), s2 = $('#forgotStep2'), s3 = $('#forgotStep3');
  if(s1) s1.style.display = 'block';
  if(s2) s2.style.display = 'none';
  if(s3) s3.style.display = 'none';
  var hint = $('#forgotStepHint');
  if(hint) hint.textContent = 'Enter your username to reset your password.';
  var u = $('#forgotUsername'); if(u){ u.value = ($('#loginUsername') && $('#loginUsername').value) || ''; try{ u.focus(); }catch(e){} }
  var v = $('#forgotVerifyValue'); if(v) v.value = '';
  var p1 = $('#forgotNewPass'); if(p1) p1.value = '';
  var p2 = $('#forgotNewPass2'); if(p2) p2.value = '';
}
