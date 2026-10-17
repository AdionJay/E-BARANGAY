/**
 * Score OCR name against the resident name.
 * Defines: scoreNameMatch()
 */
function scoreNameMatch(profileResident, ocrName, parsed){
  var pFirst = normalizePersonName(profileResident.firstName||'');
  var pMid = normalizePersonName(profileResident.middleName||'');
  var pLast = normalizePersonName(profileResident.lastName||'');
  var o = normalizePersonName(ocrName||'');
  // Also search structured OCR fields + raw text
  var searchBlob = o;
  if(parsed){
    searchBlob = [o, parsed.firstName, parsed.middleName, parsed.lastName, parsed.raw].filter(Boolean).join(' ');
    searchBlob = normalizePersonName(searchBlob);
  }
  if(!searchBlob || !pLast || !pFirst) return { score: 0, detail: 'Missing name data for comparison', hasLast:false, hasFirst:false };

  var hasLast = fuzzyIncludes(searchBlob, pLast);
  // first name may be multi-token (LEA JEAN)
  var hasFirst = fuzzyIncludes(searchBlob, pFirst);
  if(!hasFirst && pFirst.indexOf(' ') >= 0){
    // require majority of given-name tokens
    var ft = pFirst.split(' ').filter(Boolean);
    var okf = 0;
    ft.forEach(function(t){ if(fuzzyIncludes(searchBlob, t)) okf++; });
    hasFirst = okf >= Math.ceil(ft.length * 0.7);
  }
  var hasMid = !pMid || fuzzyIncludes(searchBlob, pMid);

  var score = 0;
  var parts = [];
  if(hasLast){ score += 45; parts.push('Last name matched'); } else { parts.push('Last name NOT found on ID'); }
  if(hasFirst){ score += 45; parts.push('First name matched'); } else { parts.push('First name NOT found on ID'); }
  if(pMid){
    if(hasMid){ score += 10; parts.push('Middle name matched'); }
    else { parts.push('Middle name not found (optional)'); }
  } else {
    score += 10;
  }

  var profileFull = [pFirst, pMid, pLast].filter(Boolean).join(' ');
  if(normalizePersonName(o) === profileFull){ score = 100; parts = ['Exact full name match']; }

  return { score: Math.min(100, score), detail: parts.join(' · '), hasLast: hasLast, hasFirst: hasFirst };
}
