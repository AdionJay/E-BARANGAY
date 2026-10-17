/**
 * Open the Request Document modal and show the fee.
 * Defines: openDocumentModal(), updateDocFeeDisplay()
 */
function openDocumentModal(opts){
  opts = opts || {};
  var preselectType = opts.type || '';
  var lockType = !!opts.lockType;
  var isResidentUser = data.currentUser && data.currentUser.role === 'Resident';

  var types = getDocTypes();
  $('#docType').innerHTML = types.map(function(t){
    return '<option value="'+t.name+'">'+t.name+(t.fee?' — ₱'+t.fee:' — Free')+'</option>';
  }).join('');
  clearDocDynamicInputs();
  if(preselectType) $('#docType').value = preselectType;

  var typeSel = $('#docType');
  if(typeSel){
    typeSel.onchange = onDocTypeFormChange;
    typeSel.disabled = lockType && !!preselectType;
  }
  if($('#docTypeLockedNote')) $('#docTypeLockedNote').style.display = (lockType && preselectType) ? 'block' : 'none';
  if($('#docFeeGcash')) $('#docFeeGcash').textContent = data.gcashAccount.number;
  updateDocFeeDisplay();
  updateDocDynamicFields();

  if(isResidentUser && data.currentUser.residentId){
    var res = data.residents.find(function(r){ return r.id === data.currentUser.residentId; });
    if(!res){ showToast('Resident profile not found','error'); return; }
    if(!res.verified){ showToast('ACCESS DENIED — Not a verified resident. Wait for Secretary verification.','error'); return; }

    if($('#docResidentGroup')) $('#docResidentGroup').style.display = 'none';
    if($('#docResidentAutoFill')) $('#docResidentAutoFill').style.display = 'block';
    fillResidentDocAutoFields(res);
    if($('#docApplicantModeGroup')) $('#docApplicantModeGroup').style.display = 'block';
    resetDocApplicantMode();
    if($('#docModalTitle')) $('#docModalTitle').textContent = 'Request Document';
  } else {
    var verified = data.residents.filter(function(r){ return r.verified; });
    var list = verified.length ? verified : data.residents;
    $('#docResident').innerHTML = list.map(function(r){
      return '<option value="'+r.id+'">'+r.lastName+', '+r.firstName+(r.verified?'':' — Unverified')+'</option>';
    }).join('');
    if($('#docResidentGroup')) $('#docResidentGroup').style.display = 'block';
    if($('#docResidentAutoFill')) $('#docResidentAutoFill').style.display = 'none';
    if($('#docResidentIdFixed')) $('#docResidentIdFixed').value = '';
    if($('#docApplicantModeGroup')) $('#docApplicantModeGroup').style.display = 'none';
    resetDocApplicantMode();
    if($('#docModalTitle')) $('#docModalTitle').textContent = 'New Document Request';
    // When staff picks a resident, refresh address defaults
    if($('#docResident')){
      $('#docResident').onchange = function(){
        var rid = parseInt($('#docResident').value, 10);
        var r = data.residents.find(function(x){ return x.id === rid; });
        if(r) fillResidentDocAutoFields(r);
      };
    }
  }

  $('#documentModal').classList.add('active');
  setTimeout(function(){
    var first = document.querySelector('#docDynamicFields .doc-field[style*="block"] input, #docDynamicFields .doc-field[style*="block"] select, #docDynamicFields .doc-field[style*="block"] textarea');
    if(first) first.focus();
    else if($('#docPurpose')) $('#docPurpose').focus();
  }, 80);
}

function updateDocFeeDisplay(){
  var t=$('#docType')?$('#docType').value:'';
  var fee=getDocFee(t);
  if($('#docFeeAmount')) $('#docFeeAmount').textContent=fee?('₱'+fee):'Free';
  if($('#docFeeGcash')) $('#docFeeGcash').textContent=data.gcashAccount.number;
}
