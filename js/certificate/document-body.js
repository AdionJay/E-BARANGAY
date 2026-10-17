/**
 * Official wording (paragraphs) of every certificate type.
 * Defines: buildOfficialDocumentBody()
 */
function buildOfficialDocumentBody(d, a){
  var type = d.type || '';
  var issueLong = formatLongDate(a.issueDate);
  var loc = a.barangay + ', ' + a.municipality + ', ' + a.province;

  if(type === 'Certificate of Indigency'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that '+a.fullName+' of legal age, '+a.civilStatus+', Filipino citizen, and residing at '+loc+', is a bonafide resident of this barangay and is known to be indigent.',
      '',
      'Further certify that '+a.pronoun+' is '+a.employmentStatus+' and has a monthly income of Php. '+(a.monthlyIncome||'0')+', which is insufficient to support the basic needs of '+a.possessive+' family.',
      '',
      'This certification is being issued to support '+a.beneficiaryName+'\'s application for '+a.purpose+'.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  if(type === 'Certificate of Residency'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that '+a.fullName+', of legal age, '+a.civilStatus+', Filipino citizen, is a Bonafide resident of '+loc+', and has been residing at '+(a.address||loc)+(a.yearsResiding ? (' for '+a.yearsResiding+' years') : '')+'.',
      '',
      'This certification is being issued upon the request of the above-named person for '+a.purpose+' purposes.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  if(type === 'Barangay Clearance'){
    var obj = a.possessive.replace('his/her','him/her').replace('his','him').replace('her','her');
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that '+a.fullName+', of legal age, '+a.civilStatus+', Filipino citizen, and a resident of Barangay '+a.barangay+', '+a.municipality+', '+a.province+', is known to be of good moral character and a law-abiding citizen in this barangay.',
      '',
      'Further certify that '+a.pronoun+' has no derogatory record and no pending case filed against '+obj+' in this barangay as of this date.',
      '',
      'This clearance is being issued upon the request of the above-named person for '+a.purpose+' purposes.',
      '',
      'Issued this '+issueLong+', at Barangay '+a.barangay+', '+a.municipality+', '+a.province+'.'
    ];
  }
  if(type === 'Certificate of Good Moral Character'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that '+a.fullName+', of legal age, '+a.civilStatus+', Filipino citizen, and a bonafide resident of '+loc+', is personally known to this office to be of good moral character, law-abiding, and of good standing in the community.',
      '',
      'This certification is being issued upon the request of the above-named person for '+a.purpose+' purposes.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  if(type === 'Business Permit'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that the business establishment named '+(a.businessName||'N/A')+', owned and operated by '+a.fullName+', located at '+(a.businessAddress||a.address)+', '+loc+', is granted clearance to operate within the jurisdiction of this barangay.',
      '',
      'This clearance is issued for the purpose of '+(a.businessPurpose||a.purpose)+' and is subject to the barangay ordinances and local regulations.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  if(type === 'Certificate of First Time Job Seeker'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that '+a.fullName+', of legal age, and a bonafide resident of '+loc+', is a first-time jobseeker as defined under Republic Act No. 11261, otherwise known as the "Jobstart Philippines Act," and has not been previously employed.',
      '',
      'This certification is issued for the purpose of availing the benefits under the Republic Act No. 11261'+(a.purpose ? (', and for '+a.purpose) : '')+', and for whatever legal purpose it may serve.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  if(type === 'Certificate of No Pending Case'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that '+a.fullName+', of legal age, '+a.civilStatus+', Filipino citizen, and a resident of '+loc+', has no pending case filed against '+a.possessive.replace('his/her','him/her').replace('his','him').replace('her','her')+' in this barangay, and has no derogatory record on file as of the date of this certification.',
      '',
      'This certification is being issued upon the request of the above-named person for '+a.purpose+' purposes.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  if(type === 'Certificate of Solo Parent'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that '+a.fullName+', of legal age, and a bonafide resident of '+loc+', is known to this office to be a solo parent under '+(a.soloCircumstance||'applicable circumstances')+', with '+(a.childrenCount||'1')+' child/children under '+a.possessive+' care and support.',
      '',
      'This certification is being issued to support '+a.possessive+' application for a Solo Parent ID / benefits under Republic Act No. 11861 (Expanded Solo Parents Welfare Act), and for whatever legal purpose it may serve.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  if(type === 'Barangay Endorsement'){
    return [
      formatDate(a.issueDate),
      '',
      (a.receivingOffice || 'Concerned Office'),
      '',
      'Sir/Madam:',
      '',
      'This barangay is respectfully endorsing '+a.fullName+', of legal age, '+a.civilStatus+', and a resident of '+loc+', in connection with '+(a.endorsementReason||a.purpose)+'.',
      '',
      'This endorsement is issued for appropriate action and disposition by your good office, and for whatever legal purpose it may serve.',
      '',
      'Thank you for your usual courtesy and cooperation.',
      '',
      'Respectfully yours,'
    ];
  }
  if(type === 'Certificate of Low Income'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that '+a.fullName+', of legal age, '+a.civilStatus+', Filipino citizen, and residing at '+loc+', belongs to a low-income household with an estimated combined family monthly income of Php. '+(a.monthlyIncome||'0')+'.',
      '',
      'This certification is being issued upon the request of the above-named person for '+a.purpose+' purposes.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  if(type === 'Barangay ID'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that '+a.fullName+(a.birthDate ? (', born on '+formatDate(a.birthDate)) : '')+(a.birthplace ? (' at '+a.birthplace) : '')+', and residing at '+(a.address||loc)+', is a bonafide resident of this barangay and is entitled to a Barangay Identification Card.',
      '',
      'This certification is issued for identification and for whatever legal purpose it may serve.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  if(type === 'Blotter / Incident Report'){
    return [
      'TO WHOM IT MAY CONCERN:',
      '',
      'This is to certify that an incident was recorded involving '+a.fullName+', resident of '+(a.address||loc)+'.',
      '',
      'Details: '+(a.incidentDetails||a.purpose)+'.',
      '',
      'Issued this '+issueLong+', at '+loc+'.'
    ];
  }
  // Default / Barangay Certification (General Purpose)
  return [
    'TO WHOM IT MAY CONCERN:',
    '',
    'This is to certify that '+a.fullName+', of legal age, '+a.civilStatus+', Filipino citizen, and residing at '+(a.address||loc)+', is personally known to this office and is a bonafide resident of this barangay.',
    '',
    'This certification is being issued upon the request of the above-named person for '+a.purpose+', and for whatever legal purpose it may serve.',
    '',
    'Issued this '+issueLong+', at '+loc+'.'
  ];
}
