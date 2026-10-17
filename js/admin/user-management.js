/**
 * Captain/Admin user accounts.
 * Defines: renderAdmin(), openUserModal(), editUser(), saveUser(), deleteUser()
 */
function renderAdmin(){
  // User Management: barangay officials only (Admin / Secretary / Treasurer) — not Residents
  var officials = (data.users || []).filter(function(u){
    var r = u.role || '';
    return r === 'Admin' || r === 'Secretary' || r === 'Treasurer' || r === 'Captain';
  });
  $('#usersTable').innerHTML = officials.map(function(u,i){
    var roleLabel = (u.role === 'Admin' || u.role === 'Captain') ? 'Captain / Admin' : u.role;
    var editBtn='<button class="btn btn-sm btn-outline" onclick="editUser(\''+u.username+'\')">Edit</button> ';
    var delBtn=(u.username!=='admin')?'<button class="btn btn-sm btn-danger" onclick="deleteUser(\''+u.username+'\')">Delete</button>':'';
    return '<tr><td>'+(i+1)+'</td><td>'+u.username+'</td><td>'+(u.name||'')+'</td><td><span class="badge badge-info">'+roleLabel+'</span></td><td>'+editBtn+delBtn+'</td></tr>';
  }).join('') || '<tr><td colspan="5" class="empty-state">No barangay officials yet</td></tr>';
  renderPendingRegistrations();
}

function openUserModal(){
  $('#userModalTitle').textContent='Add User';
  $('#userEditMode').value='0';
  $('#userOriginalUsername').value='';
  $('#umUsername').value=''; $('#umUsername').disabled=false;
  $('#umPassword').value=''; $('#umPassword').placeholder='Required for new user';
  $('#userPassHint').textContent='*';
  $('#umFullName').value='';
  $('#umRole').value='Admin'; $('#umRole').disabled=false;
  $('#userModal').classList.add('active');
}

function editUser(username){
  var u=data.users.find(function(x){return x.username===username;});
  if(!u){ showToast('User not found','error'); return; }
  $('#userModalTitle').textContent='Edit User';
  $('#userEditMode').value='1';
  $('#userOriginalUsername').value=u.username;
  $('#umUsername').value=u.username; $('#umUsername').disabled=true;
  $('#umPassword').value=''; $('#umPassword').placeholder='Leave blank to keep current password';
  $('#userPassHint').textContent='(optional)';
  $('#umFullName').value=u.name||'';
  $('#umRole').value=u.role||'Secretary';
  $('#umRole').disabled=(u.username==='admin');
  $('#userModal').classList.add('active');
}

function saveUser(){
  var mode=$('#userEditMode').value;
  var u=$('#umUsername').value.trim();
  var p=$('#umPassword').value;
  var n=$('#umFullName').value.trim();
  var r=$('#umRole').value;
  // Keep internal role as Admin (UI may say Captain)
  if(r==='Captain' || r==='Captain (System Admin)' || r==='Captain (Admin)') r='Admin';
  // User Management is for barangay officials only — Residents are managed under Resident Information
  if(r!=='Admin' && r!=='Secretary' && r!=='Treasurer'){
    showToast('User Management is for barangay officials only (Captain/Admin, Secretary, Treasurer)','error');
    return;
  }
  if(!u||!n){ showToast('Username and full name are required','error'); return; }
  if(mode==='1'){
    var orig=$('#userOriginalUsername').value;
    var idx=data.users.findIndex(function(x){return x.username===orig;});
    if(idx<0){ showToast('User not found','error'); return; }
    data.users[idx].name=n;
    if(p) data.users[idx].password=p;
    if(orig!=='admin') data.users[idx].role=r;
    if(data.currentUser && data.currentUser.username===orig){
      data.currentUser.name=n;
      if(p) data.currentUser.password=p;
      if(orig!=='admin') data.currentUser.role=data.users[idx].role;
      if($('#userName')) $('#userName').textContent=n;
      if($('#userRole')) $('#userRole').textContent=data.users[idx].role;
    }
    saveData(); closeModal('userModal'); showToast('User updated'); renderAdmin();
  } else {
    if(!p){ showToast('Password is required for new users','error'); return; }
    if(data.users.find(function(x){return x.username===u;})){ showToast('Username already exists','error'); return; }
    data.users.push({username:u,password:p,role:r,name:n});
    saveData(); closeModal('userModal'); showToast('User added'); renderAdmin();
  }
}

function deleteUser(username){
  openConfirmModal({
    title: 'Delete User',
    message: 'Delete user?',
    okLabel: 'Delete',
    variant: 'danger',
    onConfirm: function(){ data.users=data.users.filter(function(u){return u.username!==username;}); saveData(); showToast('Deleted'); renderAdmin(); 
    }
  });
}
