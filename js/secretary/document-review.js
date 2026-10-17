/**
 * Start review and endorse a document request.
 * Defines: startReview(), endorseDocument()
 */
function startReview(id){
  var d=data.documents.find(function(x){return x.id===id;}); if(!d)return;
  d.status='Under Review';
  addNotif('Under Review','Your '+d.type+' is under review','info','Resident',d.residentId,'document');
  saveData(); showToast('Under Review'); renderSecretary(); updateNotifBadge();
}

function endorseDocument(id){
  var d=data.documents.find(function(x){return x.id===id;}); if(!d)return;
  var res=data.residents.find(function(x){return x.id===d.residentId;});
  if(!res||!res.verified){ showToast('Resident not verified','error'); return; }
  d.endorsedBy=data.currentUser.name; d.endorsedDate=today();
  d.fee=getDocFee(d.type);
  if(d.fee>0){
    d.status='Payment Pending'; d.paid=false;
    data.payments.push({id:nextId(data.payments),documentId:d.id,residentId:d.residentId,type:d.type+' Fee',amount:d.fee,orNumber:null,date:today(),status:'Pending',verified:false,verifiedBy:null,verifiedDate:null,paymentMethod:null,gcashRef:null});
    addNotif('Payment Required','Pay ₱'+d.fee+' for '+d.type+' via GCash to '+data.gcashAccount.number,'warning','Resident',d.residentId,'payment');
    addNotif('Payment Pending',d.type+' fee ₱'+d.fee+' — verify after resident pays','warning','Treasurer',null,'payment');
    addNotif('Endorsed — Awaiting Payment','Your '+d.type+' was endorsed. Please pay ₱'+d.fee+'.','info','Resident',d.residentId,'document');
  } else {
    // Free document: auto-release after Secretary endorsement (no Captain verify)
    d.status='Released'; d.paid=true; d.releaseDate=today();
    d.orNumber=d.orNumber||('OR-'+new Date().getFullYear()+'-'+String(d.id).padStart(4,'0'));
    d.approvedBy=data.currentUser.name; d.approvedDate=today();
    attachPdfAssetToDocument(d);
    addNotif('Document Ready','Your '+d.type+' was released. The linked PDF is available in My Requests.','success','Resident',d.residentId,'document');
    addNotif('Document Auto-Released',d.type+' for '+getResidentName(d.residentId)+' released (free document)','info','Captain',null,'document');
  }
  saveData(); showToast(d.fee>0?'Endorsed — awaiting resident payment & Treasurer verification':'Endorsed & released (free) — resident can open PDF'); renderSecretary(); updateNotifBadge();
}
