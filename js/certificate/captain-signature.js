/**
 * Captain e-signature canvas helpers.
 * Defines: _sigDrawing, initSigCanvas(), clearCaptainSig(), saveCaptainSig(), initApproveSigCanvas(), clearApproveSigCanvas()
 */
var _sigDrawing=false;

function initSigCanvas(canvasId){
  var canvas=$(canvasId); if(!canvas) return null;
  var ctx=canvas.getContext('2d');
  ctx.strokeStyle='#0a5530'; ctx.lineWidth=2; ctx.lineCap='round';
  function pos(e){
    var rect=canvas.getBoundingClientRect();
    var clientX=e.touches?e.touches[0].clientX:e.clientX;
    var clientY=e.touches?e.touches[0].clientY:e.clientY;
    return { x:(clientX-rect.left)*(canvas.width/rect.width), y:(clientY-rect.top)*(canvas.height/rect.height) };
  }
  function start(e){ e.preventDefault(); _sigDrawing=true; var p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); }
  function move(e){ if(!_sigDrawing)return; e.preventDefault(); var p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); }
  function end(e){ _sigDrawing=false; }
  canvas.onmousedown=start; canvas.onmousemove=move; canvas.onmouseup=end; canvas.onmouseleave=end;
  canvas.ontouchstart=start; canvas.ontouchmove=move; canvas.ontouchend=end;
  return ctx;
}

function clearCaptainSig(){
  var c=$('#captainSigCanvas'); if(!c)return;
  var ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
}

function saveCaptainSig(){
  var c=$('#captainSigCanvas'); if(!c)return;
  data.captainSignature=c.toDataURL('image/png');
  saveData();
  $('#captainSigPreview').innerHTML='<p style="font-size:13px;color:#059669;">Signature saved ✓</p><img src="'+data.captainSignature+'" style="max-height:70px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;">';
  showToast('Electronic signature saved');
}

function initApproveSigCanvas(){
  var c=$('#capApproveSigCanvas'); if(!c)return;
  var ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
  initSigCanvas('#capApproveSigCanvas');
}

function clearApproveSigCanvas(){
  var c=$('#capApproveSigCanvas'); if(!c)return;
  c.getContext('2d').clearRect(0,0,c.width,c.height);
}
