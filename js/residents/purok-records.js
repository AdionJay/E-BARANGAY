/**
 * Purok name normalising and purok-based resident records.
 * Defines: normalizePurok(), migratePurokNames(), selectPurokFilter(), renderPurokResidentRecords()
 */
function normalizePurok(p){
  var s = String(p || '').trim();
  if(!s) return 'Unassigned';
  var low = s.toLowerCase();
  if(PUROK_LEGACY_MAP[low]) return PUROK_LEGACY_MAP[low];
  var m = low.match(/purok\s*(\d+)/) || low.match(/^(\d+)$/);
  if(m && PUROK_LEGACY_MAP[m[1]]) return PUROK_LEGACY_MAP[m[1]];
  for(var i=0;i<PUROK_LIST.length;i++){
    if(low === PUROK_LIST[i].toLowerCase()) return PUROK_LIST[i];
    // partial match e.g. "Maligaya"
    if(PUROK_LIST[i].toLowerCase().indexOf(low) >= 0 || low.indexOf(PUROK_LIST[i].toLowerCase().replace('purok ','')) >= 0){
      return PUROK_LIST[i];
    }
  }
  return s;
}

function migratePurokNames(){
  try {
    var changed = false;
    (data.residents || []).forEach(function(r){
      var n = normalizePurok(r.purok);
      if(r.purok !== n && n !== 'Unassigned'){ r.purok = n; changed = true; }
    });
    if(changed) saveData();
  } catch(e){}
}

function selectPurokFilter(pk){
  var filterEl = document.getElementById('purokFilterSelect');
  if(filterEl){
    filterEl.value = (pk === 'all' || pk === null || pk === undefined) ? 'all' : String(pk);
  }
  renderPurokResidentRecords();
  var body = document.getElementById('purokRecordsBody');
  if(body) try{ body.scrollIntoView({ behavior: 'smooth', block: 'start' }); }catch(e){}
}

try { window.selectPurokFilter = selectPurokFilter; } catch(e){}

