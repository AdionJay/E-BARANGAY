/**
 * Keyboard + click reliability for the login and register forms.
 * Defines: bindAuthForms()
 */
function bindAuthForms(){
  if($('#loginPassword')) $('#loginPassword').addEventListener('keypress',function(e){ if(e.key==='Enter'){ e.preventDefault(); login(); } });
  if($('#loginUsername')) $('#loginUsername').addEventListener('keypress',function(e){ if(e.key==='Enter'){ e.preventDefault(); var p=$('#loginPassword'); if(p) p.focus(); } });
  var loginBtn = document.querySelector('#loginForm .btn.btn-primary, #loginForm button');
  if(loginBtn){
    loginBtn.setAttribute('type','button');
    loginBtn.addEventListener('click', function(e){ e.preventDefault(); login(); });
  }
  var regBtn = document.querySelector('#registerForm .btn.btn-primary, #registerForm button');
  if(regBtn){
    regBtn.setAttribute('type','button');
    regBtn.addEventListener('click', function(e){ e.preventDefault(); submitRegistration(); });
  }
}
