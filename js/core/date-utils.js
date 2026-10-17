/**
 * Date and age helpers.
 * Defines: formatDate(), calcAge(), formatAge(), today()
 */
function formatDate(d){ if(!d)return '—'; return new Date(d).toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}); }

/** Compute age in years from YYYY-MM-DD birth date. Returns null if invalid. */
function calcAge(birthDate){
  if(!birthDate) return null;
  var d = new Date(birthDate);
  if(isNaN(d.getTime())) return null;
  var today = new Date();
  var age = today.getFullYear() - d.getFullYear();
  var m = today.getMonth() - d.getMonth();
  if(m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age < 0 ? null : age;
}

function formatAge(birthDate){
  var a = calcAge(birthDate);
  return a === null ? '—' : (a + ' yrs');
}

try { window.calcAge = calcAge; window.formatAge = formatAge; window.ensureHousehold = ensureHousehold; } catch(e){}

function today(){ return new Date().toISOString().slice(0,10); }
