/**
 * Header / sidebar user avatar.
 * Defines: updateUserAvatar()
 */
function updateUserAvatar(){
  var elAv = document.getElementById('userAvatar');
  if(!elAv) return;
  var u = data && data.currentUser;
  if(!u){
    elAv.classList.remove('has-photo');
    elAv.style.backgroundImage = '';
    elAv.innerHTML = 'U';
    return;
  }
  var name = u.name || u.username || 'User';
  var pic = null;
  // Prefer resident profile picture
  if(u.residentId){
    var r = (data.residents || []).find(function(x){ return x.id === u.residentId; });
    if(r && r.profilePic) pic = r.profilePic;
  }
  if(!pic && u.avatar) pic = u.avatar;
  if(!pic && u.profilePic) pic = u.profilePic;

  if(pic){
    elAv.classList.add('has-photo');
    elAv.style.backgroundImage = '';
    elAv.innerHTML = '<img src="'+pic+'" alt="Avatar" class="user-avatar-img">';
  } else {
    elAv.classList.remove('has-photo');
    elAv.style.backgroundImage = '';
    elAv.innerHTML = String(name).charAt(0).toUpperCase();
  }
}

try { window.updateUserAvatar = updateUserAvatar; } catch(e){}
