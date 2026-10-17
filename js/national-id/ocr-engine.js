/**
 * Image preprocessing and Tesseract OCR run.
 * Defines: preprocessIdImage(), runOcrOnImage()
 */
function preprocessIdImage(dataUrl){
  return new Promise(function(resolve){
    var img = new Image();
    img.onload = function(){
      try {
        var maxW = 1600;
        var scale = img.width > maxW ? maxW / img.width : 1;
        var w = Math.round(img.width * scale);
        var h = Math.round(img.height * scale);
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var imageData = ctx.getImageData(0, 0, w, h);
        var d = imageData.data;
        // Grayscale + mild contrast stretch for clearer OCR
        for(var i=0;i<d.length;i+=4){
          var g = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
          g = (g - 128) * 1.35 + 128;
          if(g < 0) g = 0; if(g > 255) g = 255;
          d[i]=d[i+1]=d[i+2]=g;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch(e){
        console.warn('preprocess failed', e);
        resolve(dataUrl);
      }
    };
    img.onerror = function(){ resolve(dataUrl); };
    img.src = dataUrl;
  });
}

function runOcrOnImage(dataUrl){
  if(typeof Tesseract === 'undefined'){
    showToast('OCR library failed to load. Check internet connection.','error');
    return;
  }
  _ocrPendingImage = dataUrl;
  _ocrPendingText = null;
  _ocrMatchScore = 0;

  $('#ocrProgress').style.display = 'block';
  $('#ocrResult').style.display = 'none';
  $('#ocrConfirmBtn').style.display = 'none';
  $('#ocrBar').style.width = '0%';
  $('#ocrPercent').textContent = '0%';
  $('#ocrStatusText').textContent = 'Enhancing ID image…';
  $('#ocrModal').classList.add('active');

  preprocessIdImage(dataUrl).then(function(enhanced){
    $('#ocrStatusText').textContent = 'Loading OCR engine…';
    return Tesseract.recognize(enhanced, 'eng', {
      logger: function(m){
        if(m.status === 'recognizing text' && m.progress != null){
          var pct = Math.round(m.progress * 100);
          $('#ocrBar').style.width = pct + '%';
          $('#ocrPercent').textContent = pct + '%';
          $('#ocrStatusText').textContent = 'Reading National ID… ' + pct + '%';
        } else if(m.status){
          $('#ocrStatusText').textContent = m.status.replace(/_/g,' ') + '…';
        }
      },
      tessedit_pageseg_mode: '4',
      preserve_interword_spaces: '1'
    });
  }).then(function(result){
    var text = (result && result.data && result.data.text) ? result.data.text : '';
    _ocrPendingText = text;
    showOcrResults(dataUrl, text);
  }).catch(function(err){
    console.error(err);
    $('#ocrProgress').style.display = 'none';
    showToast('OCR failed: ' + (err.message || 'unknown error'), 'error');
    closeModal('ocrModal');
  });
}
