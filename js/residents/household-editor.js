/**
 * Household member editor inside the resident form.
 * Defines: renderHouseholdEditor(), addHouseholdMemberRow(), removeHouseholdMemberRow(), collectHouseholdFromEditor()
 */
function renderHouseholdEditor(members){
  var box=$('#resHouseholdList'); if(!box) return;
  members = members || [];
  if(!members.length){
    box.innerHTML='<p style="font-size:12px;color:#6b7280;margin:0;">Walang household member. Click "+ Add Member".</p>';
    return;
  }
  box.innerHTML=members.map(function(m,i){
    return '<div class="hh-row" data-idx="'+i+'" style="display:grid;grid-template-columns:1.4fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;">'+
      '<div class="form-group" style="margin:0;"><label style="font-size:11px;">Name</label><input type="text" class="hh-name" value="'+(m.name||'').replace(/"/g,'&quot;')+'"></div>'+
      '<div class="form-group" style="margin:0;"><label style="font-size:11px;">Relation</label><select class="hh-relation">'+
        ['Spouse','Child','Parent','Sibling','Relative','Other'].map(function(rel){ return '<option'+(m.relation===rel?' selected':'')+'>'+rel+'</option>'; }).join('')+
      '</select></div>'+
      '<div class="form-group" style="margin:0;"><label style="font-size:11px;">Birth Date</label><input type="date" class="hh-birth" value="'+(m.birthDate||'')+'" onchange="var a=calcAge(this.value);var s=this.parentNode.querySelector(\'.hh-age\');if(s)s.textContent=a===null?\'—\':(a+\' yrs\');"></div>'+
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;"><span class="hh-age" style="font-size:11px;font-weight:600;">'+formatAge(m.birthDate)+'</span><button type="button" class="btn btn-sm btn-danger" onclick="removeHouseholdMemberRow('+i+')" style="width:auto;padding:4px 8px;">×</button></div>'+
    '</div>';
  }).join('');
}

function addHouseholdMemberRow(){
  var members=collectHouseholdFromEditor();
  members.push({name:'',relation:'Child',birthDate:''});
  renderHouseholdEditor(members);
}

function removeHouseholdMemberRow(idx){
  var members=collectHouseholdFromEditor();
  members.splice(idx,1);
  renderHouseholdEditor(members);
}

function collectHouseholdFromEditor(){
  var box=$('#resHouseholdList'); if(!box) return [];
  var rows=box.querySelectorAll('.hh-row');
  var out=[];
  rows.forEach(function(row){
    var name=(row.querySelector('.hh-name')&&row.querySelector('.hh-name').value.trim())||'';
    var relation=(row.querySelector('.hh-relation')&&row.querySelector('.hh-relation').value)||'';
    var birthDate=(row.querySelector('.hh-birth')&&row.querySelector('.hh-birth').value)||'';
    if(name) out.push({name:name,relation:relation,birthDate:birthDate});
  });
  return out;
}

try {
  window.renderHouseholdEditor = renderHouseholdEditor;
  window.addHouseholdMemberRow = addHouseholdMemberRow;
  window.removeHouseholdMemberRow = removeHouseholdMemberRow;
  window.collectHouseholdFromEditor = collectHouseholdFromEditor;
} catch(e){}
