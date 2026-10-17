/**
 * Resident self-registration.
 * Defines: submitRegistration()
 */
function submitRegistration(){
  try {
  var fnEl=$('#regFirstName'), lnEl=$('#regLastName');
  if(!fnEl||!lnEl){ showToast('Registration form not ready','error'); return; }
  var fn=fnEl.value.trim(), ln=lnEl.value.trim();
  var un=$('#regUsername').value.trim(), pw=$('#regPassword').value;
  var addr=$('#regAddress').value.trim(), purok=$('#regPurok').value.trim(), contact=$('#regContact').value.trim();
  var mid=$('#regMiddleName').value.trim(), proof=$('#regProof').value.trim();
  var gender=($('#regGender')&&$('#regGender').value)||'Male';
  var civil=($('#regCivilStatus')&&$('#regCivilStatus').value)||'Single';
  var birth=($('#regBirthDate')&&$('#regBirthDate').value)||'';
  var occupation=($('#regOccupation')&&$('#regOccupation').value.trim())||'';
  if(!fn||!ln||!un||!pw||!addr){ showToast('Fill required fields','error'); return; }
  if(data.users.find(function(u){return u.username===un;})){ showToast('Username already taken','error'); return; }
  // Create resident record (unverified until ID scan + Secretary)
  var rid = nextId(data.residents);
  // Ensure sequential after append
  data.residents.push({
    id: rid, firstName:fn, lastName:ln, middleName:mid, birthDate:birth, gender:gender, civilStatus:civil,
    address:addr, purok:purok||'', contact:contact||'', occupation:occupation, voter:false, senior:false, pwd:false,
    status:'Active', verified:false, verifiedBy:null, verifiedDate:null, registered:today(),
    proof:proof||null, nationality:'Filipino', birthplace:'', email:'',
    nationalId:null, idVerified:false, idVerifiedDate:null, idImage:null, ocrText:null, ocrName:null, profilePic:null
  });
  renumberResidents();
  // Find the new resident id after renumber (last one matching name)
  var newRes = data.residents.find(function(r){ return r.firstName===fn && r.lastName===ln && r.address===addr; });
  var newId = newRes ? newRes.id : data.residents.length;
  // Create user account linked to resident
  var user = { username:un, password:pw, role:'Resident', name:fn+' '+ln, residentId:newId };
  data.users.push(user);
  addNotif('New Resident Registered', fn+' '+ln+' registered and needs residency verification','warning','Secretary',null,'account');
  addNotif('Welcome','Your account is ready. Scan your National ID in My Profile, then wait for Secretary verification before requesting documents.','info','Resident',newId,'account');
  // Auto-login
  data.currentUser = user;
  saveData();
  ['regFirstName','regLastName','regMiddleName','regUsername','regPassword','regAddress','regPurok','regContact','regProof','regBirthDate','regOccupation'].forEach(function(i){ if($('#'+i))$('#'+i).value=''; });
  showApp();
  showToast('Account created! You are now logged in. Scan your National ID in Profile.');
  navigate('profile');
  } catch(err){ console.error('register error', err); showToast('Registration failed — please try again','error'); }
}
