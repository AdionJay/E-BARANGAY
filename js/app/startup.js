/**
 * Application entry point — runs after every module has been loaded.
 * Keeps resident ids sequential, then wires up the page on DOMContentLoaded.
 * Defines: (none — registers startup hooks only)
 */
try { renumberResidents(); } catch(e){ console.warn(e); }

document.addEventListener('DOMContentLoaded',function(){
  try{ hideInAppThemeToggle(); }catch(e){}
  try{ initTheme(); }catch(e){ console.warn(e); }
  try{ syncProfilingStats(); }catch(e){}
  try{ ensureDocTypes(data); }catch(e){}

  if(data && data.currentUser) showApp();

  bindAuthForms();
  initMobileSidebar();
});
