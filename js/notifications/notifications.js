/**
 * In-app notifications (create, list, read, delete, badge).
 * Defines: addNotif(), getVisibleNotifications(), renderNotifications(), markNotifRead(), deleteNotification(), markAllRead(), clearReadNotifications(), updateNotifBadge()
 */
function addNotif(title,message,type,forRole,residentId,category){
  data.notifications.unshift({id:nextId(data.notifications),title:title,message:message,time:'Just now',type:type||'info',read:false,forRole:forRole||null,residentId:residentId||null,category:category||'general'});
}

function getVisibleNotifications(){
  var list = data.notifications || [];
  var r = role();
  var u = data.currentUser;
  if(!u) return [];

  /* RESIDENT: ONLY own transaction process (document + payment).
     Never see official/admin queue items or other residents' alerts. */
  if(r === 'Resident'){
    var rid = u.residentId;
    if(!rid) return [];
    return list.filter(function(n){
      // Must be addressed to this resident
      if(n.residentId !== rid) return false;
      if(n.forRole && n.forRole !== 'Resident') return false;
      var cat = (n.category || '').toLowerCase();
      // Transaction process only
      if(cat === 'document' || cat === 'payment') return true;
      // Allow account-status tied to transacting (verification / registration)
      if(cat === 'account') return true;
      // Legacy items without category: infer from title for this resident only
      var t = ((n.title || '') + ' ' + (n.message || '')).toLowerCase();
      if(/document|request|clearance|residency|indigency|permit|barangay id|approved|released|rejected|under review|payment|gcash|fee|paid|or[- ]?no/.test(t)) return true;
      return false;
    });
  }

  /* OFFICIALS & ADMIN: role queues only. Never resident-personal transaction alerts. */
  return list.filter(function(n){
    // Exclude anything explicitly for residents
    if(n.forRole === 'Resident') return false;
    // Exclude personal resident-targeted items even if forRole missing
    if(n.residentId != null && n.residentId !== '' && !n.forRole) return false;
    if(r === 'Admin'){
      // Captain (Admin role) sees system + all official queues (not resident personal)
      return n.forRole === 'Admin' || n.forRole === 'Secretary' || n.forRole === 'Treasurer' || n.forRole === 'Captain' || !n.forRole;
    }
    // Specific official role: only their queue (and optional Admin broadcast)
    return n.forRole === r;
  });
}

