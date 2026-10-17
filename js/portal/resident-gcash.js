/**
 * Resident GCash payment submission.
 * Defines: openResidentGcashPay(), submitResidentGcashPay()
 */
function openResidentGcashPay(paymentId){
  var p=data.payments.find(function(x){return x.id===paymentId;});
  if(!p||p.status!=='Pending'){ showToast('Payment not available','error'); return; }
  $('#resGcashPayId').value=paymentId;
  $('#resGcashAmount').textContent='₱'+p.amount.toFixed(2);
  $('#resGcashType').textContent=p.type;
  if($('#resGcashNum')) $('#resGcashNum').textContent=data.gcashAccount.number;
  if($('#resGcashAccName')) $('#resGcashAccName').textContent=data.gcashAccount.name;
  $('#resGcashRef').value=p.gcashRef||'';
  $('#resGcashModal').classList.add('active');
}

function submitResidentGcashPay(){
  var id=parseInt($('#resGcashPayId').value);
  var ref=$('#resGcashRef').value.trim();
  if(!ref){ showToast('Enter GCash reference number','error'); return; }
  var p=data.payments.find(function(x){return x.id===id;});
  if(!p) return;
  if(p.status!=='Pending'){ showToast('Payment not available','error'); return; }
  // Resident only submits proof of payment — stays Pending until Treasurer reviews GCash and verifies
  p.paymentMethod='GCash';
  p.gcashRef=ref;
  p.proofSubmittedDate=today();
  p.verified=false; p.verifiedBy=null; p.verifiedDate=null;
  // Do NOT mark Paid / do NOT set document.paid — Treasurer must verify first
  if(p.documentId){
    var d=data.documents.find(function(x){return x.id===p.documentId;});
    if(d&&d.status==='Payment Pending'){
      addNotif('GCash Proof Submitted','Resident submitted GCash ref for '+p.type+' (Ref: '+ref+'). Please review in your GCash account before verifying.','warning','Treasurer',null,'payment');
      addNotif('Payment Proof Submitted','Your GCash reference for '+p.type+' was submitted. Awaiting Treasurer review and verification.','info','Resident',p.residentId,'payment');
    }
  } else {
    addNotif('GCash Proof Submitted','Resident submitted GCash ref for '+p.type+' (Ref: '+ref+'). Please review in your GCash account before verifying.','warning','Treasurer',null,'payment');
  }
  saveData(); closeModal('resGcashModal'); showToast('Proof of payment submitted — Treasurer will review GCash then verify');
  renderPortal();
  if(typeof renderMyRequests==='function') try{ renderMyRequests(); }catch(e){}
  updateNotifBadge();
}
