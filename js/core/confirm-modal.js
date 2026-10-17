/**
 * Reusable confirm / delete dialog.
 * Defines: _confirmCallback, closeConfirmModal(), openConfirmModal()
 */
/* >>> TITLE: FORMAL CONFIRM CARD (replaces browser confirm) <<< */
var _confirmCallback = null;

function closeConfirmModal(){
  _confirmCallback = null;
  var m = document.getElementById('confirmModal');
  if(m) m.classList.remove('active');
}

function openConfirmModal(opts){
  opts = opts || {};
  var title = opts.title || 'Confirm';
  var message = opts.message || 'Are you sure?';
  var okLabel = opts.okLabel || 'Confirm';
  var cancelLabel = opts.cancelLabel || 'Cancel';
  var variant = opts.variant || 'danger'; // danger | warn | info
  _confirmCallback = typeof opts.onConfirm === 'function' ? opts.onConfirm : null;

  var modal = document.getElementById('confirmModal');
  var titleEl = document.getElementById('confirmModalTitle');
  var msgEl = document.getElementById('confirmModalMessage');
  var okBtn = document.getElementById('confirmModalOk');
  var cancelBtn = document.getElementById('confirmModalCancel');
  var iconWrap = document.getElementById('confirmModalIcon');
  var box = modal ? modal.querySelector('.eb-confirm-modal') : null;

  if(titleEl) titleEl.innerHTML = (variant === 'danger'
    ? '<i class="fas fa-trash-can"></i> '
    : variant === 'warn'
      ? '<i class="fas fa-triangle-exclamation"></i> '
      : '<i class="fas fa-circle-question"></i> ') + title;
  if(msgEl) msgEl.textContent = message;
  if(okBtn){
    okBtn.textContent = okLabel;
    okBtn.className = 'btn ' + (variant === 'danger' ? 'btn-danger' : (variant === 'warn' ? 'btn-primary' : 'btn-primary'));
  }
  if(cancelBtn) cancelBtn.textContent = cancelLabel;
  if(box){
    box.classList.remove('is-warn','is-info');
    if(variant === 'warn') box.classList.add('is-warn');
    if(variant === 'info') box.classList.add('is-info');
  }
  if(iconWrap){
    iconWrap.innerHTML = variant === 'danger'
      ? '<i class="fas fa-trash-can"></i>'
      : variant === 'warn'
        ? '<i class="fas fa-triangle-exclamation"></i>'
        : '<i class="fas fa-circle-question"></i>';
  }
  if(okBtn){
    okBtn.onclick = function(){
      var cb = _confirmCallback;
      closeConfirmModal();
      if(cb) cb();
    };
  }
  if(modal) modal.classList.add('active');
}

try {
  window.openConfirmModal = openConfirmModal;
  window.closeConfirmModal = closeConfirmModal;
} catch(e){}
