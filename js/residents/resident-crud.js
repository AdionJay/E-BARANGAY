/**
 * Resident table and add / edit / delete.
 * Defines: renderResidents(), openResidentModal(), saveResident(), editResident(), deleteResident()
 */
function renderResidents(){
  var search=($('#resSearch')&&$('#resSearch').value||'').toLowerCase();
  var list=data.residents;
  if(search) list=list.filter(function(r){ return (r.firstName+' '+r.lastName+' '+r.address+' '+(r.purok||'')+' '+r.contact).toLowerCase().indexOf(search)>=0; });
  $('#residentsTable').innerHTML=list.map(function(r,idx){
    var tags=(r.voter?'<span class="badge badge-info">Voter</span> ':'')+(r.senior?'<span class="badge badge-warning">Senior</span> ':'')+(r.pwd?'<span class="badge badge-danger">PWD</span> ':'')+(r.verified?'<span class="badge badge-success">Verified</span>':'<span class="badge badge-warning">Unverified</span>')+(r.idVerified?' <span class="badge badge-info">ID ✓</span>':'');
    var del=(role()==='Admin')?' <button class="btn btn-sm btn-danger" onclick="deleteResident('+r.id+')">Delete</button>':'';
    return '<tr><td>'+(idx+1)+'</td><td class="td-photo">'+residentPhotoHtml(r,'sm')+'</td><td><strong>'+r.lastName+', '+r.firstName+'</strong></td><td>'+(r.purok||'—')+'</td><td>'+r.address+'</td><td>'+r.contact+'</td><td>'+tags+'</td><td><button class="btn btn-sm btn-outline" onclick="viewResidentDetail('+r.id+')">View</button> <button class="btn btn-sm btn-outline" onclick="editResident('+r.id+')">Edit</button>'+del+'</td></tr>';
  }).join('')||'<tr><td colspan="8">No residents</td></tr>';

  try { renderPurokResidentRecords(); } catch(e){ console.warn(e); }
}

function openResidentModal(id){
  $('#resModalTitle').textContent=id?'Edit Resident':'Add New Resident';
  $('#resId').value=id||'';
  if(id){
    var r=data.residents.find(function(x){return x.id===id;});
    if(r){
      $('#resFirstName').value=r.firstName; $('#resLastName').value=r.lastName; $('#resMiddleName').value=r.middleName||'';
      $('#resBirthDate').value=r.birthDate||''; $('#resGender').value=r.gender; $('#resCivilStatus').value=r.civilStatus;
      $('#resAddress').value=r.address; $('#resPurok').value=r.purok||''; $('#resContact').value=r.contact;
      $('#resOccupation').value=r.occupation||''; $('#resProof').value=r.proof||'';
      $('#resVoter').checked=r.voter; $('#resSenior').checked=r.senior; $('#resPwd').checked=r.pwd;
      var ageEl=$('#resAgeDisplay'); if(ageEl) ageEl.textContent=formatAge(r.birthDate);
      renderHouseholdEditor(ensureHousehold(r));
    }
  } else {
    ['resFirstName','resLastName','resMiddleName','resBirthDate','resAddress','resPurok','resContact','resOccupation','resProof'].forEach(function(i){$('#'+i).value='';});
    $('#resGender').value='Male'; $('#resCivilStatus').value='Single';
    $('#resVoter').checked=false; $('#resSenior').checked=false; $('#resPwd').checked=false;
    var ageEl2=$('#resAgeDisplay'); if(ageEl2) ageEl2.textContent='—';
    renderHouseholdEditor([]);
  }
  $('#residentModal').classList.add('active');
}

function saveResident(){
  var id=$('#resId').value?parseInt($('#resId').value):null;
  var obj={ firstName:$('#resFirstName').value.trim(), lastName:$('#resLastName').value.trim(), middleName:$('#resMiddleName').value.trim(), birthDate:$('#resBirthDate').value, gender:$('#resGender').value, civilStatus:$('#resCivilStatus').value, address:$('#resAddress').value.trim(), purok:$('#resPurok').value.trim(), contact:$('#resContact').value.trim(), occupation:$('#resOccupation').value.trim(), proof:$('#resProof').value.trim(), voter:$('#resVoter').checked, senior:$('#resSenior').checked, pwd:$('#resPwd').checked, status:'Active', householdMembers:collectHouseholdFromEditor() };
  if(!obj.firstName||!obj.lastName||!obj.address){ showToast('Fill required fields','error'); return; }
  // Auto-set senior if age >= 60
  var age = calcAge(obj.birthDate);
  if(age !== null && age >= 60) obj.senior = true;
  if(id){
    var idx=data.residents.findIndex(function(r){return r.id===id;});
    data.residents[idx]=Object.assign({},data.residents[idx],obj);
    showToast('Resident updated');
  } else {
    obj.id=nextId(data.residents); obj.registered=today();
    obj.verified=false; obj.verifiedBy=null; obj.verifiedDate=null;
    obj.nationalId=null; obj.idVerified=false; obj.idVerifiedDate=null; obj.idImage=null;
    data.residents.push(obj);
    renumberResidents();
    addNotif('New Resident',obj.firstName+' '+obj.lastName+' needs residency verification','warning','Secretary');
    showToast('Resident added');
  }
  saveData(); closeModal('residentModal'); renderResidents();
}

function editResident(id){ openResidentModal(id); }

function deleteResident(id){
  openConfirmModal({
    title: 'Delete Resident',
    message: 'Delete this resident and related records? This cannot be undone.',
    okLabel: 'Delete',
    variant: 'danger',
    onConfirm: function(){
      data.residents=data.residents.filter(function(r){return r.id!==id;});
      data.documents=data.documents.filter(function(d){return d.residentId!==id;});
      data.payments=data.payments.filter(function(p){return p.residentId!==id;});
      data.users=data.users.filter(function(u){return u.residentId!==id;});
      data.notifications=data.notifications.filter(function(n){return n.residentId!==id;});
      var idMap={};
      data.residents.forEach(function(r,i){ idMap[r.id]=i+1; r.id=i+1; });
      data.documents.forEach(function(d){ if(idMap[d.residentId]) d.residentId=idMap[d.residentId]; });
      data.payments.forEach(function(p){ if(idMap[p.residentId]) p.residentId=idMap[p.residentId]; });
      data.notifications.forEach(function(n){ if(n.residentId&&idMap[n.residentId]) n.residentId=idMap[n.residentId]; });
      data.users.forEach(function(u){ if(u.residentId&&idMap[u.residentId]) u.residentId=idMap[u.residentId]; });
      saveData(); syncProfilingStats(); showToast('Resident deleted — numbering updated'); renderResidents();
    }
  });
}
