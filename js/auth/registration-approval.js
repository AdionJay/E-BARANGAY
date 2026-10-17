/**
 * Secretary approval / rejection of pending registrations.
 * Defines: renderPendingRegistrations(), approveRegistration(), rejectRegistration()
 */
function renderPendingRegistrations(){
  var pending=data.pendingRegistrations.filter(function(r){return r.status==='Pending';});
  var html=pending.map(function(r,idx){
    return '<tr><td>'+(idx+1)+'</td><td>'+r.username+'</td><td>'+r.firstName+' '+r.lastName+'</td><td>'+r.address+'</td><td>'+(r.purok||'—')+'</td><td>'+r.contact+'</td><td>'+formatDate(r.submitted)+'</td><td><button class="btn btn-sm btn-success" onclick="approveRegistration('+r.id+')">✓ Approve</button> <button class="btn btn-sm btn-danger" onclick="rejectRegistration('+r.id+')">Reject</button></td></tr>';
  }).join('')||'<tr><td colspan="8" class="empty-state">No pending registrations</td></tr>';
  if($('#pendingRegTable')) $('#pendingRegTable').innerHTML=html;
  if($('#pendingRegTableSec')) $('#pendingRegTableSec').innerHTML=html;
  if($('#regStatPending')) $('#regStatPending').textContent=pending.length;
}

function approveRegistration(id){
  var reg=data.pendingRegistrations.find(function(r){return r.id===id;}); if(!reg)return;
  var residentId=nextId(data.residents);
  data.residents.push({id:residentId,firstName:reg.firstName,lastName:reg.lastName,middleName:reg.middleName||'',birthDate:'',gender:'Male',civilStatus:'Single',address:reg.address,purok:reg.purok||'',contact:reg.contact||'',occupation:'',voter:false,senior:false,pwd:false,status:'Active',verified:false,verifiedBy:null,verifiedDate:null,registered:today(),proof:reg.proof||null,nationalId:null,idVerified:false,idVerifiedDate:null,idImage:null,ocrText:null,ocrName:null,profilePic:null});
  renumberResidents();
  // Find new id after renumber
  var newRes=data.residents.find(function(r){return r.firstName===reg.firstName&&r.lastName===reg.lastName&&r.registered===today();});
  var rid=newRes?newRes.id:residentId;
  data.users.push({username:reg.username,password:reg.password,role:'Resident',name:reg.firstName+' '+reg.lastName,residentId:rid});
  reg.status='Approved';
  addNotif('Registration Approved','Your account was approved. You may now log in.','success','Resident',rid,'account');
  addNotif('New Resident',reg.firstName+' '+reg.lastName+' approved — needs residency verification','warning','Secretary',null,'account');
  saveData(); showToast('Approved — account created'); renderPendingRegistrations(); updateNotifBadge();
}

function rejectRegistration(id){
  openConfirmModal({
    title: 'Reject Registration',
    message: 'Reject this registration?',
    okLabel: 'Reject',
    variant: 'warn',
    onConfirm: function(){
  var reg=data.pendingRegistrations.find(function(r){return r.id===id;}); if(!reg)return;
  reg.status='Rejected'; saveData(); showToast('Rejected'); renderPendingRegistrations();

    }
  });
}
