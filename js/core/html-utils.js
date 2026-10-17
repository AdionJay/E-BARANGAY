/**
 * HTML escaping helper.
 * Defines: escapeHtml()
 */
function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
