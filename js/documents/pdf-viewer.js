/**
 * PDF.js viewer modal (open, render, zoom, page navigation, template review).
 * Defines: _pdfjsDoc, _pdfjsPage, _pdfjsScale, _pdfjsPath, _pdfjsRendering, openPDFFile(), pdfjsLoadAndRender(), pdfjsRenderAllPages(), pdfjsChangePage(), pdfjsZoom(), pdfjsOpenInNewTab(), pdfjsSaveFile(), reviewDocumentAsset(), requestFromPDFReview()
 */
/* PDF.js custom viewer state*/
var _pdfjsDoc = null;

var _pdfjsPage = 1;

var _pdfjsScale = 1.15;

var _pdfjsPath = '';

var _pdfjsRendering = false;

function openPDFFile(path, title, requestType){
  if(!path){ showToast('PDF file is not available','error'); return; }
  _pdfjsPath = path;
  _pdfjsPage = 1;
  _pdfjsScale = 1.15;

  $('#pdfViewerTitle').textContent = title || 'PDF Document';

  var isPortalReview = !!requestType; // resident portal sample template review
  var isResident = data.currentUser && data.currentUser.role === 'Resident';
  // Resident / portal: only Request + Close (no open/save, minimal chrome)
  var hideFileActions = isPortalReview || isResident;

  var modal = $('#pdfViewerModal');
  if(modal){
    var modalBox = modal.querySelector('.pdf-viewer-modal') || modal.querySelector('.modal');
    if(modalBox){
      if(hideFileActions) modalBox.classList.add('portal-mode');
      else modalBox.classList.remove('portal-mode');
    }
  }

  /* Footer actions */
  var requestBtn = $('#pdfViewerRequestButton');
  if(requestBtn){
    requestBtn.dataset.requestType = requestType || '';
    requestBtn.style.display = requestType ? 'inline-flex' : 'none';
  }
  var staffOpen = $('#pdfViewerStaffOpen');
  var staffSave = $('#pdfViewerStaffSave');
  if(staffOpen) staffOpen.style.display = hideFileActions ? 'none' : 'inline-flex';
  if(staffSave) staffSave.style.display = hideFileActions ? 'none' : 'inline-flex';

  /* Minimal page toolbar: hide for portal/resident, show for staff multi-page nav */
  var toolbar = $('#pdfjsToolbar');
  if(toolbar) toolbar.style.display = hideFileActions ? 'none' : 'flex';

  /* Hidden links kept for staff helpers */
  var openLink = $('#pdfViewerOpenLink');
  var downloadLink = $('#pdfViewerDownloadLink');
  if(openLink){ openLink.href = encodeURI(path); }
  if(downloadLink){
    downloadLink.href = encodeURI(path);
    downloadLink.download = (path.split('/').pop() || 'document.pdf');
  }

  $('#pdfViewerModal').classList.add('active');
  pdfjsLoadAndRender(path);
}

function pdfjsLoadAndRender(path){
  var pagesEl = $('#pdfjsPages');
  var loadingEl = $('#pdfjsLoading');
  if(pagesEl) pagesEl.innerHTML = '';
  if(loadingEl){ loadingEl.style.display = 'flex'; loadingEl.textContent = 'Loading PDF…'; }

  if(!window.pdfjsLib){
    if(loadingEl) loadingEl.textContent = 'PDF viewer library not loaded';
    showToast('PDF.js failed to load','error');
    return;
  }

  /* Destroy previous document */
  if(_pdfjsDoc){
    try { _pdfjsDoc.destroy(); } catch(e){}
    _pdfjsDoc = null;
  }

  var url = encodeURI(path);
  pdfjsLib.getDocument({ url: url, withCredentials: false }).promise.then(function(pdf){
    _pdfjsDoc = pdf;
    if($('#pdfjsPageCount')) $('#pdfjsPageCount').textContent = String(pdf.numPages);
    if($('#pdfjsPageNum')) $('#pdfjsPageNum').textContent = '1';
    _pdfjsPage = 1;


    /* Render all pages for simple scroll view (templates are usually 1 page) */
    return pdfjsRenderAllPages();
  }).then(function(){
    if(loadingEl) loadingEl.style.display = 'none';
  }).catch(function(err){
    console.error('PDF.js error', err);
    if(loadingEl) loadingEl.textContent = 'Could not load PDF template';
    showToast('Could not open PDF template','error');
  });
}

function pdfjsRenderAllPages(){
  if(!_pdfjsDoc || !_pdfjsDoc.numPages) return Promise.resolve();
  var pagesEl = $('#pdfjsPages');
  if(!pagesEl) return Promise.resolve();
  pagesEl.innerHTML = '';
  var chain = Promise.resolve();
  for(var i = 1; i <= _pdfjsDoc.numPages; i++){
    (function(pageNum){
      chain = chain.then(function(){
        return _pdfjsDoc.getPage(pageNum).then(function(page){
          var viewport = page.getViewport({ scale: _pdfjsScale });
          var canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.setAttribute('data-page', String(pageNum));
          pagesEl.appendChild(canvas);
          var ctx = canvas.getContext('2d');
          return page.render({ canvasContext: ctx, viewport: viewport }).promise;
        });
      });
    })(i);
  }
  return chain;
}

function pdfjsChangePage(delta){
  if(!_pdfjsDoc) return;
  var next = _pdfjsPage + delta;
  if(next < 1 || next > _pdfjsDoc.numPages) return;
  _pdfjsPage = next;
  if($('#pdfjsPageNum')) $('#pdfjsPageNum').textContent = String(_pdfjsPage);
  var canvas = document.querySelector('#pdfjsPages canvas[data-page="'+_pdfjsPage+'"]');
  if(canvas) canvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function pdfjsZoom(delta){
  _pdfjsScale = Math.min(2.5, Math.max(0.6, _pdfjsScale + delta));
  var loadingEl = $('#pdfjsLoading');
  if(loadingEl){ loadingEl.style.display = 'flex'; loadingEl.textContent = 'Updating…'; }
  pdfjsRenderAllPages().then(function(){
    if(loadingEl) loadingEl.style.display = 'none';
  });
}

function pdfjsOpenInNewTab(){
  if(!_pdfjsPath) return;
  window.open(encodeURI(_pdfjsPath), '_blank', 'noopener');
}

function pdfjsSaveFile(){
  if(!_pdfjsPath) return;
  var a = document.createElement('a');
  a.href = encodeURI(_pdfjsPath);
  a.download = (_pdfjsPath.split('/').pop() || 'document.pdf');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function reviewDocumentAsset(type){
  var path = getDocumentAsset(type);
  if(!path){ showToast('No PDF template is linked for '+type,'error'); return; }
  openPDFFile(path, type+' — Official PDF Template', type);
}

function requestFromPDFReview(){
  var btn = $('#pdfViewerRequestButton');
  var type = btn ? btn.dataset.requestType : '';
  if(!type){ showToast('Document type is not available','error'); return; }
  closeModal('pdfViewerModal');
  portalRequestType(type);
}
