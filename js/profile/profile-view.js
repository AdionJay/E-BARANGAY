/**
 * Resident "My Profile" screen and edit.
 * Defines: renderProfile(), toggleProfileEdit(), saveProfileEdits()
 */
function renderProfile(){
  var u=data.currentUser;
  if(u.role!=='Resident'||!u.residentId){ $('#profileBody').innerHTML='<div class="empty-state">Profile available for Resident accounts only.</div>'; return; }
  var r=data.residents.find(function(x){return x.id===u.residentId;});
  if(!r){ $('#profileBody').innerHTML='<div class="empty-state">Resident record not found.</div>'; return; }
  // Normalize missing fields for older records
  if(r.gender===undefined) r.gender='';
  if(r.civilStatus===undefined) r.civilStatus='';
  if(r.birthDate===undefined) r.birthDate='';
  if(r.occupation===undefined) r.occupation='';
  if(r.nationality===undefined) r.nationality='Filipino';
  if(r.birthplace===undefined) r.birthplace='';
  if(r.email===undefined) r.email='';
  var idStatus=r.idVerified
    ? '<span class="badge badge-success">National ID Verified</span> on '+formatDate(r.idVerifiedDate)+' · <code>'+(r.nationalId||'')+'</code>'
    : '<span class="badge badge-warning">National ID Not Verified</span>';
  var imgHtml=r.idImage?'<img src="'+r.idImage+'" alt="National ID" class="id-preview-img">':'<p class="muted-note">No ID image on file</p>';
  var ocrNote='';
  var avatar=r.profilePic
    ? '<img src="'+r.profilePic+'" alt="Profile" class="profile-avatar-img">'
    : '<div class="profile-avatar-fallback">'+(r.firstName?r.firstName.charAt(0):'?')+'</div>';
  var yesNo=function(v){ return v?'<span class="badge badge-info">Yes</span>':'<span class="badge badge-secondary">No</span>'; };

  $('#profileBody').innerHTML=
    '<div class="profile-hero card">'+
      '<div class="card-body profile-hero-body">'+
        '<div class="profile-avatar-wrap">'+avatar+
          '<button class="btn btn-sm btn-outline" onclick="uploadProfilePic()"><i class="fas fa-camera"></i> Photo</button>'+
          '<input type="file" id="profilePicInput" accept="image/*" style="display:none;" onchange="handleProfilePic(event)">'+
        '</div>'+
        '<div class="profile-hero-info">'+
          '<h2 class="profile-name">'+escapeHtml(r.firstName+' '+(r.middleName||'')+' '+r.lastName).replace(/\s+/g,' ').trim()+'</h2>'+
          '<p class="profile-meta">'+(r.purok?('Purok '+escapeHtml(r.purok)+' · '):'')+escapeHtml(r.address||'')+'</p>'+
          '<div class="profile-badges">'+
            (r.verified?'<span class="badge badge-success">Verified Resident</span>':'<span class="badge badge-warning">Pending Residency</span>')+' '+
            idStatus+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+

    '<div class="card"><div class="card-header"><h3><i class="fas fa-id-card"></i> Resident Information</h3>'+
      '<button class="btn btn-sm btn-primary" onclick="toggleProfileEdit()">Edit Profile</button></div>'+
    '<div class="card-body" id="profileViewPanel">'+
      '<div class="info-grid">'+
        '<div class="info-item"><span class="info-label">First Name</span><span class="info-value">'+escapeHtml(r.firstName||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Middle Name</span><span class="info-value">'+escapeHtml(r.middleName||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Last Name</span><span class="info-value">'+escapeHtml(r.lastName||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Gender</span><span class="info-value">'+escapeHtml(r.gender||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Civil Status</span><span class="info-value">'+escapeHtml(r.civilStatus||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Birth Date</span><span class="info-value">'+escapeHtml(r.birthDate?formatDate(r.birthDate):'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Age</span><span class="info-value"><strong>'+formatAge(r.birthDate)+'</strong></span></div>'+
        '<div class="info-item"><span class="info-label">Birthplace</span><span class="info-value">'+escapeHtml(r.birthplace||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Nationality</span><span class="info-value">'+escapeHtml(r.nationality||'Filipino')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Contact</span><span class="info-value">'+escapeHtml(r.contact||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Email</span><span class="info-value">'+escapeHtml(r.email||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Occupation</span><span class="info-value">'+escapeHtml(r.occupation||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Purok</span><span class="info-value">'+escapeHtml(r.purok||'—')+'</span></div>'+
        '<div class="info-item info-item-wide"><span class="info-label">Address</span><span class="info-value">'+escapeHtml(r.address||'—')+'</span></div>'+
        '<div class="info-item"><span class="info-label">Registered Voter</span><span class="info-value">'+yesNo(!!r.voter)+'</span></div>'+
        '<div class="info-item"><span class="info-label">Senior Citizen</span><span class="info-value">'+yesNo(!!r.senior)+'</span></div>'+
        '<div class="info-item"><span class="info-label">PWD</span><span class="info-value">'+yesNo(!!r.pwd)+'</span></div>'+
        '<div class="info-item"><span class="info-label">Date Registered</span><span class="info-value">'+formatDate(r.registered)+'</span></div>'+
      '</div>'+
    '</div>'+
    '<div class="card-body" id="profileEditPanel" style="display:none;">'+
      '<div class="form-row">'+
        '<div class="form-group"><label>First Name *</label><input type="text" id="profFirstName" value="'+escapeHtml(r.firstName||'')+'"></div>'+
        '<div class="form-group"><label>Middle Name</label><input type="text" id="profMiddleName" value="'+escapeHtml(r.middleName||'')+'"></div>'+
        '<div class="form-group"><label>Last Name *</label><input type="text" id="profLastName" value="'+escapeHtml(r.lastName||'')+'"></div>'+
      '</div>'+
      '<div class="form-row">'+
        '<div class="form-group"><label>Gender *</label><select id="profGender">'+
          ['Male','Female','Other'].map(function(g){return '<option value="'+g+'"'+(r.gender===g?' selected':'')+'>'+g+'</option>';}).join('')+
        '</select></div>'+
        '<div class="form-group"><label>Civil Status *</label><select id="profCivilStatus">'+
          ['Single','Married','Widowed','Separated','Divorced'].map(function(c){return '<option value="'+c+'"'+(r.civilStatus===c?' selected':'')+'>'+c+'</option>';}).join('')+
        '</select></div>'+
        '<div class="form-group"><label>Birth Date</label><input type="date" id="profBirthDate" value="'+(r.birthDate||'')+'" onchange="var a=calcAge(this.value);var el=document.getElementById(\'profAgeDisplay\');if(el)el.textContent=a===null?\'—\':(a+\' years old\');"></div>'+
        '<div class="form-group"><label>Age (auto)</label><p id="profAgeDisplay" style="padding:10px 12px;background:#f3f4f6;border-radius:8px;margin:0;font-weight:600;">'+formatAge(r.birthDate)+'</p></div>'+
      '</div>'+
      '<div class="form-row">'+
        '<div class="form-group"><label>Birthplace</label><input type="text" id="profBirthplace" value="'+escapeHtml(r.birthplace||'')+'"></div>'+
        '<div class="form-group"><label>Nationality</label><input type="text" id="profNationality" value="'+escapeHtml(r.nationality||'Filipino')+'"></div>'+
        '<div class="form-group"><label>Occupation</label><input type="text" id="profOccupation" value="'+escapeHtml(r.occupation||'')+'"></div>'+
      '</div>'+
      '<div class="form-row">'+
        '<div class="form-group"><label>Contact</label><input type="text" id="profContact" value="'+escapeHtml(r.contact||'')+'"></div>'+
        '<div class="form-group"><label>Email</label><input type="email" id="profEmail" value="'+escapeHtml(r.email||'')+'"></div>'+
        '<div class="form-group"><label>Purok</label><input type="text" id="profPurok" value="'+escapeHtml(r.purok||'')+'"></div>'+
      '</div>'+
      '<div class="form-group"><label>Address *</label><input type="text" id="profAddress" value="'+escapeHtml(r.address||'')+'"></div>'+
      '<div class="form-row profile-check-row">'+
        '<label class="check-pill"><input type="checkbox" id="profVoter"'+(r.voter?' checked':'')+'> Registered Voter</label>'+
        '<label class="check-pill"><input type="checkbox" id="profSenior"'+(r.senior?' checked':'')+'> Senior Citizen</label>'+
        '<label class="check-pill"><input type="checkbox" id="profPwd"'+(r.pwd?' checked':'')+'> PWD</label>'+
      '</div>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">'+
        '<button class="btn btn-primary" onclick="saveProfileEdits()">Save Changes</button>'+
        '<button class="btn btn-secondary" onclick="toggleProfileEdit(false)">Cancel</button>'+
      '</div>'+
    '</div></div>'+

    '<div class="card"><div class="card-header"><h3><i class="fas fa-home"></i> Household Members</h3>'+'<button class="btn btn-sm btn-outline" onclick="toggleProfileHouseholdEdit()">Edit Members</button></div>'+'<div class="card-body" id="profileHouseholdPanel">'+buildProfileHouseholdHtml(r)+'</div></div>'+
    '<div class="card"><div class="card-header"><h3><i class="fas fa-address-card"></i> National ID Verification</h3></div><div class="card-body">'+
    '<p class="muted-note" style="margin-bottom:14px;">Scan or upload your Philippine National ID (PhilSys). The system reads the card and requires a <strong>name match</strong> with your resident profile before verification.</p>'+
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;">'+
    '<button class="btn btn-primary" style="width:auto;" onclick="scanNationalId()"><i class="fas fa-camera"></i> Scan ID (Camera)</button>'+
    '<button class="btn btn-outline" style="width:auto;" onclick="uploadNationalId()"><i class="fas fa-upload"></i> Upload Image</button>'+
    (r.idVerified?'<button class="btn btn-danger" style="width:auto;" onclick="clearNationalId()">Remove ID</button>':'')+
    '</div>'+
    '<input type="file" id="idFileInput" accept="image/*" capture="environment" style="display:none;" onchange="handleIdUpload(event)">'+
    '<div id="idPreviewArea">'+imgHtml+ocrNote+'</div>'+
    '</div></div>';
}

function toggleProfileEdit(force){
  var view=$('#profileViewPanel'), edit=$('#profileEditPanel');
  if(!view||!edit) return;
  var show = force===false ? false : (edit.style.display==='none' || !edit.style.display);
  if(force===true) show=true;
  if(force===false) show=false;
  // toggle if force undefined
  if(force===undefined){
    show = edit.style.display==='none' || edit.style.display==='';
  }
  edit.style.display = show ? 'block' : 'none';
  view.style.display = show ? 'none' : 'block';
}

function saveProfileEdits(){
  var u=data.currentUser;
  if(!u||!u.residentId) return;
  var r=data.residents.find(function(x){return x.id===u.residentId;});
  if(!r) return;
  var fn=($('#profFirstName')&&$('#profFirstName').value.trim())||'';
  var ln=($('#profLastName')&&$('#profLastName').value.trim())||'';
  var addr=($('#profAddress')&&$('#profAddress').value.trim())||'';
  if(!fn||!ln||!addr){ showToast('First name, last name, and address are required','error'); return; }
  r.firstName=fn;
  r.middleName=($('#profMiddleName')&&$('#profMiddleName').value.trim())||'';
  r.lastName=ln;
  r.gender=($('#profGender')&&$('#profGender').value)||r.gender||'Male';
  r.civilStatus=($('#profCivilStatus')&&$('#profCivilStatus').value)||r.civilStatus||'Single';
  r.birthDate=($('#profBirthDate')&&$('#profBirthDate').value)||'';
  r.birthplace=($('#profBirthplace')&&$('#profBirthplace').value.trim())||'';
  r.nationality=($('#profNationality')&&$('#profNationality').value.trim())||'Filipino';
  r.occupation=($('#profOccupation')&&$('#profOccupation').value.trim())||'';
  r.contact=($('#profContact')&&$('#profContact').value.trim())||'';
  r.email=($('#profEmail')&&$('#profEmail').value.trim())||'';
  r.purok=($('#profPurok')&&$('#profPurok').value.trim())||'';
  r.address=addr;
  r.voter=!!($('#profVoter')&&$('#profVoter').checked);
  r.senior=!!($('#profSenior')&&$('#profSenior').checked);
  r.pwd=!!($('#profPwd')&&$('#profPwd').checked);
  // Auto age-based senior flag
  var age = calcAge(r.birthDate);
  if(age !== null && age >= 60) r.senior = true;
  // Keep account display name in sync
  if(data.currentUser) data.currentUser.name = fn+' '+ln;
  var el=$('#userName'); if(el) el.textContent=data.currentUser.name;
  saveData();
  showToast('Profile updated');
  renderProfile();
}
