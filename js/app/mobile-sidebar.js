/**
 * Mobile sidebar: toggle button, close on nav click, close on overlay click.
 * Defines: initMobileSidebar()
 */
function initMobileSidebar(){
  if($('#menuToggle')) $('#menuToggle').addEventListener('click',function(e){
    e.preventDefault();
    var sb = $('#sidebar');
    if(!sb) return;
    sb.classList.toggle('open');
    var ov = $('#sidebarOverlay');
    if(ov) ov.classList.toggle('open', sb.classList.contains('open'));
    document.body.classList.toggle('sidebar-open', sb.classList.contains('open'));
  });
  document.querySelectorAll('.nav-link').forEach(function(link){
    link.addEventListener('click', function(){
      if(window.innerWidth <= 900){
        var sb = $('#sidebar');
        if(sb) sb.classList.remove('open');
        var ov = $('#sidebarOverlay');
        if(ov) ov.classList.remove('open');
        document.body.classList.remove('sidebar-open');
      }
    });
  });
  var ov = $('#sidebarOverlay');
  if(ov){
    ov.addEventListener('click', function(){
      var sb = $('#sidebar');
      if(sb) sb.classList.remove('open');
      ov.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    });
  }
}
