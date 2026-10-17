/**
 * Dashboard statistics and recent activity.
 * Defines: renderDashboard()
 */
function renderDashboard(){
  function setText(id, val){ var el=document.getElementById(id); if(el) el.textContent = val; }
  var residents = data.residents || [];
  var docs = data.documents || [];
  var pays = data.payments || [];
  var services = data.services || [];

  setText('statResidents', residents.length);
  setText('statSeniors', residents.filter(function(r){return r.senior;}).length);
  setText('statVoters', residents.filter(function(r){return r.voter;}).length);
  setText('statPendingDocs', docs.filter(function(d){return ['Pending','Under Review','Payment Pending','For Captain Approval'].indexOf(d.status)>=0;}).length);
  setText('statPendingPay', pays.filter(function(p){return p.status==='Pending';}).length);
  if($('#statServices')) $('#statServices').textContent=services.filter(function(s){return s.status==='Upcoming';}).length;
  if($('#statUnverifiedRes')) $('#statUnverifiedRes').textContent=residents.filter(function(r){return !r.verified;}).length;

  // Quick analytics numbers
  var verified = residents.filter(function(r){return r.verified;}).length;
  var released = docs.filter(function(d){return d.status==='Released';}).length;
  var paidAmt = pays.filter(function(p){return p.status==='Paid';}).reduce(function(s,p){return s+(p.amount||0);},0);
  var qs = document.getElementById('dashQuickStats');
  if(qs){
    qs.innerHTML =
      '<div class="dash-q"><span class="lbl">Verified residents</span><strong>'+verified+'</strong></div>'+
      '<div class="dash-q"><span class="lbl">Unverified</span><strong>'+(residents.length-verified)+'</strong></div>'+
      '<div class="dash-q"><span class="lbl">Released documents</span><strong>'+released+'</strong></div>'+
      '<div class="dash-q"><span class="lbl">Total collected</span><strong>₱'+paidAmt.toFixed(2)+'</strong></div>'+
      '<div class="dash-q"><span class="lbl">Active services</span><strong>'+services.filter(function(s){return s.status==='Upcoming';}).length+'</strong></div>'+
      '<div class="dash-q"><span class="lbl">ID uploaded</span><strong>'+residents.filter(function(r){return r.idVerified;}).length+'</strong></div>';
  }

  // Document status chart
  var docMap = {};
  docs.forEach(function(d){ var k=d.status||'Unknown'; docMap[k]=(docMap[k]||0)+1; });
  drawBarChart('dashChartDocs', docMap, '');
  var leg = document.getElementById('dashDocStatusLegend');
  if(leg){
    leg.innerHTML = Object.keys(docMap).map(function(k){ return '<span><i></i> '+k+': <strong>'+docMap[k]+'</strong></span>'; }).join('') || '<span class="muted">No documents yet</span>';
  }

  // Purok chart
  var purokMap = {};
  residents.forEach(function(r){
    var pk = (typeof normalizePurok==='function' ? normalizePurok(r.purok) : (r.purok||'Unassigned'));
    purokMap[pk]=(purokMap[pk]||0)+1;
  });
  drawBarChart('dashChartPurok', purokMap, '');
  var pl = document.getElementById('dashPurokLegend');
  if(pl){
    pl.innerHTML = Object.keys(purokMap).map(function(k){ return '<span>'+k+': <strong>'+purokMap[k]+'</strong></span>'; }).join('') || '<span class="muted">No residents yet</span>';
  }

  // Payments chart
  var payMap = {
    'Pending': pays.filter(function(p){return p.status==='Pending';}).length,
    'Paid': pays.filter(function(p){return p.status==='Paid';}).length
  };
  drawBarChart('dashChartPay', payMap, '');
  var payLeg = document.getElementById('dashPayLegend');
  if(payLeg){
    payLeg.innerHTML = '<span>Pending: <strong>'+payMap.Pending+'</strong></span><span>Paid: <strong>'+payMap.Paid+'</strong></span><span>Collected: <strong>₱'+paidAmt.toFixed(2)+'</strong></span>';
  }

  var tbody=$('#dashRecentDocs');
  if(tbody) tbody.innerHTML=docs.slice().sort(function(a,b){return String(b.requestDate||'').localeCompare(String(a.requestDate||''));}).slice(0,8).map(function(d){ return '<tr><td>'+d.type+'</td><td>'+getResidentName(d.residentId)+'</td><td>'+statusBadge(d.status)+'</td><td>'+formatDate(d.requestDate)+'</td></tr>'; }).join('')||'<tr><td colspan="4">No documents</td></tr>';

  // Captain/Admin: show full Secretary + Treasurer transaction tables
  var capBox = document.getElementById('captainTxnOverview');
  var r = role();
  if(capBox){
    if(r === 'Admin' || r === 'Captain'){
      capBox.style.display = 'block';
      try { renderCaptain(); } catch(e){ console.warn(e); }
    } else {
      capBox.style.display = 'none';
    }
  }
}
