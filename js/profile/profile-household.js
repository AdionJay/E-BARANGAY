/**
 * Household section on the resident profile.
 * Defines: buildProfileHouseholdHtml(), toggleProfileHouseholdEdit(), renderProfHhEditor(), profAddHhMember(), profRemoveHhMember(), collectProfHhFromEditor(), saveProfileHousehold()
 */
function buildProfileHouseholdHtml(r){
  var members = ensureHousehold(r);
  if(!members.length) return '<p class="muted-note">Walang household member recorded. Click Edit Members to add.</p>';
  return '<div class="table-responsive"><table style="font-size:13px;"><thead><tr><th>Name</th><th>Relation</th><th>Birth Date</th><th>Age</th></tr></thead><tbody>'+
    members.map(function(m){
      return '<tr><td>'+escapeHtml(m.name||'—')+'</td><td>'+escapeHtml(m.relation||'—')+'</td><td>'+(m.birthDate?formatDate(m.birthDate):'—')+'</td><td>'+formatAge(m.birthDate)+'</td></tr>';
    }).join('')+'</tbody></table></div>';
}

function toggleProfileHouseholdEdit(){
  var u=data.currentUser; if(!u||!u.residentId) return;
  var r=data.residents.find(function(x){return x.id===u.residentId;}); if(!r) return;
  var panel=$('#profileHouseholdPanel'); if(!panel) return;
  var members=ensureHousehold(r).slice();
  panel.innerHTML=
    '<div id="profHhEditor"></div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">'+
      '<button class="btn btn-sm btn-outline" onclick="profAddHhMember()" style="width:auto;">+ Add Member</button>'+
      '<button class="btn btn-sm btn-primary" onclick="saveProfileHousehold()" style="width:auto;">Save Members</button>'+
      '<button class="btn btn-sm btn-secondary" onclick="renderProfile()" style="width:auto;">Cancel</button>'+
    '</div>';
  window._profHhMembers = members;
  renderProfHhEditor();
}

function renderProfHhEditor(){
  var box=$('#profHhEditor'); if(!box) return;
  var members=window._profHhMembers||[];
  if(!members.length){ box.innerHTML='<p class="muted-note">No members yet.</p>'; return; }
  box.innerHTML=members.map(function(m,i){
    return '<div class="hh-row" style="display:grid;grid-template-columns:1.4fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;">'+
      '<div class="form-group" style="margin:0;"><label style="font-size:11px;">Name</label><input type="text" class="phh-name" value="'+(m.name||'').replace(/"/g,'&quot;')+'"></div>'+
      '<div class="form-group" style="margin:0;"><label style="font-size:11px;">Relation</label><select class="phh-relation">'+
        ['Spouse','Child','Parent','Sibling','Relative','Other'].map(function(rel){ return '<option'+(m.relation===rel?' selected':'')+'>'+rel+'</option>'; }).join('')+
      '</select></div>'+
      '<div class="form-group" style="margin:0;"><label style="font-size:11px;">Birth Date</label><input type="date" class="phh-birth" value="'+(m.birthDate||'')+'"></div>'+
      '<button type="button" class="btn btn-sm btn-danger" onclick="profRemoveHhMember('+i+')" style="width:auto;padding:4px 8px;">×</button>'+
    '</div>';
  }).join('');
}

function profAddHhMember(){
  window._profHhMembers = window._profHhMembers || [];
  window._profHhMembers.push({name:'',relation:'Child',birthDate:''});
  renderProfHhEditor();
}

function profRemoveHhMember(idx){
  window._profHhMembers = window._profHhMembers || [];
  window._profHhMembers.splice(idx,1);
  renderProfHhEditor();
}

function collectProfHhFromEditor(){
  var box=$('#profHhEditor'); if(!box) return [];
  var rows=box.querySelectorAll('.hh-row');
  var out=[];
  rows.forEach(function(row){
    var name=(row.querySelector('.phh-name')&&row.querySelector('.phh-name').value.trim())||'';
    var relation=(row.querySelector('.phh-relation')&&row.querySelector('.phh-relation').value)||'';
    var birthDate=(row.querySelector('.phh-birth')&&row.querySelector('.phh-birth').value)||'';
    if(name) out.push({name:name,relation:relation,birthDate:birthDate});
  });
  return out;
}

function saveProfileHousehold(){
  var u=data.currentUser; if(!u||!u.residentId) return;
  var r=data.residents.find(function(x){return x.id===u.residentId;}); if(!r) return;
  r.householdMembers = collectProfHhFromEditor();
  saveData();
  showToast('Household members updated');
  renderProfile();
}
