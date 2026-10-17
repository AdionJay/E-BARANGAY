/**
 * Merge request + resident data into one applicant object; long date formatter.
 * Defines: getApplicantDetails(), formatLongDate()
 */
function getApplicantDetails(d, r){
  var fd = d.formDetails || {};
  var fullName = fd.fullName || d.applicantName || (r ? (r.firstName+' '+(r.middleName||'')+' '+r.lastName).replace(/\s+/g,' ').trim() : 'N/A');
  var civil = fd.civilStatus || d.applicantCivilStatus || (r ? r.civilStatus : '') || '';
  var address = fd.completeAddress || fd.address || d.applicantAddress || (r ? r.address : '') || '';
  var purok = fd.purok || d.applicantPurok || (r ? r.purok : '') || '';
  var gender = fd.gender || (r ? r.gender : '') || '';
  var pronoun = fd.pronoun || (/female/i.test(gender) ? 'she' : (/male/i.test(gender) ? 'he' : 'he/she'));
  var possessive = fd.possessive || (pronoun === 'she' ? 'her' : (pronoun === 'he' ? 'his' : 'his/her'));
  var p = data.profiling || {};
  return {
    fullName: fullName,
    civilStatus: civil,
    address: address,
    purok: purok,
    contact: fd.contact || d.applicantContact || (r ? r.contact : '') || '',
    gender: gender,
    pronoun: pronoun,
    possessive: possessive,
    birthDate: fd.birthDate || (r ? r.birthDate : '') || '',
    birthplace: fd.birthplace || '',
    purpose: fd.purpose || d.purpose || 'whatever legal purpose it may serve',
    yearsResiding: fd.yearsResiding || '',
    monthlyIncome: fd.monthlyIncome || '',
    employmentStatus: fd.employmentStatus || 'not a government employee',
    beneficiaryName: fd.beneficiaryName || fullName,
    businessName: fd.businessName || '',
    businessAddress: fd.businessAddress || address,
    businessPurpose: fd.businessPurpose || 'Business Permit Application',
    soloCircumstance: fd.soloCircumstance || '',
    childrenCount: fd.childrenCount || '',
    receivingOffice: fd.receivingOffice || '',
    endorsementReason: fd.endorsementReason || d.purpose || '',
    incidentDetails: fd.incidentDetails || d.purpose || '',
    barangay: fd.barangay || p.name || 'Barangay Dumanguena',
    municipality: fd.municipality || p.city || p.Municipality || 'Narra',
    province: fd.province || p.province || 'Palawan',
    captain: fd.captain || p.captain || 'Punong Barangay',
    hallAddress: p.address || '',
    hallContact: p.contact || '',
    issueDate: d.releaseDate || d.approvedDate || d.requestDate || today(),
    orNumber: d.orNumber || 'N/A'
  };
}

function formatLongDate(dateStr){
  try {
    var dt = new Date(dateStr);
    if(isNaN(dt.getTime())) return String(dateStr || '');
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return dt.getDate() + ' Day of ' + months[dt.getMonth()] + ', ' + dt.getFullYear();
  } catch(e){ return String(dateStr || ''); }
}
