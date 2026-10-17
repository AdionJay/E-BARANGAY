/**
 * Captain dashboard: approve, reject and release documents.
 * Defines: renderCaptain(), approveDocument(), confirmApproveWithSig(), rejectDocument(), releaseDocument()
 */
function renderCaptain(){
  var docs = data.documents.slice().sort(function(a,b){ return (b.requestDate||'').localeCompare(a.requestDate||''); });
  var pays = data.payments.slice().sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });
  var pending = docs.filter(function(d){ return ['Pending','Under Review','Payment Pending'].indexOf(d.status)>=0; });
  var released = docs.filter(function(d){ return d.status==='Released'; });
  var rejected = docs.filter(function(d){ return d.status==='Rejected'; });
  var paidAmt = pays.filter(function(p){ return p.status==='Paid'&&p.verified; }).reduce(function(s,p){ return s+(p.amount||0); },0);
  var pendingPay = pays.filter(function(p){ return p.status==='Pending'; }).length;
  var verifiedRes = data.residents.filter(function(r){ return r.verified; }).length;

  if($('#capStatPending')) $('#capStatPending').textContent = pending.length;
  if($('#capStatReleased')) $('#capStatReleased').textContent = released.length;
  if($('#capStatPayments')) $('#capStatPayments').textContent = '₱'+paidAmt.toFixed(2);
  if($('#capStatResidents')) $('#capStatResidents').textContent = verifiedRes;
  if($('#capStatRejected')) $('#capStatRejected').textContent = rejected.length;
  if($('#capStatPayPending')) $('#capStatPayPending').textContent = pendingPay;

  // All document transactions (review only)
  if($('#capDocsTable')){
    $('#capDocsTable').innerHTML = docs.map(function(d,idx){
      return '<tr><td>'+(idx+1)+'</td><td>'+d.type+'</td><td>'+getResidentName(d.residentId)+'</td><td>'+d.purpose+'</td><td>₱'+(d.fee||0).toFixed(2)+'</td><td>'+statusBadge(d.status)+'</td><td>'+formatDate(d.requestDate)+'</td><td>'+(d.endorsedBy||'—')+'</td><td>'+(d.orNumber||'—')+'</td><td><button class="btn btn-sm btn-outline" onclick="viewDocument('+d.id+')">View</button></td></tr>';
    }).join('') || '<tr><td colspan="10" class="empty-state">No document transactions yet</td></tr>';
  }

  // Payment transactions from Treasurer
  if($('#capPaysTable')){
    $('#capPaysTable').innerHTML = pays.map(function(p,idx){
      var m = p.paymentMethod ? '<span class="badge badge-info">'+p.paymentMethod+'</span>' : '—';
      return '<tr><td>'+(idx+1)+'</td><td>'+formatDate(p.date)+'</td><td>'+getResidentName(p.residentId)+'</td><td>'+p.type+'</td><td>₱'+(p.amount||0).toFixed(2)+'</td><td>'+m+'</td><td>'+(p.orNumber||p.gcashRef||'—')+'</td><td>'+statusBadge(p.status)+'</td><td>'+(p.verifiedBy||'—')+'</td></tr>';
    }).join('') || '<tr><td colspan="9" class="empty-state">No payment transactions yet</td></tr>';
  }

  // Recent activity feed (from notifications for officials)
  if($('#capActivityList')){
    var acts = (data.notifications||[]).filter(function(n){
      return n.forRole==='Captain' || n.forRole==='Secretary' || n.forRole==='Treasurer' || n.forRole==='Admin';
    }).slice(0,15);
    $('#capActivityList').innerHTML = acts.length ? acts.map(function(n){
      var cat = n.category==='payment'?'💰':n.category==='document'?'📄':'🔔';
      return '<li class="notif-item is-read"><div class="notif-icon" style="background:var(--primary-soft);color:var(--primary)">'+cat+'</div><div class="notif-content"><h4>'+escapeHtml(n.title)+'</h4><p>'+escapeHtml(n.message)+'</p><div class="notif-time">'+(n.time||'')+' · '+(n.forRole||'')+'</div></div></li>';
    }).join('') : '<div class="empty-state">No recent official activity</div>';
  }
}

function approveDocument(id){
  showToast('Captain approval step removed. Documents auto-release after Treasurer verifies payment (or free docs after Secretary endorse).','error');
}

function confirmApproveWithSig(){
  var id=parseInt($('#capApproveDocId').value);
  var d=data.documents.find(function(x){return x.id===id;}); if(!d)return;
  var sig = data.captainSignature;
  var canvas=$('#capApproveSigCanvas');
  if(canvas){
    // If user drew something (non-blank), use it
    var ctx=canvas.getContext('2d');
    var blank=true;
    try {
      var pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      for(var i=0;i<pixels.length;i+=4){ if(pixels[i+3]>10){ blank=false; break; } }
    } catch(e){}
    if(!blank) sig = canvas.toDataURL('image/png');
  }
  if(!sig){ showToast('Please draw or save an electronic signature first','error'); return; }
  d.status='Approved'; d.approvedBy=data.currentUser.name; d.approvedDate=today();
  d.signature=sig;
  addNotif('Document Approved','Your '+d.type+' was approved by the Captain and is ready for release.','success','Resident',d.residentId,'document');
  saveData(); closeModal('capApproveModal'); showToast('Approved with electronic signature');
  renderCaptain(); updateNotifBadge();
}

function rejectDocument(id){
  openConfirmModal({
    title: 'Reject Request',
    message: 'Reject this request?',
    okLabel: 'Reject',
    variant: 'warn',
    onConfirm: function(){
  var d=data.documents.find(function(x){return x.id===id;}); if(!d)return;
  d.status='Rejected';
  addNotif('Request Rejected','Your '+d.type+' was rejected','warning','Resident',d.residentId,'document');
  saveData(); showToast('Rejected'); renderCaptain(); updateNotifBadge();

    }
  });
}

function releaseDocument(id){
  showToast('Manual release removed. Documents are auto-released after Treasurer payment verification.','error');
}
