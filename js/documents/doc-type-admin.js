/**
 * Admin/Secretary screen to add, edit and delete document types.
 * Defines: renderDocTypesTable(), openAddDocType(), openEditDocType(), openEditDocFormat(), saveDocType(), deleteDocType()
 */
function renderDocTypesTable(){
  var types = getDocTypes();
  var html = types.map(function(t, i){
    var pdf = t.pdfAsset || DOCUMENT_ASSETS[t.name] || DEFAULT_PDF_TEMPLATE || '';
    var pdfLabel = pdf ? ('<code style="font-size:11px;">'+pdf+'</code>') : '<span class="badge badge-warning">No PDF</span>';
    return '<tr>'+
      '<td>'+(i+1)+'</td>'+
      '<td><strong>'+t.name+'</strong></td>'+
      '<td>'+(t.fee ? '₱'+t.fee : '<span class="badge badge-success">Free</span>')+'</td>'+
      '<td style="max-width:320px;font-size:12px;">'+pdfLabel+
        (pdf ? ' <button class="btn btn-sm btn-outline" onclick="openPDFFile(\''+pdf.replace(/'/g,"\\'")+'\', \''+t.name.replace(/'/g,"\\'")+'\')">View</button>' : '')+
      '</td>'+
      '<td>'+
        '<button class="btn btn-sm btn-info" onclick="openEditDocType('+i+')">Edit</button> '+
        '<button class="btn btn-sm btn-danger" onclick="deleteDocType('+i+')">Delete</button>'+
      '</td></tr>';
  }).join('') || '<tr><td colspan="5" class="empty-state">No document types configured</td></tr>';
  var tbody = $('#docTypesTable');
  if(tbody) tbody.innerHTML = html;
  var tbodySec = $('#docTypesTableSec');
  if(tbodySec) tbodySec.innerHTML = html;
}

function openAddDocType(){
  $('#docTypeEditIndex').value = '-1';
  $('#docTypeModalTitle').textContent = 'Add Document Type';
  $('#dtName').value = '';
  $('#dtFee').value = '0';
  if($('#dtPdfAsset')) $('#dtPdfAsset').value = DEFAULT_PDF_TEMPLATE;
  if($('#dtTemplate')) $('#dtTemplate').value = '';
  $('#docTypeModal').classList.add('active');
}

function openEditDocType(index){
  var types = getDocTypes();
  var t = types[index];
  if(!t) return;
  $('#docTypeEditIndex').value = String(index);
  $('#docTypeModalTitle').textContent = 'Edit Document Type';
  $('#dtName').value = t.name;
  $('#dtFee').value = t.fee || 0;
  if($('#dtPdfAsset')) $('#dtPdfAsset').value = t.pdfAsset || DOCUMENT_ASSETS[t.name] || DEFAULT_PDF_TEMPLATE || '';
  if($('#dtTemplate')) $('#dtTemplate').value = t.template || '';
  $('#docTypeModal').classList.add('active');
}

function openEditDocFormat(typeName){
  var types = getDocTypes();
  var idx = types.findIndex(function(x){ return x.name === typeName; });
  if(idx < 0){ showToast('Document type not found','error'); return; }
  openEditDocType(idx);
  setTimeout(function(){ if($('#dtPdfAsset')) $('#dtPdfAsset').focus(); }, 100);
}

function saveDocType(){
  var idx = parseInt($('#docTypeEditIndex').value);
  var name = ($('#dtName').value || '').trim();
  var fee = parseFloat($('#dtFee').value) || 0;
  var pdfAsset = (($('#dtPdfAsset') && $('#dtPdfAsset').value) || '').trim() || DEFAULT_PDF_TEMPLATE;
  var template = (($('#dtTemplate') && $('#dtTemplate').value) || '').trim();
  if(!name){ showToast('Document name is required','error'); return; }
  if(!pdfAsset){ showToast('PDF template path is required','error'); return; }
  ensureDocTypes(data);
  var types = data.docTypes;
  var dup = types.findIndex(function(t,i){ return t.name.toLowerCase()===name.toLowerCase() && i!==idx; });
  if(dup >= 0){ showToast('A document type with this name already exists','error'); return; }
  if(idx >= 0 && types[idx]){
    var oldName = types[idx].name;
    types[idx].name = name;
    types[idx].fee = fee;
    types[idx].pdfAsset = pdfAsset;
    types[idx].template = template;
    if(oldName !== name){
      data.documents.forEach(function(d){ if(d.type === oldName) d.type = name; });
    }
    showToast('Document type updated');
  } else {
    types.push({ name: name, fee: fee, pdfAsset: pdfAsset, template: template });
    showToast('Document type added');
  }
  saveData();
  closeModal('docTypeModal');
  renderDocTypesTable();
  if($('#module-documents') && $('#module-documents').classList.contains('active')) renderDocuments();
  if($('#module-secretary') && $('#module-secretary').classList.contains('active')) renderSecretary();
}

function deleteDocType(index){
  openConfirmModal({
    title: 'Delete Document Type',
    message: 'Delete document type "'+t.name+'"?\nExisting requests of this type will keep their current type name.',
    okLabel: 'Delete',
    variant: 'danger',
    onConfirm: function(){
  types.splice(index, 1);
  saveData();
  showToast('Document type deleted');
  renderDocTypesTable();

    }
  });
}
