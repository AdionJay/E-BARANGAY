/**
 * Reports screen.
 * Defines: renderReports()
 */
function renderReports(){
  var total=data.residents.length, verified=data.residents.filter(function(r){return r.verified;}).length;
  $('#reportStats').innerHTML='<div class="stats-grid"><div class="stat-card"><div class="stat-icon green">👥</div><div class="stat-info"><h3>'+total+'</h3><p>Total Residents</p></div></div><div class="stat-card"><div class="stat-icon green">✓</div><div class="stat-info"><h3>'+verified+'</h3><p>Verified</p></div></div><div class="stat-card"><div class="stat-icon blue">📄</div><div class="stat-info"><h3>'+data.documents.length+'</h3><p>Documents</p></div></div><div class="stat-card"><div class="stat-icon purple">💰</div><div class="stat-info"><h3>₱'+data.payments.filter(function(p){return p.verified;}).reduce(function(s,p){return s+p.amount;},0).toFixed(2)+'</h3><p>Verified Revenue</p></div></div></div>';
  var dt={}; data.documents.forEach(function(d){dt[d.type]=(dt[d.type]||0)+1;});
  $('#reportDocs').innerHTML=Object.keys(dt).map(function(k){return '<tr><td>'+k+'</td><td>'+dt[k]+'</td></tr>';}).join('')||'<tr><td colspan="2">No data</td></tr>';
  var st={}; data.documents.forEach(function(d){st[d.status]=(st[d.status]||0)+1;});
  $('#reportStatus').innerHTML=Object.keys(st).map(function(k){return '<tr><td>'+k+'</td><td>'+st[k]+'</td></tr>';}).join('')||'<tr><td colspan="2">No data</td></tr>';
}
