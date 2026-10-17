/**
 * Load / save the app data in localStorage and make sure default users exist.
 * Defines: ensureDefaultUsers(), loadData(), saveData()
 */
function ensureDefaultUsers(d){
  if(!d) return d;
  if(!Array.isArray(d.users)) d.users = [];
  var defaults = [
    { username: 'admin', password: 'admin123', role: 'Admin', name: 'Administrator' },
    { username: 'captain', password: 'cap123', role: 'Admin', name: 'Hon. Amy A. Diwara' },
    { username: 'secretary', password: 'sec123', role: 'Secretary', name: 'Barangay Secretary' },
    { username: 'treasurer', password: 'treas123', role: 'Treasurer', name: 'Barangay Treasurer' }
  ];
  defaults.forEach(function(du){
    if(!d.users.find(function(u){ return u && u.username === du.username; })){
      d.users.push(JSON.parse(JSON.stringify(du)));
    }
  });
  if(!Array.isArray(d.residents)) d.residents = [];
  if(!Array.isArray(d.documents)) d.documents = [];
  if(!Array.isArray(d.payments)) d.payments = [];
  if(!Array.isArray(d.services)) d.services = [];
  if(!Array.isArray(d.notifications)) d.notifications = [];
  if(!Array.isArray(d.pendingRegistrations)) d.pendingRegistrations = [];
  if(!d.profiling) d.profiling = JSON.parse(JSON.stringify(defaultData.profiling));
  if(!d.gcashAccount) d.gcashAccount = JSON.parse(JSON.stringify(defaultData.gcashAccount));
  return d;
}

function loadData(){
  var s = null;
  try { s = localStorage.getItem(STORAGE_KEY); } catch(e){ s = null; }
  if(s){
    try{
      var d = JSON.parse(s);
      if(d && d.residents && Array.isArray(d.residents)){
        d.residents.forEach(function(r){
          if(r.ocrText===undefined) r.ocrText=null;
          if(r.ocrName===undefined) r.ocrName=null;
          if(r.idImage===undefined) r.idImage=null;
          if(r.profilePic===undefined) r.profilePic=null;
        });
      }
      try { ensureDocTypes(d); } catch(e){}
      return ensureDefaultUsers(d);
    }catch(e){ console.warn('loadData parse failed', e); }
  }
  return ensureDefaultUsers(JSON.parse(JSON.stringify(defaultData)));
}

function saveData(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch(e){ console.warn('saveData failed', e); }
}