function renderNotifications(){
  var list = getVisibleNotifications();
  var r = role();
  var unread = list.filter(function(n){ return !n.read; }).length;

  function notifItem(n){
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var bg = n.type === 'success' ? (dark ? '#1e3a5f' : '#dbeafe') : n.type === 'warning' ? (dark ? '#422006' : '#fef3c7') : (dark ? '#0c4a6e' : '#e0f2fe');
    var col = n.type === 'success' ? (dark ? '#93c5fd' : '#1d4ed8') : n.type === 'warning' ? (dark ? '#fcd34d' : '#d97706') : (dark ? '#7dd3fc' : '#0284c7');
    var ic = n.type === 'success' ? '✓' : n.type === 'warning' ? '!' : 'i';
    var cat = n.category === 'document' ? '📄' : n.category === 'payment' ? '💰' : n.category === 'account' ? '👤' : '🔔';
    return '<li class="notif-item'+(n.read ? ' is-read' : ' is-new')+'">'+
      '<div class="notif-icon" style="background:'+bg+';color:'+col+'">'+ic+'</div>'+
      '<div class="notif-content" style="flex:1">'+
      '<h4>'+cat+' '+escapeHtml(n.title)+(n.read ? '' : ' <span class="badge badge-danger" style="font-size:9px">NEW</span>')+'</h4>'+
      '<p>'+escapeHtml(n.message)+'</p>'+
      '<div class="notif-time">'+(n.time || '')+'</div></div>'+
      (n.read ? '' : '<button class="btn btn-sm btn-outline" onclick="markNotifRead('+n.id+')" style="margin-right:4px;">Mark Read</button>')+
      '<button class="btn btn-sm btn-danger" onclick="deleteNotification('+n.id+')">Delete</button></li>';
  }

  // Header summary
  var titleEl = $('#notifModuleTitle') || document.querySelector('#module-notifications .card-header h3');
  if(titleEl){
    if(r === 'Resident') titleEl.textContent = 'My Transaction Notifications';
    else if(r === 'Admin') titleEl.textContent = 'Captain — Official & System Notifications';
    else titleEl.textContent = r + ' Notifications';
  }

  if(r === 'Resident'){
    var docs = list.filter(function(n){
      var cat = (n.category || '').toLowerCase();
      if(cat === 'document') return true;
      if(cat === 'payment' || cat === 'account') return false;
      return /document|request|clearance|residency|indigency|permit|approved|released|rejected|under review/i.test((n.title||'')+' '+(n.message||''));
    });
    var pays = list.filter(function(n){
      var cat = (n.category || '').toLowerCase();
      if(cat === 'payment') return true;
      if(cat === 'document' || cat === 'account') return false;
      return /payment|gcash|fee|paid|collect/i.test((n.title||'')+' '+(n.message||''));
    });
    var seen = {};
    docs.forEach(function(n){ seen[n.id] = true; });
    pays = pays.filter(function(n){ return !seen[n.id]; });
    pays.forEach(function(n){ seen[n.id] = true; });
    var acct = list.filter(function(n){ return !seen[n.id]; });

    var html = '';
    html += '<div class="notif-summary"><span class="badge badge-info">'+list.length+' total</span> <span class="badge badge-danger">'+unread+' unread</span> <span style="font-size:12px;color:var(--text-muted);margin-left:8px;">Only your document &amp; payment transactions appear here. Official queues are hidden.</span></div>';
    html += '<h4 class="notif-section-title">📄 Document Transactions</h4>';
    html += docs.length ? docs.map(notifItem).join('') : '<div class="notif-empty">No document transaction alerts yet. Request a document from the Resident Portal.</div>';
    html += '<h4 class="notif-section-title">💰 Payment Transactions</h4>';
    html += pays.length ? pays.map(notifItem).join('') : '<div class="notif-empty">No payment alerts yet.</div>';
    html += '<h4 class="notif-section-title">👤 Account Status</h4>';
    html += acct.length ? acct.map(notifItem).join('') : '<div class="notif-empty">No account status updates.</div>';
    $('#notifList').innerHTML = html;
  } else {
    var roleLabel = r === 'Admin'
      ? 'Showing official and system alerts only. Resident personal transaction notifications are delivered solely to that resident.'
      : ('Showing <strong>'+r+'</strong> queue only. Resident transaction updates go to the resident — not here.');
    var html = '<div class="notif-summary"><span class="badge badge-info">'+list.length+' total</span> <span class="badge badge-danger">'+unread+' unread</span> <span style="font-size:12px;color:var(--text-muted);margin-left:8px;">'+roleLabel+'</span></div>';
    if(!list.length){
      html += '<div class="empty-state" style="padding:28px;">No notifications for your role</div>';
    } else {
      // Group official notifs by category for cleaner view
      var byCat = { document:[], payment:[], account:[], other:[] };
      list.forEach(function(n){
        var c = (n.category || 'other').toLowerCase();
        if(c === 'document') byCat.document.push(n);
        else if(c === 'payment') byCat.payment.push(n);
        else if(c === 'account') byCat.account.push(n);
        else byCat.other.push(n);
      });
      if(byCat.document.length){ html += '<h4 class="notif-section-title">📄 Document Queue</h4>' + byCat.document.map(notifItem).join(''); }
      if(byCat.payment.length){ html += '<h4 class="notif-section-title">💰 Payment Queue</h4>' + byCat.payment.map(notifItem).join(''); }
      if(byCat.account.length){ html += '<h4 class="notif-section-title">👤 Account / Registration</h4>' + byCat.account.map(notifItem).join(''); }
      if(byCat.other.length){ html += '<h4 class="notif-section-title">🔔 Other</h4>' + byCat.other.map(notifItem).join(''); }
    }
    $('#notifList').innerHTML = html;
  }
}

function markNotifRead(id){
  var n = data.notifications.find(function(x){ return x.id === id; });
  if(n){ n.read = true; saveData(); renderNotifications(); updateNotifBadge(); }
}

function deleteNotification(id){
  var visible = getVisibleNotifications().some(function(n){ return n.id === id; });
  if(!visible){ showToast('Cannot delete this notification','error'); return; }
  data.notifications = data.notifications.filter(function(n){ return n.id !== id; });
  saveData(); showToast('Notification deleted'); renderNotifications(); updateNotifBadge();
}

function markAllRead(){
  var ids = {};
  getVisibleNotifications().forEach(function(n){ ids[n.id] = true; });
  data.notifications.forEach(function(n){ if(ids[n.id]) n.read = true; });
  saveData(); renderNotifications(); updateNotifBadge(); showToast('All marked as read');
}

function clearReadNotifications(){
  openConfirmModal({
    title: 'Clear Read Notifications',
    message: 'Remove '+keys.length+' read notification(s)?',
    okLabel: 'Remove',
    variant: 'danger',
    onConfirm: function(){
  data.notifications = data.notifications.filter(function(n){ return !ids[n.id]; });
  saveData(); renderNotifications(); updateNotifBadge(); showToast('Read notifications cleared');

    }
  });
}

function updateNotifBadge(){
  var unread = getVisibleNotifications().filter(function(n){ return !n.read; }).length;
  var b = $('#notifBadge');
  if(!b) return;
  b.textContent = unread;
  b.style.display = unread > 0 ? 'flex' : 'none';
}
