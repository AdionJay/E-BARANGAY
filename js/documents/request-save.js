/**
 * Collect form details and save a new document request.
 * Defines: collectDocFormDetails(), saveDocument()
 */
function collectDocFormDetails(type, res){
  var fields = getDocFormFieldsForType(type);
  var details = {};
  var requiredMap = {
    purpose: { id: 'docPurpose', label: 'Purpose' },
    yearsResiding: { id: 'docYearsResiding', label: 'Years of residency' },
    completeAddress: { id: 'docCompleteAddress', label: 'Complete address' },
    monthlyIncome: { id: 'docMonthlyIncome', label: 'Monthly income' },
    employmentStatus: { id: 'docEmploymentStatus', label: 'Employment status' },
    beneficiaryName: { id: 'docBeneficiaryName', label: 'Beneficiary name', optional: true },
    businessName: { id: 'docBusinessName', label: 'Business name' },
    businessAddress: { id: 'docBusinessAddress', label: 'Business address' },
    businessPurpose: { id: 'docBusinessPurpose', label: 'Business purpose' },
    soloCircumstance: { id: 'docSoloCircumstance', label: 'Solo parent circumstance' },
    childrenCount: { id: 'docChildrenCount', label: 'Number of children' },
    receivingOffice: { id: 'docReceivingOffice', label: 'Receiving office' },
    endorsementReason: { id: 'docEndorsementReason', label: 'Reason for endorsement' },
    birthplace: { id: 'docBirthplace', label: 'Birthplace', optional: true },
    incidentDetails: { id: 'docIncidentDetails', label: 'Incident details' }
  };
  for(var i=0;i<fields.length;i++){
    var key = fields[i];
    var meta = requiredMap[key];
    if(!meta) continue;
    var el = $('#'+meta.id);
    var val = el ? String(el.value || '').trim() : '';
    if(!val && !meta.optional){
      return { error: 'Please fill in: '+meta.label };
    }
    details[key] = val;
  }
  // Always include template-ready profile snapshot
  var fullName = res ? (res.firstName+' '+(res.middleName||'')+' '+res.lastName).replace(/\s+/g,' ').trim() : '';
  var gender = res ? (res.gender || '') : '';
  var pronoun = /female/i.test(gender) ? 'she' : (/male/i.test(gender) ? 'he' : 'he/she');
  var possessive = pronoun === 'she' ? 'her' : (pronoun === 'he' ? 'his' : 'his/her');
  details.fullName = fullName;
  details.civilStatus = res ? (res.civilStatus || '') : '';
  details.gender = gender;
  details.pronoun = pronoun;
  details.possessive = possessive;
  details.address = res ? (res.address || '') : '';
  details.purok = res ? (res.purok || '') : '';
  details.contact = res ? (res.contact || '') : '';
  details.birthDate = res ? (res.birthDate || '') : '';
  details.barangay = (data.profiling && data.profiling.name) || 'Barangay Dumanguena';
  details.municipality = (data.profiling && (data.profiling.city || data.profiling.Municipality)) || 'Narra';
  details.province = (data.profiling && data.profiling.province) || 'Palawan';
  details.captain = (data.profiling && data.profiling.captain) || 'Punong Barangay';
  // Purpose fallback for types that use businessPurpose / endorsementReason / incidentDetails
  if(!details.purpose){
    details.purpose = details.businessPurpose || details.endorsementReason || details.incidentDetails || 'whatever legal purpose it may serve';
  }
  return { details: details };
}

