/**
 * Coloured status badge HTML for documents/payments.
 * Defines: statusBadge()
 */
function statusBadge(st){
  var map={'Pending':'warning','Under Review':'info','Endorsed':'info','Payment Pending':'warning','For Captain Approval':'info','Approved':'success','Released':'success','Rejected':'danger','Paid':'success'};
  return '<span class="badge badge-'+(map[st]||'secondary')+'">'+st+'</span>';
}
