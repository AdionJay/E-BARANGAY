/**
 * Name / text matching helpers (levenshtein, fuzzy match).
 * Defines: normalizePersonName(), fixOcrDigits(), levenshtein(), fuzzyIncludes(), cleanNameToken()
 */
function normalizePersonName(s){
  return String(s||'')
    .toUpperCase()
    .replace(/Ñ/g,'N')
    .replace(/[^A-Z\s]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function fixOcrDigits(s){
  return String(s||'')
    .replace(/[Oo]/g,'0')
    .replace(/[Il|]/g,'1')
    .replace(/[Ss]/g,'5')
    .replace(/[Bb]/g,'8')
    .replace(/[Zz]/g,'2')
    .replace(/[Gg]/g,'6');
}

function levenshtein(a, b){
  a = String(a||''); b = String(b||'');
  if(a === b) return 0;
  if(!a.length) return b.length;
  if(!b.length) return a.length;
  var i, j, prev = [], cur = [];
  for(j = 0; j <= b.length; j++) prev[j] = j;
  for(i = 1; i <= a.length; i++){
    cur[0] = i;
    for(j = 1; j <= b.length; j++){
      var cost = a.charAt(i-1) === b.charAt(j-1) ? 0 : 1;
      cur[j] = Math.min(cur[j-1] + 1, prev[j] + 1, prev[j-1] + cost);
    }
    prev = cur.slice();
  }
  return prev[b.length];
}

function fuzzyIncludes(hay, needle){
  hay = normalizePersonName(hay);
  needle = normalizePersonName(needle);
  if(!needle || needle.length < 2) return false;
  if(hay.indexOf(needle) >= 0) return true;
  // token-level fuzzy (allow 1-2 char OCR errors)
  var tokens = hay.split(' ').filter(Boolean);
  var maxDist = needle.length <= 4 ? 1 : (needle.length <= 8 ? 2 : 3);
  for(var i=0;i<tokens.length;i++){
    if(levenshtein(tokens[i], needle) <= maxDist) return true;
  }
  // multi-word needle (e.g. LEA JEAN)
  var ntoks = needle.split(' ').filter(Boolean);
  if(ntoks.length > 1){
    var ok = 0;
    ntoks.forEach(function(t){ if(fuzzyIncludes(hay, t)) ok++; });
    return ok >= Math.ceil(ntoks.length * 0.7);
  }
  return false;
}

function cleanNameToken(s){
  return normalizePersonName(s)
    .replace(/\b(LAST|NAME|APELYIDO|GIVEN|NAMES|MGA|PANGALAN|MIDDLE|GITNANG|FIRST|SEX|DATE|BIRTH|ADDRESS|TIRAHAN|REPUBLIC|PHILIPPINES|NATIONAL|ID|PHILSYS|PAMBANSANG|PAGKAKAKILANLAN)\b/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
