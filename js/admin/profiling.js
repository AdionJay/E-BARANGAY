/**
 * Barangay profile (name, captain, contact).
 * Defines: renderProfiling(), saveProfiling()
 */
function renderProfiling(){
  syncProfilingStats();
  var p=data.profiling;
  $('#profName').value=p.name; $('#profCity').value=p.city; $('#profProvince').value=p.province;
  $('#profPopulation').value=p.population; $('#profHouseholds').value=p.households; $('#profPuroks').value=p.puroks;
  $('#profCaptain').value=p.captain; $('#profContact').value=p.contact; $('#profEmail').value=p.email;
  $('#profAddress').value=p.address; $('#profLandArea').value=p.landArea; $('#profEstablished').value=p.established;
  // Stats based on verified population where relevant
  var verified=data.residents.filter(function(r){return r.verified;});
  $('#profStatPop').textContent=p.population;
  $('#profStatMale').textContent=verified.filter(function(r){return r.gender==='Male';}).length;
  $('#profStatFemale').textContent=verified.filter(function(r){return r.gender==='Female';}).length;
  $('#profStatSenior').textContent=verified.filter(function(r){return r.senior;}).length;
  $('#profStatPwd').textContent=verified.filter(function(r){return r.pwd;}).length;
  $('#profStatVoter').textContent=verified.filter(function(r){return r.voter;}).length;
  if($('#profAutoNote')){
    $('#profAutoNote').textContent='Population and Households Update.';
  }
}

function saveProfiling(){
  data.profiling={name:$('#profName').value,city:$('#profCity').value,province:$('#profProvince').value,population:parseInt($('#profPopulation').value)||0,households:parseInt($('#profHouseholds').value)||0,puroks:parseInt($('#profPuroks').value)||0,captain:$('#profCaptain').value,contact:$('#profContact').value,email:$('#profEmail').value,address:$('#profAddress').value,landArea:$('#profLandArea').value,established:$('#profEstablished').value};
  // Keep population/households tied to verified residents
  syncProfilingStats();
  saveData(); showToast('Profile updated');
}
