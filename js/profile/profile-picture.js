/**
 * Profile picture upload and compression.
 * Defines: uploadProfilePic(), compressImageDataUrl(), handleProfilePic()
 */
function uploadProfilePic(){ var i=$('#profilePicInput'); if(i) i.click(); }

function compressImageDataUrl(dataUrl, maxSize, quality, cb){
  try {
    var img = new Image();
    img.onload = function(){
      var w = img.width, h = img.height;
      var scale = 1;
      if(w > maxSize || h > maxSize){
        scale = maxSize / Math.max(w, h);
      }
      var canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      var out = canvas.toDataURL('image/jpeg', quality || 0.82);
      cb(out);
    };
    img.onerror = function(){ cb(dataUrl); };
    img.src = dataUrl;
  } catch(e){ cb(dataUrl); }
}

function handleProfilePic(e){
  var file=e.target.files&&e.target.files[0]; if(!file) return;
  if(!file.type.match(/^image\//)){ showToast('Select an image','error'); return; }
  e.target.value='';
  var reader=new FileReader();
  reader.onload=function(ev){
    var u=data.currentUser; if(!u||!u.residentId) return;
    var r=data.residents.find(function(x){return x.id===u.residentId;});
    if(!r) return;
    compressImageDataUrl(ev.target.result, 400, 0.8, function(compressed){
      r.profilePic = compressed;
      if(data.currentUser){
        data.currentUser.avatar = compressed;
        data.currentUser.profilePic = compressed;
      }
      // Update avatar immediately (before save)
      try { updateUserAvatar(); } catch(err){}
      try { saveData(); } catch(err){}
      showToast('Profile picture updated');
      try { renderProfile(); } catch(err){}
      try { updateUserAvatar(); } catch(err){}
    });
  };
  reader.readAsDataURL(file);
}
