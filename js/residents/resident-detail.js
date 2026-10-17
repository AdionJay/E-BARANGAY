/**
 * Resident detail review modal.
 * Defines: viewResidentDetail()
 */
function viewResidentDetail(id){
  var r=data.residents.find(function(x){return x.id===id;}); if(!r)return;
  var ver=r.verified?'<span class="badge badge-success">Verified</span> by '+(r.verifiedBy||'')+(r.verifiedDate?' on '+formatDate(r.verifiedDate):''):'<span class="badge badge-warning">Pending Verification</span>';
  var idv=r.idVerified?'<span class="badge badge-success">ID Scanned ✓</span>':'<span class="badge badge-warning">No ID uploaded</span>';
  var idImg=r.idImage
    ? '<div class="id-preview-box"><p style="font-size:12px;font-weight:600;margin-bottom:8px;">📷 Scanned / Uploaded National ID</p><img src="'+r.idImage+'" alt="National ID"></div>'
    : '<p style="font-size:13px;color:#6b7280;margin-top:8px;">No ID image on file. Resident must scan or upload National ID in My Profile.</p>';
  var ocrBlock='';
  if(r.idVerified||r.nationalId||r.ocrName||r.idImage){
    ocrBlock='<div style="margin-top:14px;padding:12px;background:#F0FDFA;border:1px solid #99F6E4;border-radius:10px;">'+
      '<p style="font-size:13px;font-weight:700;color:#115E59;margin-bottom:8px;">🪪 ID Information — verify using the uploaded ID image above</p>'+
      '<div class="form-row">'+
      '<div class="form-group"><label>National ID Number</label><p><strong>'+(r.nationalId||'—')+'</strong></p></div>'+
      '<div class="form-group"><label>Name on ID</label><p><strong>'+(r.ocrName||'—')+'</strong></p></div>'+
      '<div class="form-group"><label>ID Submitted</label><p>'+formatDate(r.idVerifiedDate)+'</p></div>'+
      '</div></div>';
  }
  var actions='';
  if(!r.verified){
    actions='<div style="margin-top:16px;"><button class="btn btn-success" style="width:auto;" onclick="closeModal(\'secDetailModal\');verifyResident('+r.id+')">✓ Verify Residency (after reviewing ID)</button></div>';
  }
  var fullName = (r.firstName+' '+(r.middleName||'')+' '+r.lastName).replace(/\s+/g,' ').trim();
  var photoBlock = '<div class="res-detail-hero">'+residentPhotoHtml(r,'lg')+
    '<div class="res-detail-meta"><h3 style="margin:0 0 6px;">'+fullName+'</h3>'+
    '<p style="margin:0 0 6px;color:#5A7B76;font-size:13px;">'+(r.purok||'Unassigned')+(r.address?(' · '+r.address):'')+'</p>'+
    '<div style="display:flex;flex-wrap:wrap;gap:6px;">'+ver+' '+idv+'</div></div></div>';
  var members = ensureHousehold(r);
  var hhHtml = members.length
    ? '<div style="margin-top:12px;"><label style="font-weight:600;font-size:13px;">Household Members ('+members.length+')</label>'+
      '<div class="table-responsive" style="margin-top:6px;"><table style="font-size:13px;"><thead><tr><th>Name</th><th>Relation</th><th>Birth Date</th><th>Age</th></tr></thead><tbody>'+
      members.map(function(m){
        return '<tr><td>'+(m.name||'—')+'</td><td>'+(m.relation||'—')+'</td><td>'+(m.birthDate?formatDate(m.birthDate):'—')+'</td><td>'+formatAge(m.birthDate)+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>'
    : '<p style="margin-top:10px;font-size:13px;color:#6b7280;">No household members recorded.</p>';
  var editBtn = (role()==='Admin'||role()==='Secretary')
    ? '<button class="btn btn-sm btn-outline" style="width:auto;margin-left:8px;" onclick="closeModal(\'secDetailModal\');editResident('+r.id+')">✎ Edit Info</button>'
    : '';
  $('#secDetailBody').innerHTML=
    photoBlock+
    '<div class="form-row"><div class="form-group"><label>Gender</label><p>'+(r.gender||'—')+'</p></div>'+
    '<div class="form-group"><label>Civil Status</label><p>'+(r.civilStatus||'—')+'</p></div>'+
    '<div class="form-group"><label>Birth Date</label><p>'+(r.birthDate?formatDate(r.birthDate):'—')+'</p></div>'+
    '<div class="form-group"><label>Age</label><p><strong>'+formatAge(r.birthDate)+'</strong></p></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Contact</label><p>'+(r.contact||'—')+'</p></div>'+
    '<div class="form-group"><label>Occupation</label><p>'+(r.occupation||'—')+'</p></div>'+
    '<div class="form-group"><label>National ID</label><p>'+(r.nationalId||'—')+'</p></div></div>'+
    '<div class="form-group"><label>Address</label><p>'+(r.address||'—')+'</p></div>'+
    '<div class="form-row"><div class="form-group"><label>Proof of Residency</label><p>'+(r.proof||'None')+'</p></div>'+
    '<div class="form-group"><label>Residency Status</label><p>'+ver+'</p></div>'+
    '<div class="form-group"><label>ID Status</label><p>'+idv+'</p></div></div>'+
    hhHtml+
    idImg+ocrBlock+
    '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">'+
      (r.verified?'':'<button class="btn btn-success" style="width:auto;" onclick="closeModal(\'secDetailModal\');verifyResident('+r.id+')">✓ Verify Residency (after reviewing ID)</button>')+
      editBtn+
    '</div>';
  $('#secDetailModal').classList.add('active');
}
