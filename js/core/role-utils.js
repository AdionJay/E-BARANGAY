/**
 * Current-user role helpers.
 * Defines: role(), displayRole()
 */
function role(){ return data.currentUser?data.currentUser.role:''; }

function displayRole(r){
  r = r || role();
  if(r === 'Admin') return 'Captain';
  return r || '';
}
