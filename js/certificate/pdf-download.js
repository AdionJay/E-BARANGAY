/**
 * Download / view / print released certificates.
 * Defines: triggerPdfBytesDownload(), downloadDocumentPDF(), viewFilledDocument(), printDocumentFallback()
 */
function triggerPdfBytesDownload(uint8, fileName){
  var blob = new Blob([uint8], { type: 'application/pdf' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'document.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
}

function downloadDocumentPDF(id){
  var d = data.documents.find(function(x){ return x.id === id; });
  if(!d){ showToast('Document not found','error'); return; }
  var u = data.currentUser;
  var isOwner = u && u.role === 'Resident' && u.residentId === d.residentId;
  var isStaff = u && (u.role === 'Admin' || u.role === 'Secretary' || u.role === 'Treasurer');
  if(!isOwner && !isStaff){
    showToast('You do not have access to this document','error');
    return;
  }
  if(isOwner && d.status !== 'Released'){
    showToast('Document is not yet released','error');
    return;
  }

  showToast('Preparing document with barangay logo…');
  Promise.resolve(generateFilledDocumentPDF(d, { download: true, async: true }))
    .then(function(){
      showToast('Download started — filled document ready');
      if(isOwner){
        d.received = true;
        d.downloadedAt = today();
        saveData();
        if($('#module-myrequests') && $('#module-myrequests').classList.contains('active')) renderMyRequests();
        if($('#module-portal') && $('#module-portal').classList.contains('active')) renderPortal();
      }
    })
    .catch(function(err){
      console.error(err);
      showToast('Could not generate document','error');
    });
}

function viewFilledDocument(id){
  var d = data.documents.find(function(x){ return x.id === id; });
  if(!d){ showToast('Document not found','error'); return; }
  var u = data.currentUser;
  var isOwner = u && u.role === 'Resident' && u.residentId === d.residentId;
  var isStaff = u && (u.role === 'Admin' || u.role === 'Secretary' || u.role === 'Treasurer');
  if(!isOwner && !isStaff){ showToast('Access denied','error'); return; }
  if(isOwner && d.status !== 'Released'){ showToast('Document is not yet released','error'); return; }
  // Same auto-filled template secretary/treasurer see during review
  openFilledDocumentViewer(d, d.type+' — '+getResidentName(d.residentId)+' (Auto-filled)');
}

function printDocumentFallback(d,r,p){
  var a = getApplicantDetails(d, r);
  var bodyLines = buildOfficialDocumentBody(d, a);
  printFilledDocumentFallback(d, a, bodyLines, true);
}
