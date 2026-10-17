/**
 * Capture the National ID by upload or webcam.
 * Defines: _ocrPendingImage, _ocrPendingText, _webcamStream, scanNationalId(), stopWebcam(), closeWebcamModal(), captureWebcamId(), uploadNationalId(), handleIdUpload()
 */
var _ocrPendingImage = null;

var _ocrPendingText = null;

var _webcamStream = null;

function scanNationalId(){
  // Live webcam scanner modal
  $('#webcamModal').classList.add('active');
  $('#webcamStatus').textContent = 'Starting camera…';
  var video = $('#webcamVideo');
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    $('#webcamStatus').textContent = 'Camera not supported. Use Upload an Image instead.';
    showToast('Camera not available on this device','error');
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then(function(stream){
      _webcamStream = stream;
      video.srcObject = stream;
      video.play();
      $('#webcamStatus').textContent = 'Align your National ID in the frame, then tap Capture';
    })
    .catch(function(err){
      console.error(err);
      $('#webcamStatus').textContent = 'Could not access camera. Try Upload an Image.';
      showToast('Camera permission denied or unavailable','error');
    });
}

function stopWebcam(){
  if(_webcamStream){
    _webcamStream.getTracks().forEach(function(t){ t.stop(); });
    _webcamStream = null;
  }
  var video = $('#webcamVideo');
  if(video){ video.srcObject = null; }
}

function closeWebcamModal(){
  stopWebcam();
  closeModal('webcamModal');
}

function captureWebcamId(){
  var video = $('#webcamVideo');
  if(!video || !video.videoWidth){ showToast('Camera not ready','error'); return; }
  var canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  stopWebcam();
  closeModal('webcamModal');
  runOcrOnImage(dataUrl);
}

function uploadNationalId(){
  var input = $('#idFileInput');
  if(input){
    input.removeAttribute('capture');
    input.click();
  }
}

function handleIdUpload(e){
  var file = e.target.files && e.target.files[0];
  if(!file) return;
  if(!file.type.match(/^image\//)){ showToast('Please select an image file','error'); return; }
  // Reset input so same file can be re-selected
  e.target.value = '';

  var reader = new FileReader();
  reader.onload = function(ev){
    runOcrOnImage(ev.target.result);
  };
  reader.readAsDataURL(file);
}
