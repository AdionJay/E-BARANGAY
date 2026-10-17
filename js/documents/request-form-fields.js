/**
 * Dynamic fields and applicant (self / on-behalf) toggle of the request form.
 * Defines: fillResidentDocAutoFields(), getDocFormFieldsForType(), clearDocDynamicInputs(), updateDocDynamicFields(), onDocTypeFormChange(), onDocApplicantModeChange(), resetDocApplicantMode()
 */
function fillResidentDocAutoFields(res){
  if(!res) return;
  var fullName = (res.firstName+' '+(res.middleName||'')+' '+res.lastName).replace(/\s+/g,' ').trim();
  if($('#docAutoName')) $('#docAutoName').textContent = fullName || '—';
  if($('#docAutoCivil')) $('#docAutoCivil').textContent = res.civilStatus || '—';
  if($('#docAutoAddress')) $('#docAutoAddress').textContent = res.address || '—';
  if($('#docAutoPurok')) $('#docAutoPurok').textContent = res.purok || '—';
  if($('#docAutoContact')) $('#docAutoContact').textContent = res.contact || '—';
  if($('#docAutoStatus')) $('#docAutoStatus').innerHTML = res.verified
    ? '<span class="badge badge-success">Verified Resident</span>'
    : '<span class="badge badge-warning">Pending Verification</span>';
  if($('#docResidentIdFixed')) $('#docResidentIdFixed').value = String(res.id);

  // Pre-fill address-related dynamic fields from profile
  var fullAddr = [res.address, res.purok ? ('Purok '+res.purok) : '', 'Barangay Dumanguena'].filter(Boolean).join(', ');
  if($('#docCompleteAddress') && !$('#docCompleteAddress').value) $('#docCompleteAddress').value = fullAddr;
  if($('#docBeneficiaryName') && !$('#docBeneficiaryName').value) $('#docBeneficiaryName').value = fullName;
  if($('#docBusinessAddress') && !$('#docBusinessAddress').value && res.address) $('#docBusinessAddress').value = res.address;
}

function getDocFormFieldsForType(typeName){
  return DOC_FORM_FIELDS[typeName] || ['purpose'];
}

function clearDocDynamicInputs(){
  ['docPurpose','docYearsResiding','docCompleteAddress','docMonthlyIncome','docBeneficiaryName',
   'docBusinessName','docBusinessAddress','docChildrenCount','docReceivingOffice',
   'docEndorsementReason','docBirthplace','docIncidentDetails'].forEach(function(id){
    var el = $('#'+id); if(el) el.value = '';
  });
  if($('#docEmploymentStatus')) $('#docEmploymentStatus').selectedIndex = 0;
  if($('#docBusinessPurpose')) $('#docBusinessPurpose').selectedIndex = 0;
  if($('#docSoloCircumstance')) $('#docSoloCircumstance').selectedIndex = 0;
}

function updateDocDynamicFields(){
  var type = $('#docType') ? $('#docType').value : '';
  var fields = getDocFormFieldsForType(type);
  var nodes = document.querySelectorAll('#docDynamicFields .doc-field');
  for(var i=0;i<nodes.length;i++){
    var key = nodes[i].getAttribute('data-field');
    nodes[i].style.display = fields.indexOf(key) >= 0 ? 'block' : 'none';
  }
  // Soft hint text per document
  var hints = {
    'Certificate of Indigency': 'Based on official indigency wording: purpose, income, and employment status are required.',
    'Certificate of Residency': 'Based on official residency wording: years of residency and complete address are required.',
    'Business Permit': 'Based on official business clearance wording: business name and address are required.',
    'Certificate of Solo Parent': 'Based on solo parent endorsement wording: circumstance and number of children are required.',
    'Barangay Endorsement': 'Based on endorsement letter wording: receiving office and reason are required.',
    'Blotter / Incident Report': 'Provide incident details for the blotter / incident certification.',
    'Barangay ID': 'Birthplace is used on the Barangay ID certification (optional if already on profile).'
  };
  if($('#docFormHint')){
    $('#docFormHint').textContent = hints[type] ||
      'Personal details are taken from your profile. Fill only the fields required for this document wording.';
  }
}

function onDocTypeFormChange(){
  updateDocFeeDisplay();
  updateDocDynamicFields();
  // Re-apply profile defaults into newly visible fields
  var isResidentUser = data.currentUser && data.currentUser.role === 'Resident' && data.currentUser.residentId;
  if(isResidentUser){
    var res = data.residents.find(function(r){ return r.id === data.currentUser.residentId; });
    if(res) fillResidentDocAutoFields(res);
  }
}

function onDocApplicantModeChange(){
  var checked = document.querySelector('input[name="docApplicantMode"]:checked');
  var isOther = !!checked && checked.value === 'other';
  if($('#docOtherApplicantFields')) $('#docOtherApplicantFields').style.display = isOther ? 'block' : 'none';
}

function resetDocApplicantMode(){
  var selfRadio = document.querySelector('input[name="docApplicantMode"][value="self"]');
  if(selfRadio) selfRadio.checked = true;
  if($('#docOtherApplicantFields')) $('#docOtherApplicantFields').style.display = 'none';
  ['docOtherName','docOtherAddress','docOtherPurok','docOtherContact','docOtherRelation'].forEach(function(id){
    var el = $('#'+id); if(el) el.value = '';
  });
  if($('#docOtherCivil')) $('#docOtherCivil').selectedIndex = 0;
  if($('#docOtherGender')) $('#docOtherGender').selectedIndex = 0;
}
