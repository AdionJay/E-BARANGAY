/**
 * Resident portal home (services, my documents, payments).
 * Defines: renderPortal(), portalRequestType()
 */
function renderPortal(){
  var u=data.currentUser; var resident=null;
  if(u.role==='Resident'&&u.residentId) resident=data.residents.find(function(r){return r.id===u.residentId;});
  var welcome='Welcome to the Resident Portal';
  if(resident){
    welcome='Welcome, <strong>'+resident.firstName+' '+resident.lastName+'</strong>!';
    welcome+=resident.verified?' <span class="badge badge-success">Verified Resident</span>':' <span class="badge badge-warning">Pending Residency Verification</span>';
    if(resident.idVerified) welcome+=' <span class="badge badge-info">ID ✓</span>';
  }
  $('#portalWelcome').innerHTML=welcome;
  $('#portalServices').innerHTML=getDocTypes().map(function(t){
    var safe=t.name.replace(/'/g,"\\'");
    var icon=getDocTypeIcon(t.name);
    var feeLabel = (t.fee && Number(t.fee) > 0) ? ('Fee: ₱'+Number(t.fee).toFixed(2)) : 'Free';
    return '<div class="service-card">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">'
      +'<span class="badge badge-success" style="font-size:11px;letter-spacing:0.02em;">Available Document</span>'
      +'</div>'
      +'<div class="icon service-type-icon"><i class="fas '+icon+'"></i></div>'
      +'<h4>'+t.name+'</h4>'
      +'<p style="font-weight:600;color:#1d4ed8;">'+feeLabel+'</p>'
      +'<button type="button" class="btn btn-sm btn-primary service-request-btn" style="margin-top:10px;width:100%;" onclick="event.stopPropagation();portalRequestType(\''+safe+'\')">Request Document</button>'
      +'</div>';
  }).join('');
  var myDocs=resident?data.documents.filter(function(d){return d.residentId===resident.id;}):[];
  $('#portalDocs').innerHTML=myDocs.map(function(d){
    var actions='';
    if(d.status==='Payment Pending'){
      var pay=data.payments.find(function(p){return p.documentId===d.id&&p.status==='Pending';});
      if(pay){
        if(pay.gcashRef){
          actions='<span class="badge badge-warning">Proof submitted — awaiting Treasurer verification</span> <button class="btn btn-sm btn-outline" onclick="openResidentGcashPay('+pay.id+')">Update Ref</button>';
        } else {
          actions='<button class="btn btn-sm btn-success" onclick="openResidentGcashPay('+pay.id+')">Pay ₱'+d.fee+' GCash</button>';
        }
      }
    }
    if(d.status==='Released') {
      actions+='<button class="btn btn-sm btn-primary" onclick="downloadDocumentPDF('+d.id+')"><i class="fas fa-download"></i> Download File</button> ';
      actions+='<button class="btn btn-sm btn-outline" onclick="viewFilledDocument('+d.id+')">View Filled</button> ';
      actions+='<button class="btn btn-sm btn-danger" onclick="deleteDocument('+d.id+');renderPortal();">Delete</button>';
    }
    return '<tr><td>'+d.type+'</td><td>'+d.purpose+'</td><td>₱'+(d.fee||0)+'</td><td>'+statusBadge(d.status)+'</td><td>'+formatDate(d.requestDate)+'</td><td>'+actions+'</td></tr>';
  }).join('')||'<tr><td colspan="6">No requests yet — use services above or My Requests</td></tr>';
  var myPays=resident?data.payments.filter(function(p){return p.residentId===resident.id;}):[];
  $('#portalPays').innerHTML=myPays.map(function(p){
    var m=p.paymentMethod?' <span class="badge badge-info">'+p.paymentMethod+'</span>':'';
    if(p.gcashRef && p.status==='Pending') m+=' <span class="badge badge-warning">Proof submitted</span> <small>'+p.gcashRef+'</small>';
    var payBtn='';
    if(p.status==='Pending'){
      if(p.gcashRef){
        payBtn=' <button class="btn btn-sm btn-outline" onclick="openResidentGcashPay('+p.id+')">Update Ref</button>';
      } else {
        payBtn=' <button class="btn btn-sm btn-success" onclick="openResidentGcashPay('+p.id+')">Pay via GCash</button>';
      }
    }
    var stDisplay = (p.status==='Pending' && p.gcashRef) ? '<span class="badge badge-warning">Awaiting Verification</span>' : statusBadge(p.status);
    var rcptBtn=(p.status==='Paid'&&p.verified)?(' <button class="btn btn-sm btn-outline" onclick="openPaymentReceipt('+p.id+')"><i class="fas fa-receipt"></i> View Receipt</button>'):'';
    return '<tr><td>'+p.type+'</td><td>₱'+p.amount.toFixed(2)+'</td><td>'+stDisplay+m+payBtn+rcptBtn+'</td><td>'+formatDate(p.date)+'</td><td><button class="btn btn-sm btn-danger" onclick="deletePayment('+p.id+');renderPortal();">Delete</button></td></tr>';
  }).join('')||'<tr><td colspan="5">No payments</td></tr>';
}

function portalRequestType(type){
  if(role()!=='Resident'){ showToast('Login as Resident','error'); return; }
  var res=data.residents.find(function(r){return r.id===data.currentUser.residentId;});
  if(!res||!res.verified){ showToast('ACCESS DENIED — Not a verified resident. Wait for Secretary verification.','error'); return; }
  // Auto-fill resident profile; lock document type from the card/PDF they chose
  openDocumentModal({ type: type || '', lockType: !!type });
}