function saveDocument(){
  var isResidentUser = data.currentUser && data.currentUser.role === 'Resident';
  var residentId;
  if(isResidentUser && data.currentUser.residentId){
    residentId = parseInt(data.currentUser.residentId, 10);
  } else if($('#docResidentIdFixed') && $('#docResidentIdFixed').value){
    residentId = parseInt($('#docResidentIdFixed').value, 10);
  } else {
    residentId = parseInt($('#docResident').value, 10);
  }

  var type = $('#docType').value;
  if(!type){ showToast('Please select a document type','error'); return; }

  var res = data.residents.find(function(r){ return r.id === residentId; });
  if(!res || !res.verified){ showToast('ACCESS DENIED — Resident not verified','error'); return; }

  if(isResidentUser && data.currentUser.residentId !== residentId){
    showToast('You can only request documents for your own account','error');
    return;
  }

  var collected = collectDocFormDetails(type, res);
  if(collected.error){ showToast(collected.error,'error'); return; }
  var formDetails = collected.details;

  // Requesting on behalf of another person (resident portal only)
  var onBehalf = false, applicantRelation = '';
  if(isResidentUser){
    var modeChecked = document.querySelector('input[name="docApplicantMode"]:checked');
    onBehalf = !!modeChecked && modeChecked.value === 'other';
  }
  if(onBehalf){
    var oName = ($('#docOtherName') && $('#docOtherName').value || '').trim();
    var oAddress = ($('#docOtherAddress') && $('#docOtherAddress').value || '').trim();
    if(!oName){ showToast('Please enter the applicant\'s full name','error'); return; }
    if(!oAddress){ showToast('Please enter the applicant\'s complete address','error'); return; }
    var oCivil = $('#docOtherCivil') ? $('#docOtherCivil').value : '';
    var oGender = $('#docOtherGender') ? $('#docOtherGender').value : '';
    var oPurok = ($('#docOtherPurok') && $('#docOtherPurok').value || '').trim();
    var oContact = ($('#docOtherContact') && $('#docOtherContact').value || '').trim();
    applicantRelation = ($('#docOtherRelation') && $('#docOtherRelation').value || '').trim();
    var oPronoun = /female/i.test(oGender) ? 'she' : (/male/i.test(oGender) ? 'he' : 'he/she');
    var oPossessive = oPronoun === 'she' ? 'her' : (oPronoun === 'he' ? 'his' : 'his/her');
    formDetails.fullName = oName;
    formDetails.civilStatus = oCivil;
    formDetails.gender = oGender;
    formDetails.pronoun = oPronoun;
    formDetails.possessive = oPossessive;
    formDetails.address = oAddress;
    formDetails.purok = oPurok;
    formDetails.contact = oContact;
    if(formDetails.completeAddress !== undefined) formDetails.completeAddress = oAddress;
    if(formDetails.beneficiaryName !== undefined && !formDetails.beneficiaryName) formDetails.beneficiaryName = oName;
  }
  var purpose = formDetails.purpose || '';

  var fee = getDocFee(type);
  var newDoc = {
    id: nextId(data.documents),
    type: type,
    residentId: residentId,
    purpose: purpose,
    status: 'Pending',
    requestDate: today(),
    releaseDate: null,
    orNumber: null,
    fee: fee,
    paid: false,
    endorsedBy: null,
    endorsedDate: null,
    approvedBy: null,
    approvedDate: null,
    onBehalfOf: onBehalf,
    applicantRelation: onBehalf ? applicantRelation : '',
    // Snapshot + template field values from official wording forms
    applicantName: formDetails.fullName,
    applicantAddress: formDetails.address,
    applicantPurok: formDetails.purok,
    applicantContact: formDetails.contact,
    applicantCivilStatus: formDetails.civilStatus,
    formDetails: formDetails
  };
  data.documents.push(newDoc);
  addNotif('New Request', getResidentName(residentId)+' requested '+type+(onBehalf?' (on behalf of '+formDetails.fullName+')':''), 'info', 'Secretary', null, 'document');
  addNotif('Request Submitted', 'Your '+type+' request was submitted. Fee: ₱'+fee+'. Pay via GCash to '+data.gcashAccount.number, 'info', 'Resident', residentId, 'document');
  saveData();
  closeModal('documentModal');
  // Do NOT show filled official document to resident until Released (after payment + Treasurer verify)
  if(isResidentUser){
    showToast('Request submitted.');
  } else {
    showToast('Request submitted');
  }
  if($('#module-documents') && $('#module-documents').classList.contains('active')) renderDocuments();
  if($('#module-portal') && $('#module-portal').classList.contains('active')) renderPortal();
  if($('#module-myrequests') && $('#module-myrequests').classList.contains('active')) renderMyRequests();
  if($('#module-secretary') && $('#module-secretary').classList.contains('active')) renderSecretary();
  updateNotifBadge();
}
