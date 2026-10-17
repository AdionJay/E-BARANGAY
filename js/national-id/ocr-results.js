/**
 * Show OCR results, confirm or clear ID verification.
 * Defines: _ocrMatchScore, showOcrResults(), confirmOcrVerification(), clearNationalId()
 */
var _ocrMatchScore = 0;

function showOcrResults(dataUrl, text){
  $('#ocrProgress').style.display = 'none';
  $('#ocrResult').style.display = 'block';
  $('#ocrConfirmBtn').style.display = 'inline-flex';

  $('#ocrPreviewImg').src = dataUrl;
  if($('#ocrRawText')) $('#ocrRawText').textContent = '';

  var parsed = parsePhilId(text);
  // Prefer structured full name
  var displayName = parsed.name || '';
  if(!displayName && (parsed.firstName || parsed.lastName)){
    displayName = [parsed.firstName, parsed.middleName, parsed.lastName].filter(Boolean).join(' ');
  }
  if($('#ocrIdNumber')) $('#ocrIdNumber').value = parsed.idNumber || '';
  if($('#ocrName')) $('#ocrName').value = displayName || '';
  if($('#ocrGender')) $('#ocrGender').value = parsed.gender || '';
  if($('#ocrBirthDate')) $('#ocrBirthDate').value = parsed.birthDate || '';
  if($('#ocrAddress')) $('#ocrAddress').value = parsed.address || '';

  var u = data.currentUser;
  var r = u ? data.residents.find(function(x){ return x.id === u.residentId; }) : null;
  var matchHtml = '';
  var detail = '';
  var score = 0;

  if(r){
    var nameScore = scoreNameMatch(r, displayName || ($('#ocrName')&&$('#ocrName').value) || '', parsed);
    score = nameScore.score;
    if(parsed.idNumber) score = Math.min(100, score); else score = Math.min(score, 85);
    if(parsed.idNumber && nameScore.hasLast && nameScore.hasFirst) score = Math.max(score, 95);
    if(parsed.idNumber && nameScore.score >= 100) score = 100;

    _ocrMatchScore = score;
    var bar = $('#ocrMatchBar');
    if(bar){
      bar.style.width = score + '%';
      bar.style.background = score >= 95 ? '#059669' : (score >= 70 ? '#d97706' : '#dc2626');
    }

    if(score >= 95 && parsed.idNumber){
      matchHtml = '<span class="badge badge-success">'+score+'% match</span> — ID number found; first & last name match your profile';
      detail = nameScore.detail + ' · PhilSys number detected';
    } else if(score >= 70){
      matchHtml = '<span class="badge badge-warning">'+score+'% match</span> — Review fields; verification requires first + last name match and ID number';
      detail = nameScore.detail + (parsed.idNumber ? '' : ' · ID number missing');
    } else {
      matchHtml = '<span class="badge badge-danger">'+score+'% match</span> — Name on ID does not sufficiently match your resident profile';
      detail = nameScore.detail + ' · Update your profile name or use a clearer ID photo';
    }
  }
  if($('#ocrMatchStatus')) $('#ocrMatchStatus').innerHTML = matchHtml || '—';
  if($('#ocrMatchDetail')) $('#ocrMatchDetail').textContent = detail || '';
}

function confirmOcrVerification(){
  var idNum = ($('#ocrIdNumber') && $('#ocrIdNumber').value.trim()) || '';
  var name = ($('#ocrName') && $('#ocrName').value.trim()) || '';
  // Image is required; fields are helpful but Secretary verifies via photo
  if(!_ocrPendingImage){ showToast('Please upload or scan your National ID image first','error'); return; }
  if(!idNum && !name){
    // still allow submit with image only — secretary reviews photo
    if(!confirm('No ID number or name detected. Submit the ID image for Secretary review anyway?')) return;
  }

  var u = data.currentUser;
  var r = data.residents.find(function(x){ return x.id === u.residentId; });
  if(!r) return;

  r.nationalId = idNum || r.nationalId || '';
  r.idVerified = true; // means: ID image submitted for review
  r.idVerifiedDate = today();
  r.idImage = _ocrPendingImage;
  r.ocrText = null; // do not store raw OCR text
  r.ocrName = name || '';

  var g = ($('#ocrGender')&&$('#ocrGender').value.trim())||'';
  if(g && !r.gender) r.gender = /f/i.test(g) ? 'Female' : (/m/i.test(g) ? 'Male' : g);
  var bd = ($('#ocrBirthDate')&&$('#ocrBirthDate').value.trim())||'';
  if(bd && !r.birthDate) r.birthDate = bd;
  var addr = ($('#ocrAddress')&&$('#ocrAddress').value.trim())||'';
  // do not overwrite address automatically

  addNotif('National ID Uploaded', r.firstName + ' ' + r.lastName + ' uploaded National ID for Secretary review' + (idNum ? (' · '+idNum) : ''), 'info', 'Secretary', null, 'account');
  addNotif('National ID Uploaded', r.firstName + ' ' + r.lastName + ' uploaded National ID for review', 'info', 'Admin', null, 'account');
  saveData();
  closeModal('ocrModal');
  showToast('National ID submitted — waiting for Secretary verification');
  renderProfile();
  updateNotifBadge();
}

function clearNationalId(){
  openConfirmModal({
    title: 'Remove ID Verification',
    message: 'Remove National ID verification?',
    okLabel: 'Remove',
    variant: 'warn',
    onConfirm: function(){
  var u=data.currentUser;
  var r=data.residents.find(function(x){return x.id===u.residentId;});
  if(!r) return;
  r.idVerified=false; r.nationalId=null; r.idVerifiedDate=null; r.idImage=null; r.ocrText=null; r.ocrName=null;
  saveData(); showToast('National ID removed'); renderProfile();

    }
  });
}
