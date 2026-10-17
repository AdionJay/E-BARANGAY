/**
 * Build the filled certificate PDF with jsPDF.
 * Defines: generateFilledDocumentPDF()
 */
function generateFilledDocumentPDF(d, options){
  options = options || {};
  var doDownload = options.download !== false;
  var r = data.residents.find(function(x){ return x.id === d.residentId; });
  var a = getApplicantDetails(d, r);
  var bodyLines = buildOfficialDocumentBody(d, a);

  if(!(window.jspdf && window.jspdf.jsPDF) && typeof window.jsPDF === 'undefined'){
    return printFilledDocumentFallback(d, a, bodyLines, doDownload);
  }

  function buildDoc(logoDataUrl){
    var JsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    var doc = new JsPDF({ unit: 'mm', format: 'a4' });
    var pageWidth = 210;
    var marginL = 25;
    var marginR = 25;
    var maxWidth = pageWidth - marginL - marginR;
    var center = pageWidth / 2;

    var y = drawCertificateHeader(doc, a, logoDataUrl);

    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text(String(d.type || 'BARANGAY CERTIFICATION').toUpperCase(), center, y, { align: 'center' });
    y += 12;

    // Body
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    bodyLines.forEach(function(line){
      if(line === ''){ y += 5; return; }
      var wrapped = doc.splitTextToSize(line, maxWidth);
      if(y + wrapped.length * 6.2 > 250){ doc.addPage(); y = 28; }
      doc.text(wrapped, marginL, y, { align: 'left', lineHeightFactor: 1.35 });
      y += wrapped.length * 6.2 + 1.5;
    });

    // Signature block (right-aligned, underlined name — matches official template)
    y += 22;
    if(y > 245){ doc.addPage(); y = 40; }
    var signX = 145;
    var signName = String(d.approvedBy || a.captain || 'Punong Barangay').toUpperCase();
    if(signName.indexOf('HON') !== 0 && a.captain && String(a.captain).toUpperCase().indexOf('HON') === 0){
      signName = String(a.captain).toUpperCase();
    } else if(signName.indexOf('HON') !== 0){
      signName = 'HON. ' + signName.replace(/^HON\.?\s*/i, '');
    }
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(signName, signX, y, { align: 'center' });
    // Underline under name
    var nameWidth = doc.getTextWidth(signName);
    doc.setLineWidth(0.4);
    doc.line(signX - nameWidth/2, y + 1.2, signX + nameWidth/2, y + 1.2);
    y += 6;
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.text('Punong Barangay', signX, y, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.text('OR No: ' + a.orNumber + '  |  Status: ' + d.status + '  |  Fee: PHP ' + (d.fee || 0), marginL, 285);

    var fileName = (String(d.type || 'Document').replace(/\s+/g, '_')) + '_' +
      (a.fullName || 'Resident').replace(/\s+/g, '_') + '.pdf';
    if(options.returnBlob){
      return URL.createObjectURL(doc.output('blob'));
    }
    if(doDownload){
      doc.save(fileName);
    }
    return doc;
  }

  // Prefer async logo load when returnBlob / download so logo is included
  if(options.returnBlob || doDownload || options.async){
    return loadBarangayLogoDataUrl().then(function(logo){
      return buildDoc(logo);
    });
  }
  if(!_barangayLogoDataUrl) loadBarangayLogoDataUrl();
  return buildDoc(_barangayLogoDataUrl);
}
