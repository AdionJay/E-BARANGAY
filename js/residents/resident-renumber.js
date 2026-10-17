/**
 * Keep resident ids sequential (1..N).
 * Defines: renumberResidents()
 */
function renumberResidents(){
  var idMap={};
  data.residents.forEach(function(r,i){ idMap[r.id]=i+1; });
  data.residents.forEach(function(r,i){ r.id=i+1; });
  data.documents.forEach(function(d){ if(idMap[d.residentId]) d.residentId=idMap[d.residentId]; });
  data.payments.forEach(function(p){ if(idMap[p.residentId]) p.residentId=idMap[p.residentId]; });
  data.notifications.forEach(function(n){ if(n.residentId&&idMap[n.residentId]) n.residentId=idMap[n.residentId]; });
  data.users.forEach(function(u){ if(u.residentId&&idMap[u.residentId]) u.residentId=idMap[u.residentId]; });
}
