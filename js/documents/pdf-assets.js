/**
 * Look up the official PDF template linked to a document type.
 * Defines: getDocumentAsset(), hasDocumentAsset()
 */
function getDocumentAsset(type){
  // Prefer per-type pdfAsset stored on docTypes, then static map, then default template
  try {
    var t = getDocTypes().find(function(x){ return x.name === type; });
    if(t && t.pdfAsset) return t.pdfAsset;
  } catch(e){}
  return DOCUMENT_ASSETS[type] || DEFAULT_PDF_TEMPLATE || '';
}

function hasDocumentAsset(type){
  return !!getDocumentAsset(type);
}