function renderPurokResidentRecords(scope){
  try { migratePurokNames(); } catch(e){}
  var filterEl = document.getElementById('purokFilterSelect');
  var searchEl = document.getElementById('purokSearchInput');
  var statsEl = document.getElementById('purokRecordsStats');
  var bodyEl = document.getElementById('purokRecordsBody');
  if(!bodyEl) return;

  var filter = filterEl ? filterEl.value : 'all';
  var q = (searchEl && searchEl.value ? searchEl.value : '').toLowerCase().trim();

  var allVerified = (data.residents || []).filter(function(r){ return !!r.verified; });
  var list = allVerified.slice();
  if(q){
    list = list.filter(function(r){
      var blob = [r.firstName,r.middleName,r.lastName,r.address,r.purok,r.contact,r.occupation,r.gender,r.civilStatus,r.nationalId].join(' ').toLowerCase();
      return blob.indexOf(q) >= 0;
    });
  }

  if(statsEl){
    statsEl.innerHTML = PUROK_LIST.map(function(pk){
      var c = allVerified.filter(function(r){ return normalizePurok(r.purok) === pk; }).length;
      var active = filter === pk;
      return '<button type="button" class="stat-card purok-stat-btn'+(active?' is-active':'')+'" onclick="selectPurokFilter(\''+pk.replace(/'/g,"\\'")+'\')" title="View '+pk+'">'
        +'<div class="stat-icon blue"><i class="fas fa-home"></i></div>'
        +'<div class="stat-info"><h3>'+c+'</h3><p>'+pk.replace('Purok ','')+'</p></div>'
        +'</button>';
    }).join('') +
    '<button type="button" class="stat-card purok-stat-btn'+(filter==='all'?' is-active':'')+'" onclick="selectPurokFilter(\'all\')" title="All puroks">'
      +'<div class="stat-icon green"><i class="fas fa-layer-group"></i></div>'
      +'<div class="stat-info"><h3>'+allVerified.length+'</h3><p>All Puroks</p></div>'
      +'</button>';
  }

  var groups = {};
  PUROK_LIST.forEach(function(pk){ groups[pk] = []; });
  groups['Unassigned'] = [];
  list.forEach(function(r){
    var pk = normalizePurok(r.purok);
    if(!groups[pk]) groups[pk] = [];
    groups[pk].push(r);
  });

  var keys = filter === 'all'
    ? PUROK_LIST.concat(groups['Unassigned'].length ? ['Unassigned'] : [])
    : [filter];

  bodyEl.innerHTML = keys.map(function(pk){
    var rows = (groups[pk] || []).slice().sort(function(a,b){
      return String(a.lastName||'').localeCompare(String(b.lastName||''));
    });

    if(!rows.length){
      return '<div class="purok-group card" style="margin-bottom:14px;box-shadow:none;">'
        +'<div class="card-header" style="background:var(--primary-soft,#EAFBF6);">'
        +'<h3 style="font-size:14px;"><i class="fas fa-map-pin"></i> '+pk+' <span class="badge badge-info">0</span></h3>'
        +'</div><div class="card-body"><p class="empty-state" style="padding:12px 0;">No verified residents in '+pk+' yet.</p></div></div>';
    }

    // Profile-style cards (like resident profile)
    var cards = rows.map(function(r){
      var full = ((r.firstName||'')+' '+(r.middleName||'')+' '+(r.lastName||'')).replace(/\s+/g,' ').trim();
      var initial = full ? full.charAt(0).toUpperCase() : '?';
      var avatar = r.profilePic
      ? '<div class="purok-profile-avatar has-photo"><img src="'+String(r.profilePic).replace(/"/g,'&quot;')+'" alt="'+full.replace(/"/g,'&quot;')+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;"></div>'
      : '<div class="purok-profile-avatar">'+initial+'</div>';
      var tags = [];
      if(r.voter) tags.push('<span class="badge badge-info">Voter</span>');
      if(r.senior) tags.push('<span class="badge badge-warning">Senior</span>');
      if(r.pwd) tags.push('<span class="badge badge-danger">PWD</span>');
      if(r.idVerified) tags.push('<span class="badge badge-success">ID Uploaded</span>');
      tags.push('<span class="badge badge-success">Verified</span>');

      return '<div class="purok-profile-card">'
        +'<div class="purok-profile-head">'
        + avatar
        +'<div class="purok-profile-title">'
        +'<h4>'+full+'</h4>'
        +'<p>'+pk+(r.address ? ' · '+r.address : '')+'</p>'
        +'<div class="purok-profile-tags">'+tags.join(' ')+'</div>'
        +'</div>'
        +'<button type="button" class="btn btn-sm btn-outline" onclick="viewResidentDetail('+r.id+')">View Profile</button>'
        +'</div>'
        +'<div class="purok-profile-grid">'
        +'<div><span class="lbl">Gender</span><span>'+(r.gender||'—')+'</span></div>'
        +'<div><span class="lbl">Civil Status</span><span>'+(r.civilStatus||'—')+'</span></div>'
        +'<div><span class="lbl">Birth Date</span><span>'+(r.birthDate?formatDate(r.birthDate):'—')+'</span></div>'
        +'<div><span class="lbl">Contact</span><span>'+(r.contact||'—')+'</span></div>'
        +'<div><span class="lbl">Occupation</span><span>'+(r.occupation||'—')+'</span></div>'
        +'<div><span class="lbl">National ID</span><span>'+(r.nationalId||'—')+'</span></div>'
        +'<div><span class="lbl">Address</span><span>'+(r.address||'—')+'</span></div>'
        +'<div><span class="lbl">Purok</span><span>'+pk+'</span></div>'
        +'</div></div>';
    }).join('');

    return '<div class="purok-group card" style="margin-bottom:14px;box-shadow:none;">'
      +'<div class="card-header" style="background:var(--primary-soft,#EAFBF6);">'
      +'<h3 style="font-size:14px;"><i class="fas fa-map-pin"></i> '+pk+' <span class="badge badge-info">'+rows.length+' residents</span></h3>'
      +'</div><div class="card-body"><div class="purok-profile-list">'+cards+'</div></div></div>';
  }).join('');
}
