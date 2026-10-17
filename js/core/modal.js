/**
 * Generic close-modal helper.
 * Defines: closeModal()
 */
function closeModal(id){
  $('#'+id).classList.remove('active');
  if(id === 'pdfViewerModal'){
    if(_pdfjsDoc){ try { _pdfjsDoc.destroy(); } catch(e){} _pdfjsDoc = null; }
    var pagesEl = $('#pdfjsPages');
    if(pagesEl) pagesEl.innerHTML = '';
    var loadingEl = $('#pdfjsLoading');
    if(loadingEl){ loadingEl.style.display = 'flex'; loadingEl.textContent = 'Loading PDF…'; }
    _pdfjsPath = '';
  }
}
