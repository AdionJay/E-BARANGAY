/**
 * Preview the filled document and printable HTML fallback.
 * Defines: openFilledDocumentViewer(), printFilledDocumentFallback()
 */
/** Open clean auto-filled certificate with barangay logo in header */
function openFilledDocumentViewer(d, titleOverride){
  if(!d){ showToast('Document not found','error'); return; }
  var u = data.currentUser;
  var isResident = u && u.role === 'Resident';
  // Hard block: residents must not see filled official document until Released (paid + Treasurer verified)
  if(isResident && d.status !== 'Released'){
    showToast('Hindi pa available ang official document. Magbayad muna at hintayin ang verification ng Treasurer.','error');
    return;
  }
  var title = titleOverride || (d.type + ' — ' + getResidentName(d.residentId) + ' (Auto-filled)');
  Promise.resolve(generateFilledDocumentPDF(d, { download: false, returnBlob: true, async: true }))
    .then(function(url){
      if(url) openPDFFile(url, title, null);
      else {
        var r = data.residents.find(function(x){ return x.id === d.residentId; });
        var a = getApplicantDetails(d, r);
        printFilledDocumentFallback(d, a, buildOfficialDocumentBody(d, a), false);
      }
    })
    .catch(function(err){
      console.error(err);
      var r = data.residents.find(function(x){ return x.id === d.residentId; });
      var a = getApplicantDetails(d, r);
      printFilledDocumentFallback(d, a, buildOfficialDocumentBody(d, a), false);
    });
}

function printFilledDocumentFallback(d, a, bodyLines, doDownload){
  var w = window.open('', '_blank');
  if(!w){ showToast('Please allow pop-ups to view/download the document','error'); return null; }
  var html = '<html><head><title>'+d.type+'</title><style>'+
    'body{font-family:Times New Roman,serif;padding:40px;max-width:700px;margin:0 auto;line-height:1.45;}'+
    '.c{text-align:center;} h2{margin:6px 0;} .sig{text-align:right;margin-top:40px;}'+
    '@media print{button{display:none;}}'+
    '</style></head><body>';
  html += '<div class="c">';
  html += '<img src="assets/barangay-seal.png" alt="Barangay Logo" style="width:72px;height:72px;margin-bottom:8px;"/>';
  html += '<p style="margin:2px 0;font-weight:700;">Republic of the Philippines</p>';
  html += '<p style="margin:2px 0;font-weight:700;">Province of '+(a.province||'').toUpperCase()+'</p>';
  html += '<p style="margin:2px 0;font-weight:700;">Municipality of '+(a.municipality||'').toUpperCase()+'</p>';
  html += '<p style="margin:2px 0;font-weight:700;">'+(a.barangay||'')+'</p>';
  html += '<p style="margin:4px 0;font-weight:700;">OFFICE OF THE PUNONG BARANGAY</p>';
  html += '<p style="margin:2px 0;font-size:13px;">'+String(a.barangay||'Dumanguena').replace(/^Barangay\s+/i,'')+(a.hallContact?(' || Tel No. '+a.hallContact):'')+'</p>';
  html += '<hr style="margin:12px 0;border:none;border-top:2px solid #111;"/>';
  html += '<h3 style="margin-top:14px;letter-spacing:0.5px;">'+String(d.type||'').toUpperCase()+'</h3></div>';
  bodyLines.forEach(function(line){
    html += line ? ('<p>'+line+'</p>') : '<br>';
  });
  html += '<div class="sig"><p><strong>'+String(d.approvedBy||a.captain||'Punong Barangay').toUpperCase()+'</strong><br><em>Punong Barangay</em></p></div>';
  html += '<p style="font-size:12px;margin-top:24px;">OR No: '+a.orNumber+' | Status: '+d.status+' | Fee: ₱'+(d.fee||0)+'</p>';
  html += '<p style="margin-top:20px;"><button onclick="window.print()">Print / Save as PDF</button></p>';
  html += '</body></html>';
  w.document.write(html);
  w.document.close();
  if(doDownload){
    setTimeout(function(){ try{ w.print(); }catch(e){} }, 400);
  }
  return null;
}
