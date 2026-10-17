/**
 * Draw the official letterhead on a jsPDF page.
 * Defines: drawCertificateHeader()
 */
function drawCertificateHeader(doc, a, logoDataUrl){
  var pageWidth = 210;
  var marginL = 22;
  var marginR = 22;
  var center = pageWidth / 2;
  var y = 14;
  var logoSize = 28; // mm — official Barangay Dumanguena seal

  // Single centered logo (matches official clearance template)
  if(logoDataUrl){
    try {
      doc.addImage(logoDataUrl, 'PNG', center - logoSize/2, y, logoSize, logoSize);
    } catch(e){ console.warn('addImage logo failed', e); }
    y += logoSize + 4;
  } else {
    y += 4;
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('Republic of the Philippines', center, y, { align: 'center' }); y += 5;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('Province of ' + String(a.province || 'PALAWAN').toUpperCase(), center, y, { align: 'center' }); y += 5;
  doc.text('Municipality of ' + String(a.municipality || 'NARRA').toUpperCase(), center, y, { align: 'center' }); y += 5;
  doc.text(String(a.barangay || 'Barangay Dumanguena'), center, y, { align: 'center' }); y += 5.5;
  doc.setFontSize(11);
  doc.text('OFFICE OF THE PUNONG BARANGAY', center, y, { align: 'center' }); y += 5;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  // Address style from official template: "Dumangueña || Tel No. ..."
  var shortPlace = String(a.barangay || 'Dumanguena').replace(/^Barangay\s+/i, '');
  var tel = a.hallContact || '';
  var hallLine = shortPlace + (tel ? (' || Tel No. ' + tel) : '');
  if(a.hallAddress && a.hallAddress.toLowerCase().indexOf(shortPlace.toLowerCase()) < 0){
    hallLine = (a.hallAddress || shortPlace) + (tel ? (' || Tel No. ' + tel) : '');
  }
  if(hallLine){
    doc.text(hallLine, center, y, { align: 'center' });
    y += 4;
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.7);
  doc.line(marginL, y, pageWidth - marginR, y);
  return y + 9;
}
