/**
 * Resolve a resident id to a display name.
 * Defines: getResidentName()
 */
function getResidentName(id){ var r=data.residents.find(function(x){return x.id===id;}); return r?r.firstName+' '+r.lastName:'Unknown'; }
