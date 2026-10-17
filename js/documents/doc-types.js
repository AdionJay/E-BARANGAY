/**
 * Document type registry: fees, templates and placeholder filling.
 * Defines: ensureDocTypes(), getDocTypes(), getDocTypeNames(), getDocFee(), getDocTemplate(), fillTemplate()
 */
function ensureDocTypes(d){
  if(!d.docTypes || !Array.isArray(d.docTypes) || d.docTypes.length===0){
    d.docTypes = JSON.parse(JSON.stringify(DEFAULT_DOC_TYPES));
  }
  // Migrate old entries and ensure every type has a valid PDF template path (quoted string)
  d.docTypes.forEach(function(t){
    if(typeof t === 'string'){ return; }
    if(t.fee === undefined) t.fee = 0;
    if(t.template === undefined) t.template = '';
    // Prefer mapped asset for this document name; fall back to default clearance PDF
    var mapped = DOCUMENT_ASSETS[t.name] || DEFAULT_PDF_TEMPLATE;
    if(!t.pdfAsset || typeof t.pdfAsset !== 'string'){
      t.pdfAsset = mapped;
    }
    // Fix common broken paths from older edits (unquoted / wrong file)
    if(t.name === 'Certificate of Indigency'){
      t.pdfAsset = INDIGENCY_PDF_TEMPLATE;
    }
  });
  return d;
}

function getDocTypes(){ ensureDocTypes(data); return data.docTypes; }

function getDocTypeNames(){ return getDocTypes().map(function(t){ return t.name; }); }

function getDocFee(typeName){
  var t = getDocTypes().find(function(x){ return x.name === typeName; });
  return t ? (t.fee||0) : 0;
}

function getDocTemplate(typeName){
  var t = getDocTypes().find(function(x){ return x.name === typeName; });
  return t && t.template ? t.template : 'This is to certify that {fullName}, of legal age, {civilStatus}, resident of {address}, {purok}, {barangay}, is a bona fide resident of this barangay.\n\nPurpose: {purpose}.';
}

function fillTemplate(tpl, d, r, p){
  var fullName = r ? (r.firstName+' '+(r.middleName||'')+' '+r.lastName).replace(/\s+/g,' ').trim() : 'N/A';
  return (tpl||'')
    .replace(/\{fullName\}/g, fullName)
    .replace(/\{civilStatus\}/g, r ? (r.civilStatus||'') : '')
    .replace(/\{address\}/g, r ? (r.address||'') : '')
    .replace(/\{purok\}/g, r ? (r.purok||'') : '')
    .replace(/\{barangay\}/g, p ? (p.name||'this barangay') : 'this barangay')
    .replace(/\{purpose\}/g, d.purpose || 'whatever legal purpose it may serve')
    .replace(/\{date\}/g, formatDate(d.releaseDate||d.approvedDate||d.requestDate))
    .replace(/\{captain\}/g, (p && p.captain) || 'Barangay Captain');
}
