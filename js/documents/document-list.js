/**
 * Staff document table, delete document.
 * Defines: renderDocuments(), deleteDocument()
 */
function renderDocuments(){
  var search=($('#docSearch')&&$('#docSearch').value||'').toLowerCase();
  var list=data.documents;
  if(search) list=list.filter(function(d){return d.type.toLowerCase().indexOf(search)>=0||getResidentName(d.residentId).toLowerCase().indexOf(search)>=0;});
  $('#documentsTable').innerHTML=list.map(function(d,idx){
    var actions='<button class="btn btn-sm btn-outline" onclick="viewDocument('+d.id+')">View PDF</button> ';
    if(d.status==='Released') actions+='<button class="btn btn-sm btn-success" onclick="sendDocumentPDF('+d.id+')">Send PDF</button> ';
    actions+='<button class="btn btn-sm btn-danger" onclick="deleteDocument('+d.id+')">Delete</button>';
    var requesterCell=getResidentName(d.residentId)+(d.onBehalfOf?'<br><span style="font-size:11px;color:#c2410c;">on behalf of: '+(d.applicantName||'')+'</span>':'');
    return '<tr><td>'+(idx+1)+'</td><td>'+d.type+'</td><td>'+requesterCell+'</td><td>'+d.purpose+'</td><td>'+statusBadge(d.status)+'</td><td>'+formatDate(d.requestDate)+'</td><td>'+(d.orNumber||'—')+'</td><td>'+actions+'</td></tr>';
  }).join('')||'<tr><td colspan="8">No documents</td></tr>';
}

function deleteDocument(id){
  openConfirmModal({
    title: 'Delete Document',
    message: 'Delete this document transaction? Related payments will also be removed.',
    okLabel: 'Delete',
    variant: 'danger',
    onConfirm: function(){
  data.payments=data.payments.filter(function(p){return p.documentId!==id;});
  data.documents=data.documents.filter(function(d){return d.id!==id;});
  // Auto-renumber documents 1..N and fix payment.documentId links
  var dmap={};
  data.documents.forEach(function(d,i){ dmap[d.id]=i+1; d.id=i+1; });
  data.payments.forEach(function(p){ if(p.documentId&&dmap[p.documentId]) p.documentId=dmap[p.documentId]; });
  // Renumber payments too
  data.payments.forEach(function(p,i){ p.id=i+1; });
  saveData(); showToast('Document deleted — lists renumbered');
  if($('#module-documents')&&$('#module-documents').classList.contains('active')) renderDocuments();
  if($('#module-secretary')&&$('#module-secretary').classList.contains('active')) renderSecretary();
  if($('#module-captain')&&$('#module-captain').classList.contains('active')) renderCaptain();
  if($('#module-treasurer')&&$('#module-treasurer').classList.contains('active')) renderTreasurer();

    }
  });
}
