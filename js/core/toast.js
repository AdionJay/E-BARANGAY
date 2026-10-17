/**
 * Toast notification popup.
 * Defines: showToast()
 */
function showToast(msg,type){ var t=$('#toast'); if(!t){ console.log(msg); return; } t.textContent=msg; t.className='toast show '+(type||'success'); setTimeout(function(){t.classList.remove('show');},3200); }
