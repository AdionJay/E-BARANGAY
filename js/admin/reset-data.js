/**
 * Reset all system data.
 * Defines: resetData()
 */
function resetData(){
  openConfirmModal({
    title: 'Reset All Data',
    message: 'Reset ALL data?',
    okLabel: 'Reset Everything',
    variant: 'danger',
    onConfirm: function(){ localStorage.removeItem(STORAGE_KEY); data=loadData(); syncProfilingStats(); showToast('Data reset — clean empty database'); navigate('dashboard'); 
    }
  });
}
