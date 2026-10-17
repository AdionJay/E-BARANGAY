/**
 * Staff action: send a released PDF to the resident.
 * Defines: sendDocumentPDF(), attachPdfAssetToDocument()
 */
function sendDocumentPDF(id){
  var d = data.documents.find(function(x){ return x.id === id; });
  if(!d){ showToast('Document not found','error'); return; }
  if(d.status !== 'Released'){ showToast('Only released documents can be sent','error'); return; }
  var path = getDocumentAsset(d.type);
  if(!path){ showToast('No PDF template is linked for '+d.type,'error'); return; }
  d.pdfAsset = path;
  d.pdfSent = true;
  d.pdfSentDate = today();
  addNotif('PDF Sent to Resident','Your '+d.type+' PDF is now available in My Requests.','success','Resident',d.residentId,'document');
  saveData();
  showToast('PDF template sent to resident');
  if($('#module-secretary') && $('#module-secretary').classList.contains('active')) renderSecretary();
  if($('#module-documents') && $('#module-documents').classList.contains('active')) renderDocuments();
  if($('#module-treasurer') && $('#module-treasurer').classList.contains('active')) renderTreasurer();
  updateNotifBadge();
}

function attachPdfAssetToDocument(d){
  if(!d) return;
  var path = getDocumentAsset(d.type);
  if(path){
    d.pdfAsset = path;
    d.pdfSent = true;
    d.pdfSentDate = today();
  }
}
