/**
 * Barangay services list.
 * Defines: renderServices(), openServiceModal(), saveService(), completeService(), deleteService()
 */
function renderServices(){
  $('#servicesTable').innerHTML=data.services.map(function(s,idx){
    return '<tr><td>'+(idx+1)+'</td><td><strong>'+s.name+'</strong></td><td>'+s.description+'</td><td>'+formatDate(s.date)+'</td><td>'+statusBadge(s.status)+'</td><td>'+s.beneficiaries+'</td><td>'+(s.status!=='Completed'?'<button class="btn btn-sm btn-success" onclick="completeService('+s.id+')">Complete</button> ':'')+'<button class="btn btn-sm btn-danger" onclick="deleteService('+s.id+')">Delete</button></td></tr>';
  }).join('')||'<tr><td colspan="7">No services</td></tr>';
}

function openServiceModal(){ $('#svcName').value='';$('#svcDesc').value='';$('#svcDate').value=''; $('#serviceModal').classList.add('active'); }

function saveService(){ var name=$('#svcName').value.trim(),date=$('#svcDate').value; if(!name||!date){showToast('Required','error');return;} data.services.push({id:nextId(data.services),name:name,description:$('#svcDesc').value.trim(),date:date,status:'Upcoming',beneficiaries:0}); saveData(); closeModal('serviceModal'); showToast('Added'); renderServices(); }

function completeService(id){ var s=data.services.find(function(x){return x.id===id;}); if(s){s.status='Completed';s.beneficiaries=Math.floor(Math.random()*50)+10;saveData();showToast('Completed');renderServices();} }

function deleteService(id){
  openConfirmModal({
    title: 'Delete Service',
    message: 'Delete service?',
    okLabel: 'Delete',
    variant: 'danger',
    onConfirm: function(){ data.services=data.services.filter(function(s){return s.id!==id;}); saveData(); showToast('Deleted'); renderServices(); 
    }
  });
}
