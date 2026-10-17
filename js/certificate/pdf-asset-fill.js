/**
 * Write resident data onto the official PDF assets with pdf-lib.
 * Defines: pdfLibAvailable(), topYToPdfLib(), fillIndigencyPdfAsset(), fillPdfAssetWithResidentData()
 */
function pdfLibAvailable(){
  return !!(window.PDFLib && window.PDFLib.PDFDocument);
}

// pdftotext -bbox uses top-left origin; pdf-lib uses bottom-left.
function topYToPdfLib(pageHeight, yTopMax){
  return pageHeight - yTopMax;
}

async function fillIndigencyPdfAsset(pdfDoc, page, a){
  var rgb = window.PDFLib.rgb;
  var StandardFonts = window.PDFLib.StandardFonts;
  var font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  var fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  var h = page.getHeight();
  var white = rgb(1, 1, 1);
  var black = rgb(0, 0, 0);

  function cover(x, yTopMin, w, hBox){
    var y = topYToPdfLib(h, yTopMin + hBox);
    page.drawRectangle({ x: x, y: y, width: w, height: hBox + 2, color: white });
  }
  function write(text, x, yTopMax, size, bold){
    var y = topYToPdfLib(h, yTopMax) + 2;
    page.drawText(String(text || ''), {
      x: x,
      y: y,
      size: size || 11,
      font: bold ? fontBold : font,
      color: black,
      maxWidth: 480
    });
  }

  // Hall address / contact
  cover(197, 166.8, 210, 14);
  write([a.hallAddress || a.barangay, a.hallContact || ''].filter(Boolean).join(' | '), 197, 180.5, 10);

  // Name blank
  cover(188, 258, 175, 16);
  write(a.fullName, 188, 273, 11, true);

  // Civil status
  cover(429, 258, 100, 16);
  write((a.civilStatus || '') + ',', 429, 273, 11);

  // Barangay / municipality / province
  cover(299, 278, 230, 16);
  write(a.barangay + ', ' + a.municipality + ',', 299, 293.4, 11);
  cover(72, 298, 80, 16);
  write(a.province + ',', 72, 313.8, 11);

  // Pronoun + employment
  cover(175, 331, 50, 16);
  write(a.pronoun, 175, 346.3, 11);
  cover(250, 331, 210, 16);
  write('is ' + (a.employmentStatus || 'not a government employee'), 250, 346.3, 11);

  // Monthly income amount
  cover(235, 351, 80, 16);
  write(String(a.monthlyIncome || '0') + ',', 235, 366.7, 11);

  // Beneficiary + purpose
  cover(350, 404, 160, 16);
  write(a.beneficiaryName || a.fullName, 350, 419.7, 10, true);
  cover(269, 424, 200, 16);
  write(a.purpose || '', 269, 440.2, 10);

  // Issue date + location
  cover(130, 477, 160, 16);
  write(formatLongDate(a.issueDate), 130, 493.1, 11);
  cover(300, 477, 220, 16);
  write('at ' + a.barangay + ', ' + a.municipality + ', ' + a.province + '.', 300, 493.1, 10);

  // Captain name
  cover(295, 570, 200, 18);
  write(String(a.captain || 'Punong Barangay').toUpperCase(), 295, 587.8, 11, true);
}

async function fillPdfAssetWithResidentData(d){
  if(!pdfLibAvailable()) return null;
  var path = d.pdfAsset || getDocumentAsset(d.type);
  if(!path) return null;

  var r = data.residents.find(function(x){ return x.id === d.residentId; });
  var a = getApplicantDetails(d, r);

  var res = await fetch(encodeURI(path));
  if(!res.ok) throw new Error('Could not load PDF asset: ' + path);
  var bytes = await res.arrayBuffer();

  var pdfDoc = await window.PDFLib.PDFDocument.load(bytes);
  var pages = pdfDoc.getPages();
  if(!pages.length) throw new Error('PDF has no pages');
  var page = pages[0];

  if(d.type === 'Certificate of Indigency' || /indigency/i.test(path)){
    await fillIndigencyPdfAsset(pdfDoc, page, a);
  } else {
    // Generic stamp for other assets (e.g. sample clearance PDF)
    var rgb = window.PDFLib.rgb;
    var StandardFonts = window.PDFLib.StandardFonts;
    var font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    var fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    var boxY = 36;
    page.drawRectangle({
      x: 40, y: boxY, width: 515, height: 88,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.75, 0.75, 0.75),
      borderWidth: 0.5
    });
    var lines = [
      'AUTO-FILLED FROM RESIDENT RECORD',
      'Name: ' + a.fullName + '  |  Civil Status: ' + a.civilStatus,
      'Address: ' + (a.address || '') + (a.purok ? (', Purok ' + a.purok) : ''),
      'Purpose: ' + a.purpose,
      'Issued: ' + formatDate(a.issueDate) + '  |  OR: ' + a.orNumber + '  |  Fee: PHP ' + (d.fee || 0)
    ];
    var y = boxY + 72;
    lines.forEach(function(line, idx){
      page.drawText(line, {
        x: 48, y: y - idx * 12,
        size: idx === 0 ? 9 : 10,
        font: idx === 0 ? fontBold : font,
        color: rgb(0, 0, 0),
        maxWidth: 500
      });
    });
  }

  return await pdfDoc.save();
}
