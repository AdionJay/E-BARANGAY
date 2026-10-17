/**
 * Resident photo / avatar HTML.
 * Defines: residentPhotoHtml()
 */
function residentPhotoHtml(r, sizeClass){
  sizeClass = sizeClass || '';
  var full = (((r && r.firstName)||'')+' '+((r && r.lastName)||'')).replace(/\s+/g,' ').trim() || '?';
  var initial = full.charAt(0).toUpperCase();
  if(r && r.profilePic){
    return '<div class="res-photo '+sizeClass+' has-photo"><img src="'+r.profilePic+'" alt="'+full+'"></div>';
  }
  return '<div class="res-photo '+sizeClass+'">'+initial+'</div>';
}

try { window.residentPhotoHtml = residentPhotoHtml; } catch(e){}
