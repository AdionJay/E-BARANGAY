/**
 * Font Awesome icon picked for each document type.
 * Defines: getDocTypeIcon()
 */
function getDocTypeIcon(name){
  var n = String(name || '').toLowerCase();
  if(/clearance/.test(n)) return 'fa-id-card';
  if(/indigency|low income/.test(n)) return 'fa-hand-holding-heart';
  if(/residency/.test(n)) return 'fa-house-user';
  if(/certification/.test(n) && !/good moral/.test(n)) return 'fa-stamp';
  if(/business|permit/.test(n)) return 'fa-store';
  if(/blotter|incident/.test(n)) return 'fa-file-circle-exclamation';
  if(/good moral/.test(n)) return 'fa-award';
  if(/solo parent/.test(n)) return 'fa-people-roof';
  if(/endorsement/.test(n)) return 'fa-file-signature';
  if(/pending case|no pending/.test(n)) return 'fa-scale-balanced';
  if(/service/.test(n)) return 'fa-screwdriver-wrench';
  return 'fa-file-lines';
}

try { window.getDocTypeIcon = getDocTypeIcon; } catch(e){}
