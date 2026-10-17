/**
 * Open a document (auto-filled PDF) for review.
 * Defines: viewDocument()
 */
function viewDocument(id){
  var d=data.documents.find(function(x){return x.id===id;}); if(!d)return;
  var r=data.residents.find(function(x){return x.id===d.residentId;});
  var asset = d.pdfAsset || getDocumentAsset(d.type);
  var canManage = data.currentUser && (data.currentUser.role==='Admin' || data.currentUser.role==='Secretary' || data.currentUser.role==='Treasurer');
  var roleName = data.currentUser ? data.currentUser.role : '';
  var isResident = data.currentUser && data.currentUser.role === 'Resident';

  // RESIDENT: cannot see official filled document until Released (after payment verified / free endorse)
  if(isResident){
    if(d.status !== 'Released'){
      showToast('Bayad muna bago makita ang official document. Status: '+(d.status||'Pending')+(d.fee>0?' — Magbayad ng ₱'+Number(d.fee).toFixed(2):''),'error');
      // Show only request summary (no filled official PDF)
      var pay = (data.payments||[]).find(function(p){ return p.documentId===d.id; });
      var payNote = '';
      if(d.status==='Payment Pending' && pay){
        payNote = pay.gcashRef
          ? '<p style="margin-top:8px;"><span class="badge badge-warning">Proof submitted</span> Awaiting Treasurer verification.</p>'
          : '<p style="margin-top:8px;"><button class="btn btn-sm btn-success" onclick="closeModal(\'docPreviewModal\');openResidentGcashPay('+pay.id+')">Pay ₱'+(d.fee||0)+' via GCash</button></p>';
      }
      if($('#docPreviewBody')){
        $('#docPreviewBody').innerHTML =
          '<div class="doc-preview">'+
            '<p style="font-size:14px;margin-bottom:8px;"><strong>'+d.type+'</strong></p>'+
            '<p style="font-size:13px;color:var(--text-muted);">Status: '+statusBadge(d.status)+' · Fee: ₱'+(Number(d.fee)||0).toFixed(2)+'</p>'+
            '<p style="font-size:13px;margin-top:10px;color:#b45309;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px;">'+
              '<strong>🔒 Official document locked</strong><br>Kailangan muna magbayad at ma-verify ng Treasurer bago mo makita o ma-download ang official document na may personal information mo.'+
            '</p>'+
            '<p style="font-size:12px;margin-top:8px;">Purpose: '+(d.purpose||'—')+' · Requested: '+formatDate(d.requestDate)+'</p>'+
            payNote+
          '</div>';
        $('#docPreviewModal').classList.add('active');
      }
      return;
    }
    // Released: allow filled view
    openFilledDocumentViewer(d, d.type+' — '+getResidentName(d.residentId)+' (Auto-filled)');
    return;
  }

  // Staff: always show auto-filled document for review
  openFilledDocumentViewer(d, d.type+' — '+getResidentName(d.residentId)+' (Auto-filled)');

  if(canManage){
    // Summary only — no action buttons (Close is on the modal footer)
    $('#docPreviewBody').innerHTML=
      '<div class="doc-preview">'+
        '<p style="font-size:13px;margin-bottom:8px;"><strong>'+d.type+'</strong> for <strong>'+getResidentName(d.residentId)+'</strong></p>'+
        '<p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Purpose: '+(d.purpose||'—')+' · Status: '+statusBadge(d.status)+' · Fee: ₱'+(Number(d.fee)||0).toFixed(2)+' · OR: '+(d.orNumber||'N/A')+'</p>'+
        (r ? '<p style="font-size:12px;margin-bottom:8px;">Resident: '+(r.firstName+' '+(r.middleName||'')+' '+r.lastName).replace(/\s+/g,' ').trim()+' · '+(r.civilStatus||'')+' · '+(r.address||'')+'</p>' : '')+
        '<p style="font-size:12px;color:var(--text-muted);">Document details only. Use Close to exit.</p>'+
      '</div>';
    $('#docPreviewModal').classList.add('active');
  }
}
