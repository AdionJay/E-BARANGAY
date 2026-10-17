/**
 * Auto-compute population and household stats.
 * Defines: syncProfilingStats()
 */
function syncProfilingStats(){
  if(!data.profiling) data.profiling = {};
  var verified = data.residents.filter(function(r){ return r.verified; });
  data.profiling.population = verified.length;
  var homes = {};
  verified.forEach(function(r){
    var key = String(r.address || '').toLowerCase().trim() + '|' + String(r.purok || '').toLowerCase().trim();
    if(key !== '|') homes[key] = true;
  });
  data.profiling.households = Object.keys(homes).length;
  // Keep form fields in sync if profiling module is open
  if($('#profPopulation')) $('#profPopulation').value = data.profiling.population;
  if($('#profHouseholds')) $('#profHouseholds').value = data.profiling.households;
}
