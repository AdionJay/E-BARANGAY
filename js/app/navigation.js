/**
 * Module navigation (sidebar routing).
 * Defines: navigate()
 */
function navigate(module){
  $$('.module').forEach(function(m){ m.classList.remove('active'); });
  $$('.nav-link').forEach(function(l){ l.classList.remove('active'); });
  var mod=$('#module-'+module); if(mod) mod.classList.add('active');
  var link=$('.nav-link[data-module="'+module+'"]'); if(link) link.classList.add('active');
  var titles={dashboard:'Captain Dashboard',residents:'Resident Information',profiling:'Barangay Profiling',documents:'Document Management',services:'Barangay Services',payments:'Payment Management',portal:'Resident Portal',profile:'My Profile',myrequests:'My Requests',reports:'Reports & Analytics',admin:'Captain Administration',notifications:'Notifications',secretary:'Secretary Dashboard',treasurer:'Treasurer Dashboard'};
  var pt=document.getElementById('pageTitle'); if(pt) pt.textContent=titles[module]||module;
  if(module==='dashboard') renderDashboard();
  if(module==='residents') renderResidents();
  if(module==='profiling') renderProfiling();
  if(module==='documents') renderDocuments();
  if(module==='services') renderServices();
  if(module==='payments') renderPayments();
  if(module==='portal') renderPortal();
  if(module==='profile') renderProfile();
  if(module==='myrequests') renderMyRequests();
  if(module==='reports') renderReports();
  if(module==='admin'){ renderAdmin(); renderDocTypesTable(); }
  if(module==='notifications') renderNotifications();
  if(module==='secretary'){ renderSecretary(); renderDocTypesTable(); }
  if(module==='treasurer') renderTreasurer();
  $('#sidebar').classList.remove('open');
}
