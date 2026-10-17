/**
 * Logged-in user account modal.
 * Defines: openAccountModal(), saveMyAccount()
 */
function openAccountModal(){
  if(!data.currentUser) return;
  $('#accUsername').value=data.currentUser.username||'';
  $('#accName').value=data.currentUser.name||'';
  $('#accPassword').value='';
  $('#accPassword2').value='';
  $('#accountModal').classList.add('active');
}

function saveMyAccount(){
  if(!data.currentUser) return;
  var n=$('#accName').value.trim();
  var p=$('#accPassword').value;
  var p2=$('#accPassword2').value;
  if(!n){ showToast('Name is required','error'); return; }
  if(p && p!==p2){ showToast('Passwords do not match','error'); return; }
  var idx=data.users.findIndex(function(x){return x.username===data.currentUser.username;});
  if(idx<0){ showToast('Account not found','error'); return; }
  data.users[idx].name=n;
  data.currentUser.name=n;
  if(p){
    data.users[idx].password=p;
    data.currentUser.password=p;
  }
  saveData();
  if($('#userName')) $('#userName').textContent=n;
  closeModal('accountModal');
  showToast('Account updated');
}
