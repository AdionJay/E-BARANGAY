/**
 * Resident "My Requests" screen.
 * Defines: renderMyRequests()
 */
function renderMyRequests(){
  var u=data.currentUser;
  if(!u||u.role!=='Resident'||!u.residentId){
    if($('#myRequestsTable')) $('#myRequestsTable').innerHTML='<tr><td colspan="8" class="empty-state">Login as Resident</td></tr>';
    return;
  }
  var rid=u.residentId;
  var docs=data.documents.filter(function(d){return d.residentId===rid;});
  $('#reqStatTotal').textContent=docs.length;
  $('#reqStatPending').textContent=docs.filter(function(d){return ['Pending','Under Review','Payment Pending','For Captain Approval','Approved'].indexOf(d.status)>=0;}).length;
  $('#reqStatReleased').textContent=docs.filter(function(d){return d.status==='Released';}).length;
  $('#reqStatPay').textContent=docs.filter(function(d){return d.status==='Payment Pending';}).length;

  $('#myRequestsTable').innerHTML=docs.map(function(d,idx){
    var actions='';
    if(d.status==='Payment Pending'){
      var pay=data.payments.find(function(p){return p.documentId===d.id&&p.status==='Pending';});
      if(pay){
        if(pay.gcashRef){
          actions+='<span class="badge badge-warning">Proof submitted — awaiting verification</span> <button class="btn btn-sm btn-outline" onclick="openResidentGcashPay('+pay.id+')">Update Ref</button> ';
        } else {
          actions+='<button class="btn btn-sm btn-success" onclick="openResidentGcashPay('+pay.id+')">Pay ₱'+(d.fee||0)+' via GCash</button> ';
        }
      }
    }
    if(d.status==='Released'){
      actions+='<button class="btn btn-sm btn-primary" onclick="downloadDocumentPDF('+d.id+')"><i class="fas fa-download"></i> Download File</button> ';
      actions+='<button class="btn btn-sm btn-outline" onclick="viewFilledDocument('+d.id+')">View Official</button> ';
    } else if(d.status==='Payment Pending'){
      actions+='<button class="btn btn-sm btn-outline" onclick="viewDocument('+d.id+')">Status / Pay</button> ';
    } else {
      actions+='<button class="btn btn-sm btn-outline" onclick="viewDocument('+d.id+')">Status</button> ';
    }
    var paidRec = data.payments.find(function(p){ return p.documentId===d.id && p.status==='Paid' && p.verified; });
    if(paidRec){
      actions+='<button class="btn btn-sm btn-outline" onclick="openPaymentReceipt('+paidRec.id+')"><i class="fas fa-receipt"></i> Receipt</button> ';
    }
    actions+='<button class="btn btn-sm btn-danger" onclick="deleteDocument('+d.id+');renderMyRequests();">Delete</button>';
    return '<tr><td>'+(idx+1)+'</td><td><strong>'+d.type+'</strong></td><td>'+d.purpose+'</td><td>₱'+(d.fee||0).toFixed(2)+'</td><td>'+statusBadge(d.status)+'</td><td>'+formatDate(d.requestDate)+'</td><td>'+formatDate(d.releaseDate)+'</td><td>'+actions+'</td></tr>';
  }).join('')||'<tr><td colspan="8" class="empty-state">No requests yet. Go to Resident Portal to request a document.</td></tr>';

  // Document-only notifs for this resident
  var notifs=data.notifications.filter(function(n){
    return n.residentId===rid && (n.category==='document' || (n.title&&n.title.toLowerCase().indexOf('document')>=0) || (n.title&&n.title.toLowerCase().indexOf('request')>=0) || (n.title&&n.title.toLowerCase().indexOf('released')>=0) || (n.title&&n.title.toLowerCase().indexOf('approved')>=0));
  }).slice(0,10);
  if($('#myReqNotifs')){
    $('#myReqNotifs').innerHTML=notifs.map(function(n){
      var bg=n.type==='success'?'#d1fae5':n.type==='warning'?'#fef3c7':'#dbeafe';
      var col=n.type==='success'?'#059669':n.type==='warning'?'#d97706':'#2563eb';
      return '<li class="notif-item"><div class="notif-icon" style="background:'+bg+';color:'+col+'">📄</div><div class="notif-content"><h4>'+n.title+'</h4><p>'+n.message+'</p><div class="notif-time">'+n.time+'</div></div><button class="btn btn-sm btn-danger" onclick="deleteNotification('+n.id+');renderMyRequests();">Delete</button></li>';
    }).join('')||'<div class="empty-state">No document notifications yet</div>';
  }
}
