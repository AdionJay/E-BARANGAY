/**
 * Load the barangay seal as a data URL for PDFs.
 * Defines: _barangayLogoDataUrl, _barangayLogoLoading, loadBarangayLogoDataUrl()
 */
/* Cached barangay logo (PNG data URL) for certificate headers */
var _barangayLogoDataUrl = null;

var _barangayLogoLoading = null;

function loadBarangayLogoDataUrl(){
  if(_barangayLogoDataUrl) return Promise.resolve(_barangayLogoDataUrl);
  if(_barangayLogoLoading) return _barangayLogoLoading;
  _barangayLogoLoading = new Promise(function(resolve){
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function(){
      try {
        var size = 256;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        _barangayLogoDataUrl = canvas.toDataURL('image/png');
        resolve(_barangayLogoDataUrl);
      } catch(e){
        console.warn('Logo rasterize failed', e);
        resolve(null);
      }
    };
    img.onerror = function(){ resolve(null); };
    img.src = 'assets/barangay-seal.png';
  });
  return _barangayLogoLoading;
}
