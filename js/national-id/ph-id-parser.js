/**
 * Parse Philippine National ID fields from OCR text.
 * Defines: parsePhilId()
 */
function parsePhilId(text){
  var cleaned = String(text || '').replace(/\r/g, '\n');
  // Fix common OCR joins
  cleaned = cleaned
    .replace(/APELYIDO\.?\s*LAST\s*NAME/gi, 'LAST NAME')
    .replace(/MGA\s*PANGALAN\.?\s*GIVEN\s*NAMES?/gi, 'GIVEN NAMES')
    .replace(/GITNANG\s*APELYIDO\.?\s*MIDDLE\s*NAME/gi, 'MIDDLE NAME')
    .replace(/PETSA\s*NG\s*KAPANGANAKAN\.?\s*DATE\s*OF\s*BIRTH/gi, 'DATE OF BIRTH')
    .replace(/TIRAHAN\.?\s*ADDRESS/gi, 'ADDRESS');

  var upper = cleaned.toUpperCase();
  var lines = cleaned.split(/\n/).map(function(l){ return l.trim(); }).filter(Boolean);

  // ---- PhilSys ID number (16 digits, ####-####-####-####) ----
  var idNum = null;
  // Prefer digit-corrected scan of whole text
  var digitBlob = fixOcrDigits(cleaned.replace(/[^\dOIl|SsBbZzGg\-\s]/g,' '));
  var idPatterns = [
    /\b(\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4})\b/,
    /\b(\d{16})\b/,
    /\b(\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/
  ];
  for(var i=0;i<idPatterns.length;i++){
    var m = digitBlob.match(idPatterns[i]) || cleaned.match(idPatterns[i]);
    if(m){
      var digits = fixOcrDigits(m[1]).replace(/\D/g,'');
      if(digits.length === 16){
        idNum = digits.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/,'$1-$2-$3-$4');
        break;
      }
    }
  }
  // Fallback: longest 16-digit run anywhere
  if(!idNum){
    var onlyDigits = fixOcrDigits(cleaned).replace(/\D/g,'');
    var run = onlyDigits.match(/\d{16}/);
    if(run) idNum = run[0].replace(/(\d{4})(\d{4})(\d{4})(\d{4})/,'$1-$2-$3-$4');
  }

  // ---- Names (PhilSys field order: Last, Given, Middle) ----
  var lastN='', givenN='', midN='';

  function valueAfterLabel(src, labelRe){
    var mm = src.match(labelRe);
    if(!mm) return '';
    var val = cleanNameToken(mm[1] || '');
    // stop at next field labels if OCR glued them
    val = val.split(/\b(?:LAST|GIVEN|MIDDLE|SEX|DATE|ADDRESS|TIRAHAN|PHILSYS)\b/)[0].trim();
    // keep at most 3 tokens for last/middle, 4 for given
    return val;
  }

  lastN = valueAfterLabel(cleaned, /(?:LAST\s*NAME|APELYIDO|APLYIDO|APEL[\sYIDO]*)\s*[:\-]?\s*([A-Za-zÑñ.'\-]{2,}(?:\s+[A-Za-zÑñ.'\-]{2,}){0,2})/i);
  givenN = valueAfterLabel(cleaned, /(?:GIVEN\s*NAMES?|FIRST\s*NAME|MGA\s*PANGALAN|PANGALAN)\s*[:\-]?\s*([A-Za-zÑñ.'\-]{2,}(?:\s+[A-Za-zÑñ.'\-]{2,}){0,3})/i);
  midN = valueAfterLabel(cleaned, /(?:MIDDLE\s*NAME|GITNANG\s*(?:APELYIDO|PANGALAN)|GITNANG)\s*[:\-]?\s*([A-Za-zÑñ.'\-]{2,}(?:\s+[A-Za-zÑñ.'\-]{2,}){0,2})/i);

  // Line-based recovery: values often sit on their own line near labels
  function lineValueNear(labelRe){
    for(var li=0; li<lines.length; li++){
      if(labelRe.test(lines[li])){
        // same line after label
        var same = lines[li].replace(labelRe,'').replace(/[:\-]/g,' ').trim();
        same = cleanNameToken(same);
        if(same && same.length >= 2) return same;
        // next non-label line
        for(var k=li+1; k<Math.min(li+3, lines.length); k++){
          var cand = cleanNameToken(lines[k]);
          if(cand && cand.length >= 2 && cand.length <= 40 &&
             !/REPUBLIC|PHILIPPINE|NATIONAL|PAMBANSANG|IDENTIFICATION|SEX|DATE|ADDRESS|TIRAHAN|PHILSYS|QR|CODE/i.test(cand)){
            return cand;
          }
        }
      }
    }
    return '';
  }
  if(!lastN) lastN = lineValueNear(/LAST\s*NAME|APELYIDO/i);
  if(!givenN) givenN = lineValueNear(/GIVEN\s*NAMES?|MGA\s*PANGALAN|PANGALAN/i);
  if(!midN) midN = lineValueNear(/MIDDLE\s*NAME|GITNANG/i);

  // Absolute fallback: collect strongest name-like lines
  var name = null;
  if(lastN || givenN){
    name = [givenN, midN, lastN].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  }
  if(!name){
    var candidates = lines.map(cleanNameToken).filter(function(l){
      return l.length >= 5 && l.split(/\s+/).length >= 2 &&
        !/REPUBLIC|PHILIPPINE|IDENTIFICATION|NATIONAL|PHILSYS|DATE|BIRTH|SEX|ADDRESS|CITIZEN|CARD|GOVERNMENT|PAMBANSANG|PAGKAKAKILANLAN|DIGITAL|NUMBER/i.test(l);
    });
    if(candidates.length){
      candidates.sort(function(a,b){ return b.length - a.length; });
      name = candidates[0];
    }
  }

  // ---- Sex / Gender ----
  var gender = null;
  var sexM = cleaned.match(/\b(?:SEX|KASARIAN)\s*[:\-]?\s*(MALE|FEMALE|M|F)\b/i) ||
             cleaned.match(/\b(MALE|FEMALE)\b/i);
  if(sexM){
    var sx = sexM[1].toUpperCase();
    gender = (sx==='M' || sx==='MALE') ? 'Male' : ((sx==='F'||sx==='FEMALE')?'Female':sx);
  }

  // ---- Birth date (e.g. September 28, 2007) ----
  var birthDate = null;
  var bd = cleaned.match(/(?:DATE\s*OF\s*BIRTH|BIRTH\s*DATE|KAPANGANAKAN|PETSA\s*NG\s*KAPANGANAKAN)\s*[:\-]?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{1,2}[\-\/.\s][A-Za-z]{3,9}[\-\/.\s]\d{2,4}|\d{4}[\-\/]\d{1,2}[\-\/]\d{1,2}|\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/i);
  if(bd){
    birthDate = bd[1].replace(/\s+/g,' ').trim();
  } else {
    var bd2 = cleaned.match(/\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/i);
    if(bd2) birthDate = bd2[1].replace(/\s+/g,' ').trim();
  }
  // Normalize month name dates to YYYY-MM-DD when possible
  if(birthDate){
    var md = birthDate.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if(md){
      var months = {JANUARY:1,FEBRUARY:2,MARCH:3,APRIL:4,MAY:5,JUNE:6,JULY:7,AUGUST:8,SEPTEMBER:9,OCTOBER:10,NOVEMBER:11,DECEMBER:12};
      var mi = months[md[1].toUpperCase()];
      if(mi){
        birthDate = md[3] + '-' + String(mi).padStart(2,'0') + '-' + String(md[2]).padStart(2,'0');
      }
    }
  }

  // ---- Address ----
  var address = null;
  var ad = cleaned.match(/(?:ADDRESS|TIRAHAN)\s*[:\-]?\s*([A-Za-z0-9Ññ#.,'\-\/\s]{8,160})/i);
  if(ad){
    address = ad[1].replace(/\s+/g,' ').trim();
  } else {
    // Heuristic: line with PUROK / barangay / province
    for(var ai=0; ai<lines.length; ai++){
      if(/PUROK|BARANGAY|DUMAGUENA|DUMANGUENA|NARRA|PALAWAN|PHILIPPINES|\b\d{4}\b/i.test(lines[ai]) &&
         !/REPUBLIC|PAMBANSANG|IDENTIFICATION|PHILSYS/i.test(lines[ai])){
        address = lines[ai].replace(/\s+/g,' ').trim();
        // append following line if continues
        if(ai+1 < lines.length && /PALAWAN|PHILIPPINE|\d{4}/i.test(lines[ai+1])){
          address += ', ' + lines[ai+1].replace(/\s+/g,' ').trim();
        }
        break;
      }
    }
  }
  if(address){
    address = address
      .replace(/\bPHL\b/gi,'')
      .replace(/\bPHILIPPINES?\b/gi,'Philippines')
      .replace(/\s+/g,' ')
      .replace(/\s+,/g,',')
      .trim();
  }

  return {
    idNumber: idNum,
    name: name,
    lastName: lastN || '',
    firstName: givenN || '',
    middleName: midN || '',
    gender: gender,
    birthDate: birthDate,
    address: address,
    raw: cleaned
  };
}
