// =========================================================
// 1. AUTHENTICATION & LOGIN LOGIC
// =========================================================
function isValidEmail(email) {
  return email && email.length >= 5 && /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
}

async function doLogin() {
  const email    = (document.getElementById('login-email').value || '').trim().toLowerCase();
  const password = (document.getElementById('login-pass').value  || '').trim();
  const errEl    = document.getElementById('login-error');
  errEl.style.display = 'none'; errEl.innerText = '';
  if (!email)                 { errEl.innerText = 'Please enter your Email Address.'; errEl.style.display = 'block'; return; }
  if (!isValidEmail(email))   { errEl.innerText = 'Please enter a valid Email Address.'; errEl.style.display = 'block'; return; }
  if (!password)              { errEl.innerText = 'Please enter your Password.'; errEl.style.display = 'block'; return; }
  try {
    const response = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (result.success) {
      document.getElementById('login-wrapper').style.display = 'none';
      document.getElementById('main-app').style.display = 'block';
    } else {
      errEl.innerText = result.message || 'Invalid Email or Password. Please try again.';
      errEl.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
    errEl.innerText = 'Server Error. Make sure Python Database is running.';
    errEl.style.display = 'block';
  }
}

function logout() {
  document.getElementById('login-wrapper').style.display = 'flex';
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value  = '';
}

function showRegister() {
  document.getElementById('register-modal').style.display = 'flex';
  document.getElementById('reg-step-1').style.display = 'block';
  document.getElementById('reg-step-2').style.display = 'none';
  ['reg-firstname','reg-surname','reg-phone','reg-email','reg-pass'].forEach(id => {
    document.getElementById(id).value = '';
  });
}
function closeRegisterModal() { document.getElementById('register-modal').style.display = 'none'; }
function nextStep() {
  const fname = (document.getElementById('reg-firstname').value || '').trim();
  const sname = (document.getElementById('reg-surname').value || '').trim();
  const phone = (document.getElementById('reg-phone').value || '').trim();
  if (!fname || !sname || !phone) { alert('Please fill all fields in Step 1.'); return; }
  document.getElementById('reg-step-1').style.display = 'none';
  document.getElementById('reg-step-2').style.display = 'block';
}
function prevStep() {
  document.getElementById('reg-step-1').style.display = 'block';
  document.getElementById('reg-step-2').style.display = 'none';
}
async function registerUser() {
  const firstname = (document.getElementById('reg-firstname').value || '').trim();
  const surname   = (document.getElementById('reg-surname').value || '').trim();
  const phone     = (document.getElementById('reg-phone').value || '').trim();
  const email     = (document.getElementById('reg-email').value || '').trim().toLowerCase();
  const password  = (document.getElementById('reg-pass').value || '').trim();
  if (!email || !password) { alert('Please enter Email and Password.'); return; }
  if (!isValidEmail(email)) { alert('Invalid Email Address.'); return; }
  if (password.length < 4)  { alert('Password must be at least 4 characters.'); return; }
  try {
    const response = await fetch('http://127.0.0.1:5000/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, display_name: firstname + ' ' + surname, phone })
    });
    const result = await response.json();
    if (result.success) {
      alert('✅ Registration successful! Please ask the Admin to grant you access.');
      closeRegisterModal();
      document.getElementById('login-email').value = email;
      document.getElementById('login-pass').value  = password;
    } else { alert('❌ ' + result.message); }
  } catch (error) {
    console.error(error);
    alert('Server Error. Make sure Python Database is running.');
  }
}

// =========================================================
// 2. DATABASES
// =========================================================
let APP_DATA = {};
if (window.ADMIN_DATA) { APP_DATA = window.ADMIN_DATA; }

const chillerCSV = `Model,Condition,ModelName,NumCompressors,Refrigerant,NumFans,NumCoils,FlowDesign,FF,Alt,Passes,Mat,WB,L1,W1,H1,SW1,OW1,RC1,L2,W2,H2,RC2,SW2,OW2,OilCh,CompRLA1,CompRLA2,CompRLA3,CompRLA4,ResultVal,C100,P100,COP100,RLA100,F100,EI100,EO100,PD100,AM100,C75,P75,COP75,RLA75,F75,EI75,EO75,PD75,AM75,C50,P50,COP50,RLA50,F50,EI50,EO50,PD50,AM50,C25,P25,COP25,RLA25,F25,EI25,EO25,PD25,AM25,Elev_C,Elev_P,Elev_COP,Elev_RLA,Elev_F,Elev_EI,Elev_EO,Elev_PD,Elev_AM
KAC011,BEE,KAC011.20,2,R410A,2,2,6.147,0.018,0,1,Cu,NA,1721,1140,1469,436,561,11,2071,949,1436,11,436,561,NA,11.1,11.1,NA,NA,3.38,35.72,12.70,2.813,22.2,6.147,12.00,7.0,40,35.0,26.790,10.31,2.598,19.05,6.147,10.75,7.0,40,27.0,17.860,4.05,4.412,8.487,6.147,9.50,7.0,40,19.00,8.930,3.09,2.893,7.849,6.147,8.25,7.0,40,13.00,33.36,13.60,2.450,23.6,6.147,12,7,40,39
KAC011,AHRI,KAC011.20,2,R410A,2,2,6.147,0.018,0,1,Cu,NA,1721,1140,1469,436,561,11,2071,949,1436,11,436,561,NA,11.1,11.1,NA,NA,3.38,35.72,12.70,2.813,22.2,6.147,12.00,7.0,40,35.0,26.790,10.31,2.598,19.05,6.147,10.75,7.0,40,27.0,17.860,4.05,4.412,8.487,6.147,9.50,7.0,40,19.00,8.930,3.09,2.893,7.849,6.147,8.25,7.0,40,13.00,33.36,13.60,2.450,23.6,6.147,12,7,40,39
KAC022,BEE,KAC022.20,2,R410A,2,2,13.83,0.018,0,1,Cu,NA,2121,1400,1864,598,630,16,2570,1092,1869,16,598,630,NA,22.94,22.94,NA,NA,3.40,80.34,26.76,3.002,45.88,13.83,12.00,7.0,40,35.0,60.26,21.96,2.744,40.2,13.83,10.75,7.0,40,27.0,40.17,8.92,4.504,18.31,13.83,9.50,7.0,40,19.00,20.09,7.06,2.847,17.36,13.83,8.25,7.0,40,13.00,73.24,28.78,2.545,48.46,13.83,12,7,40,39
KAC022,AHRI,KAC022.20,2,R410A,2,2,13.83,0.018,0,1,Cu,NA,2121,1400,1864,598,630,16,2570,1092,1869,16,598,630,NA,22.94,22.94,NA,NA,3.40,80.34,26.76,3.002,45.88,13.83,12.00,7.0,40,35.0,60.26,21.96,2.744,40.2,13.83,10.75,7.0,40,27.0,40.17,8.92,4.504,18.31,13.83,9.50,7.0,40,19.00,20.09,7.06,2.847,17.36,13.83,8.25,7.0,40,13.00,73.24,28.78,2.545,48.46,13.83,12,7,40,39
KAC044,BEE,KAC044.40,4,R410A,2,4,27.67,0.018,0,1,Cu,NA,3093,1574,2189,1455,1560,44,3093,1574,2189,44,1455,1560,NA,22.94,22.94,22.94,22.94,3.91,160.680,54.32,2.958,91.76,27.67,12.00,7.0,40,35.0,120.510,34.64,3.479,60.30,27.67,10.75,7.0,40,27.0,80.340,18.24,4.405,36.62,27.67,9.50,7.0,40,19.00,40.170,8.36,4.807,17.36,27.67,8.25,7.0,40,13.00,146.48,58.36,2.510,96.92,27.67,12,7,40,39
KAC044,AHRI,KAC044.40,4,R410A,2,4,27.67,0.018,0,1,Cu,NA,3093,1574,2189,1455,1560,44,3093,1574,2189,44,1455,1560,NA,22.94,22.94,22.94,22.94,3.91,160.680,54.32,2.958,91.76,27.67,12.00,7.0,40,35.0,120.510,34.64,3.479,60.30,27.67,10.75,7.0,40,27.0,80.340,18.24,4.405,36.62,27.67,9.50,7.0,40,19.00,40.170,8.36,4.807,17.36,27.67,8.25,7.0,40,13.00,146.48,58.36,2.510,96.92,27.67,12,7,40,39`;

let chillerDB = [];
const lines = chillerCSV.trim().split('\n');
const headers = lines[0].split(',');
chillerDB = lines.slice(1).map(l => { const v = l.split(','); let o = {}; headers.forEach((h,i) => o[h]=v[i]); return o; });

const allProducts = [
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-14U', cap: 14, cop: 4.2, hotWater: '400', ratedTemp: '55', maxTemp: '60', power: '3.8', current: '6.4', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 1, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '2.5', fanQty: 1, ref: 'R410A', noise: '≤65', pipe: 'R1', dim: '800 × 800 × 1110', weight: 140 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-19U', cap: 19, cop: 4.2, hotWater: '540', ratedTemp: '55', maxTemp: '60', power: '4.4', current: '8.4', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 1, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '3.2', fanQty: 1, ref: 'R410A', noise: '≤65', pipe: 'R1', dim: '800 × 800 × 1110', weight: 180 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-25U', cap: 25, cop: 4.15, hotWater: '710', ratedTemp: '55', maxTemp: '60', power: '6', current: '11.4', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 1, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '4.3', fanQty: 1, ref: 'R410A', noise: '≤65', pipe: 'R1', dim: '800 × 800 × 1025', weight: 200 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-37U', cap: 37, cop: 4.2, hotWater: '1070', ratedTemp: '55', maxTemp: '60', power: '8.8', current: '16.7', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 2, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '6.5', fanQty: 2, ref: 'R410A', noise: '≤65', pipe: 'R1-1/2', dim: '1450 × 890 × 1110', weight: 310 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-45U', cap: 45, cop: 4.16, hotWater: '1270', ratedTemp: '55', maxTemp: '60', power: '11.1', current: '20.1', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 1, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '7.5', fanQty: 1, ref: 'R410A', noise: '≤66', pipe: 'R1-1/2', dim: '975 × 975 × 1300', weight: 325 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-50U', cap: 50, cop: 4.2, hotWater: '1480', ratedTemp: '55', maxTemp: '60', power: '12.1', current: '23.1', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 2, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '8.7', fanQty: 2, ref: 'R410A', noise: '≤67', pipe: 'R1-1/2', dim: '1600 × 990 × 1150', weight: 365 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-70V', cap: 70, cop: 4.1, hotWater: '2030', ratedTemp: '55', maxTemp: '60', power: '17.1', current: '32.4', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 2, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '12', fanQty: 2, ref: 'R410A', noise: '≤70', pipe: 'R1-1/2', dim: '1850 × 950 × 1635', weight: 610 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-90V', cap: 90, cop: 4.15, hotWater: '2600', ratedTemp: '55', maxTemp: '60', power: '21.7', current: '41.2', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 2, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '15.5', fanQty: 2, ref: 'R410A', noise: '≤72', pipe: 'R2', dim: '2250 × 1090 × 1785', weight: 740 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-100V', cap: 100, cop: 4.2, hotWater: '2970', ratedTemp: '55', maxTemp: '60', power: '23.8', current: '45.6', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 2, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '17.3', fanQty: 2, ref: 'R410A', noise: '≤72', pipe: 'R2', dim: '2250 × 1090 × 1785', weight: 820 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-140V', cap: 140, cop: 4.1, hotWater: '4060', ratedTemp: '55', maxTemp: '60', power: '34.1', current: '64.9', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 4, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '24', fanQty: 4, ref: 'R410A', noise: '≤75', pipe: 'R2-1/2', dim: '2200 × 2100 × 1800', weight: 1150 },
    { type: 'COMMERCIAL HEAT PUMP', model: 'KSE-AH-180V', cap: 180, cop: 4.15, hotWater: '5220', ratedTemp: '55', maxTemp: '60', power: '43.4', current: '82.4', supply: '380~415V/50Hz/3Ph', comp: 'Scroll', compQty: 4, heatex: 'Tube-in-Shell / Brazed Plate', evap: 'Blue Finned', throttle: 'EXV/TXV', flow: '30.9', fanQty: 4, ref: 'R410A', noise: '≤78', pipe: 'R2-1/2', dim: '2200 × 2100 × 1800', weight: 1300 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-11U', cap: 11, cop: 6.7, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '1.8', current: '3.7', evap: 'Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Reciprocating', compQty: 1, fanQty: 1, fanDir: 'Horizontal', flow: '5', pipe: 'Rc1-1/2', noise: '≤53', dim: '1250 x 660 x 725', weight: 120 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-17U', cap: 17, cop: 6.7, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '2.5', current: '5.3', evap: 'Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Reciprocating', compQty: 1, fanQty: 1, fanDir: 'Horizontal', flow: '7.6', pipe: 'Rc1-1/2', noise: '≤55', dim: '1250 x 660 x 725', weight: 145 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-25U', cap: 25, cop: 6.7, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '3.7', current: '8', evap: 'Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Scroll', compQty: 1, fanQty: 1, fanDir: 'Vertical', flow: '11.2', pipe: 'Rc1-1/2', noise: '≤56', dim: '800 × 800 × 1110', weight: 170 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-35U', cap: 35, cop: 6.8, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '5.1', current: '10.6', evap: 'Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Scroll', compQty: 1, fanQty: 1, fanDir: 'Vertical', flow: '15', pipe: 'Rc2', noise: '≤61', dim: '975 × 975 × 1300', weight: 240 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-50U', cap: 50, cop: 6.7, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '7.4', current: '16', evap: 'Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Scroll', compQty: 2, fanQty: 2, fanDir: 'Vertical', flow: '23', pipe: 'Rc2', noise: '≤66', dim: '1450 × 890 × 1110', weight: 320 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-65U', cap: 60, cop: 6.7, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '9.7', current: '21', evap: 'Coil Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Scroll', compQty: 2, fanQty: 2, fanDir: 'Vertical', flow: '30', pipe: 'Rc2', noise: '≤66', dim: '1600 × 990 × 1150', weight: 410 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-80V', cap: 80, cop: 6.9, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '11.8', current: '24', evap: 'Coil Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Scroll', compQty: 2, fanQty: 2, fanDir: 'Vertical', flow: '35', pipe: 'Rc2-1/2', noise: '≤66', dim: '1850 × 950 × 1635', weight: 540 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-90V', cap: 90, cop: 6.9, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '13', current: '25.8', evap: 'Coil Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Scroll', compQty: 2, fanQty: 2, fanDir: 'Vertical', flow: '40', pipe: 'Rc2-1/2', noise: '≤66', dim: '1850 × 950 × 1635', weight: 570 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-110V', cap: 110, cop: 6.9, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '16.8', current: '33.1', evap: 'Coil Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Scroll', compQty: 2, fanQty: 2, fanDir: 'Vertical', flow: '47', pipe: 'Rc3', noise: '≤68', dim: '2250 × 1090 × 1785', weight: 750 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-140V', cap: 140, cop: 6.6, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '20.2', current: '44.8', evap: 'Coil Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Scroll', compQty: 2, fanQty: 2, fanDir: 'Vertical', flow: '60', pipe: 'Rc3', noise: '≤70', dim: '2250 × 1090 × 1785', weight: 820 },
    { type: 'SWIMMING POOL HEAT PUMP', model: 'KSE-SP-220V', cap: 220, cop: 6.9, maxTemp: '45', ratedTemp: 'N/A', supply: '380~415V/50Hz/3Ph', power: '33.6', current: '66.2', evap: 'Coil Blue Finned', throttle: 'EXV/TXV', heatex: 'PVC Shell Titanium', ref: 'R410A', comp: 'Scroll', compQty: 4, fanQty: 4, fanDir: 'Vertical', flow: '95', pipe: 'Rc4', noise: '≤76', dim: '2200 × 2100 × 1800', weight: 1180 },
    { type: 'MONOBLOCK HEAT PUMP', model: 'KSE-AH-4M', cap: 3.5, cop: 4.12, hotWater: '105', ratedTemp: '55', maxTemp: '60', power: '0.85', current: '4.07', supply: '220-240V/50Hz/1Ph', comp: 'Rotary', compQty: 1, throttle: 'Electronic Expansion Valve', fanQty: 1, ambient: '-7~43', ref: 'R410A / R407C', heatex: 'Wilo Pump/Equivalent', noise: '≤54', pipe: 'Rc3/4', dim: '930 × 350 × 550', weight: 48 },
    { type: 'MONOBLOCK HEAT PUMP', model: 'KSE-AH-7M', cap: 7.4, cop: 4, hotWater: '215', ratedTemp: '55', maxTemp: '60', power: '1.85', current: '4.07', supply: '220-240V/50Hz/1Ph', comp: 'Rotary', compQty: 1, throttle: 'Electronic Expansion Valve', fanQty: 1, ambient: '-7~43', ref: 'R410A / R407C', heatex: 'Wilo Pump/Equivalent', noise: '≤55', pipe: 'Rc3/4', dim: '1005 × 350 × 620', weight: 66 },
    { type: 'MONOBLOCK HEAT PUMP', model: 'KSE-AH-10M', cap: 9.3, cop: 4, hotWater: '280', ratedTemp: '55', maxTemp: '60', power: '2.33', current: '11.2', supply: '220-240V/50Hz/1Ph', comp: 'Rotary', compQty: 1, throttle: 'Electronic Expansion Valve', fanQty: 1, ambient: '-7~43', ref: 'R410A / R407C', heatex: 'Wilo Pump/Equivalent', noise: '≤57', pipe: 'Rc3/4', dim: '1110 × 400 × 750', weight: 85 },
    { type: 'EVI HEAT PUMP', model: 'SE-EVI-10U', cap: 10.3, cop: 4.42, hotWater: '220', ratedTemp: '55', maxTemp: '60', power: '2.32', current: '11.1', supply: '220-240V/50Hz/1Ph', comp: 'Scroll', compQty: 1, throttle: 'Electronic Expansion Valve', fanDir: 'Vertical', fanQty: 1, ambient: '-25 to 43', ref: 'R407C / R410A', flow: 1.76, pd: '≤30', noise: '≤59', pipe: 'R1', heatex: 'SS / Powder Coated', dim: '710x710x795', weight: 107 },
    { type: 'EVI HEAT PUMP', model: 'SE-EVI-19U', cap: 18.7, cop: 4.45, hotWater: '400', ratedTemp: '55', maxTemp: '60', power: '4.2', current: '7.85', supply: '380-415V/50Hz/3Ph', comp: 'Scroll', compQty: 1, throttle: 'Electronic Expansion Valve', fanDir: 'Vertical', fanQty: 1, ambient: '-25 to 43', ref: 'R407C / R410A', flow: 3.2, pd: '≤60', noise: '≤62', pipe: 'R1', heatex: 'SS / Powder Coated', dim: '800x800x1110', weight: 129 },
    { type: 'EVI HEAT PUMP', model: 'SE-EVI-37U', cap: 37.4, cop: 4.41, hotWater: '800', ratedTemp: '55', maxTemp: '60', power: '8.48', current: '16.11', supply: '380-415V/50Hz/3Ph', comp: 'Scroll', compQty: 2, throttle: 'Electronic Expansion Valve', fanDir: 'Vertical', fanQty: 2, ambient: '-25 to 43', ref: 'R407C / R410A', flow: 6.44, pd: '≤65', noise: '≤63', pipe: 'R1-1/2', heatex: 'SS / Powder Coated', dim: '1450x890x1110', weight: 268 },
    { type: 'EVI HEAT PUMP', model: 'SE-EVI-43U', cap: 43.4, cop: 4.51, hotWater: '930', ratedTemp: '55', maxTemp: '60', power: '9.63', current: '18.29', supply: '380-415V/50Hz/3Ph', comp: 'Scroll', compQty: 2, throttle: 'Electronic Expansion Valve', fanDir: 'Vertical', fanQty: 2, ambient: '-25 to 43', ref: 'R407C / R410A', flow: 7.47, pd: '≤65', noise: '≤63', pipe: 'R1-1/2', heatex: 'SS / Powder Coated', dim: '1450x890x1110', weight: 305 },
    { type: 'EVI HEAT PUMP', model: 'SE-EVI-70U', cap: 69.8, cop: 4.58, hotWater: '1500', ratedTemp: '55', maxTemp: '60', power: '15.23', current: '28.93', supply: '380-415V/50Hz/3Ph', comp: 'Scroll', compQty: 2, throttle: 'Electronic Expansion Valve', fanDir: 'Vertical', fanQty: 2, ambient: '-25 to 43', ref: 'R407C / R410A', flow: 12, pd: '≤65', noise: '≤68', pipe: 'Rc2-1/2', heatex: 'SS / Powder Coated', dim: '1990x980x2045', weight: 552 },
    { type: 'HIGH TEMPERATURE HEAT PUMP', model: 'SE-HT-15U', cap: 14.5, cop: 4.2, supply: '380~415V/50Hz/3Ph', power: '3.5', current: '7.6', ratedTemp: '75', maxTemp: '80', heatex: 'Brazed Plate / Tube in Shell', evap: 'Blue Finned Coil', throttle: 'Electronic Expansion Valve', ref: 'R134a', comp: 'Scroll', compQty: 1, fanQty: 1, hw60: 360, hw70: 280, hw80: 215, flow: 2.5, pd: '≤45', weight: 174, noise: '≤58', pipe: 'R1', dim: '800x800x1110' },
    { type: 'HIGH TEMPERATURE HEAT PUMP', model: 'SE-HT-19U', cap: 18.4, cop: 4.0, supply: '380~415V/50Hz/3Ph', power: '4.6', current: '11.8', ratedTemp: '75', maxTemp: '80', heatex: 'Brazed Plate / Tube in Shell', evap: 'Blue Finned Coil', throttle: 'Electronic Expansion Valve', ref: 'R134a', comp: 'Scroll', compQty: 1, fanQty: 1, hw60: 530, hw70: 370, hw80: 280, flow: 3.3, pd: '≤50', weight: 205, noise: '≤62', pipe: 'R1', dim: '800x800x1025' },
    { type: 'HIGH TEMPERATURE HEAT PUMP', model: 'SE-HT-29U', cap: 28.6, cop: 4.2, supply: '380~415V/50Hz/3Ph', power: '6.8', current: '17.4', ratedTemp: '75', maxTemp: '80', heatex: 'Brazed Plate / Tube in Shell', evap: 'Blue Finned Coil', throttle: 'Electronic Expansion Valve', ref: 'R134a', comp: 'Scroll', compQty: 2, fanQty: 2, hw60: 820, hw70: 580, hw80: 435, flow: 5.5, pd: '≤55', weight: 320, noise: '≤65', pipe: 'R1-1/4', dim: '1450x890x1110' },
    { type: 'HIGH TEMPERATURE HEAT PUMP', model: 'SE-HT-35U', cap: 34.9, cop: 4.1, supply: '380~415V/50Hz/3Ph', power: '8.5', current: '21.2', ratedTemp: '75', maxTemp: '80', heatex: 'Brazed Plate / Tube in Shell', evap: 'Blue Finned Coil', throttle: 'Electronic Expansion Valve', ref: 'R134a', comp: 'Scroll', compQty: 1, fanQty: 1, hw60: 1000, hw70: 700, hw80: 530, flow: 6.1, pd: '≤56', weight: 350, noise: '≤69', pipe: 'R1-1/2', dim: '975x975x1300' },
    { type: 'HIGH TEMPERATURE HEAT PUMP', model: 'SE-HT-38U', cap: 36.8, cop: 4.0, supply: '380~415V/50Hz/3Ph', power: '9.2', current: '23.6', ratedTemp: '75', maxTemp: '80', heatex: 'Brazed Plate / Tube in Shell', evap: 'Blue Finned Coil', throttle: 'Electronic Expansion Valve', ref: 'R134a', comp: 'Scroll', compQty: 2, fanQty: 2, hw60: 1060, hw70: 750, hw80: 560, flow: 6.6, pd: '≤58', weight: 375, noise: '≤74', pipe: 'R1-1/2', dim: '1600x990x1150' },
    { type: 'HIGH TEMPERATURE HEAT PUMP', model: 'SE-HT-58V', cap: 57.2, cop: 4.2, supply: '380~415V/50Hz/3Ph', power: '13.6', current: '34.8', ratedTemp: '75', maxTemp: '80', heatex: 'Brazed Plate / Tube in Shell', evap: 'Blue Finned Coil', throttle: 'Electronic Expansion Valve', ref: 'R134a', comp: 'Scroll', compQty: 2, fanQty: 2, hw60: 1640, hw70: 1160, hw80: 870, flow: 10, pd: '≤65', weight: 510, noise: '≤76', pipe: 'R1-1/2', dim: '1850x950x1635' },
    { type: 'HIGH TEMPERATURE HEAT PUMP', model: 'SE-HT-70V', cap: 69.8, cop: 4.1, supply: '380~415V/50Hz/3Ph', power: '17', current: '42.4', ratedTemp: '75', maxTemp: '80', heatex: 'Brazed Plate / Tube in Shell', evap: 'Blue Finned Coil', throttle: 'Electronic Expansion Valve', ref: 'R134a', comp: 'Scroll', compQty: 2, fanQty: 2, hw60: 2000, hw70: 1400, hw80: 1060, flow: 12.2, pd: '≤70', weight: 610, noise: '≤78', pipe: 'R2', dim: '1850x950x1635' },
    { type: 'HIGH TEMPERATURE HEAT PUMP', model: 'SE-HT-115V', cap: 114.4, cop: 4.2, supply: '380~415V/50Hz/3Ph', power: '27.2', current: '69.6', ratedTemp: '75', maxTemp: '80', heatex: 'Brazed Plate / Tube in Shell', evap: 'Blue Finned Coil', throttle: 'Electronic Expansion Valve', ref: 'R134a', comp: 'Scroll', compQty: 4, fanQty: 4, hw60: 3280, hw70: 2310, hw80: 1740, flow: 20, pd: '≤75', weight: 1040, noise: '≤81', pipe: 'R2-1/2', dim: '2200x2100x1800' }
];

const productFeatures = {
    'MONOBLOCK HEAT PUMP': ['Panasonic or Highly Efficient Rotary Compressor','Titanium tube in PVC shell heat exchanger','Intelligent defrosting (Optional)','Easy installation and operation','Stable running, economic and durable','Heating in winter & optional cooling in summer','Available in EVI category','Smart touch','WiFi Controlling (Optional)','Built-in Circulation Pump','Silent Operation','Low Maintenance'],
    'COMMERCIAL HEAT PUMP': ['American Copeland / Panasonic scroll compressor','Automatic defrosting (Optional)','Super intelligence','Low noise and vibration','Stable running, safe and reliable','Smart-touch control','Anti-corrosive coating','High Pressure / Low Pressure Protection','Silent Operation','Less Maintenance','60°C High Temperature Output'],
    'SWIMMING POOL HEAT PUMP': ['American Copeland / Panasonic scroll compressor','Titanium tube in PVC shell heat exchanger','Intelligent defrosting (Optional)','Easy installation and operation','Stable running, economic and durable','Heating in winter & optional cooling in summer','Available in EVI category','Smart touch interface','WiFi Controlling (Optional)','Energy Saving Operation','MODBUS Communication'],
    'HIGH TEMPERATURE HEAT PUMP': ['High Water outlet temperature [80°C]','Capacity available up to 200 kW','Wide ambient operating range [7~43°C]','Environment friendly green refrigerant','Protective system with thermostat and pressure switch','Overload protection system','Smart touch control','MODBUS Communication','Environment Friendly Refrigerant','High Temperature Operation'],
    'EVI HEAT PUMP': ['High-efficiency EVI Scroll Compressor','Electronic Expansion Valve for precision','Ultra-wide ambient operating range [-25°C to 43°C]','High outlet water temperature up to 60°C','Stable running in extreme freezing climates','Intelligent defrosting system','Stainless Steel / Powder Coated durable cabinet','Vertical discharge fans']
};

const BEE_STAR_LABELS = { 'KAC011': '2 Star', 'KAC022': '2 Star', 'KAC044': '3 Star' };
function fmt2(val)  { let n=parseFloat(val); return isNaN(n)?val:n.toFixed(2); }
function fmt3(val)  { let n=parseFloat(val); return isNaN(n)?val:n.toFixed(3); }
function fmtDynamic(val) { let n=parseFloat(val); if(isNaN(n)) return val; return Math.floor(Math.abs(n))>=10?n.toFixed(2):n.toFixed(3); }
function fmtFlow(val)    { let n=parseFloat(val); if(isNaN(n)) return val; return Math.floor(Math.abs(n))>=10?n.toFixed(2):n.toFixed(3); }
function _v(val) { return (val===undefined||val===null||val==='N/A'||val==='NA'||val.toString().trim()==='')?'-':val; }

function updateProducts() {
    const app=document.getElementById('app-select').value;
    const prodSelect=document.getElementById('product-select'); prodSelect.innerHTML='';
    if(app==='Chiller'){prodSelect.innerHTML=`<option value="Air Cooled Chiller">Air Cooled Chiller</option>`;}
    else{['COMMERCIAL HEAT PUMP','SWIMMING POOL HEAT PUMP','MONOBLOCK HEAT PUMP','HIGH TEMPERATURE HEAT PUMP','EVI HEAT PUMP'].forEach(type=>{let opt=document.createElement('option');opt.value=type;opt.text=type;prodSelect.appendChild(opt);});}
    updateModels();
}
function updateModels() {
    const app=document.getElementById('app-select').value; const prod=document.getElementById('product-select').value;
    const modelSelect=document.getElementById('model-select'); const condSelect=document.getElementById('cond-select');
    modelSelect.innerHTML=''; condSelect.innerHTML='';
    if(app==='Chiller'){
        modelSelect.innerHTML=`<option value="KAC011">KAC011.20</option><option value="KAC022">KAC022.20</option><option value="KAC044">KAC044.40</option>`;
        condSelect.innerHTML=`<option value="BEE">BEE Condition</option><option value="AHRI">AHRI Condition</option>`;
    } else {
        const fp=allProducts.filter(hp=>hp.type===prod);
        fp.forEach(hp=>{let opt=document.createElement('option');opt.value=hp.model;opt.text=hp.model;modelSelect.appendChild(opt);});
        condSelect.innerHTML=`<option value="UserSpecified">User Specified</option>`;
    }
}
window.onload=function(){updateProducts();}
function goBack(){document.getElementById('report-wrapper').style.display='none';document.getElementById('selection-form').style.display='block';}

// =========================================================
// 3. COP CHART DATA MATRICES
// =========================================================
const CHART_MATRICES = {
    'MATRIX_25U':[
        {label:'Tc 30°C',data:[null,null,2.29,2.96,3.71,4.56,5.52,6.59,7.04,7.75,8.36,8.97],borderColor:'#0b5d2e'},
        {label:'Tc 35°C',data:[null,null,1.87,2.46,3.12,3.86,4.70,5.64,6.04,6.66,7.20,7.76],borderColor:'#1aa34a'},
        {label:'Tc 40°C',data:[null,null,1.50,2.02,2.59,3.23,3.96,4.78,5.13,5.69,6.17,6.66],borderColor:'#689d00'},
        {label:'Tc 45°C',data:[null,null,null,1.63,2.12,2.68,3.31,4.02,4.32,4.81,5.23,5.68],borderColor:'#00b4d8'},
        {label:'Tc 50°C',data:[null,null,null,null,1.72,2.19,2.73,3.34,3.61,4.03,4.40,4.79],borderColor:'#009df3'},
        {label:'Tc 55°C',data:[null,null,null,null,null,1.77,2.23,2.75,2.97,3.34,3.66,4.00],borderColor:'#5e6ff1'},
        {label:'Tc 60°C',data:[null,null,null,null,null,null,1.80,2.23,2.43,2.74,3.02,3.31],borderColor:'#8752ef'},
        {label:'Tc 65°C',data:[null,null,null,null,null,null,null,1.43,1.79,1.96,2.22,2.45,2.71],borderColor:'#d343e0'},
        {label:'Tc 67°C',data:[null,null,null,null,null,null,null,null,1.64,1.79,2.03,2.25,2.49],borderColor:'#f44358'}
    ],
    'MATRIX_14_19_37':[
        {label:'Tc 30°C',data:[null,null,2.47,3.02,3.62,4.32,5.22,6.48,7.14,8.37,9.71,11.50],borderColor:'#0b5d2e'},
        {label:'Tc 35°C',data:[null,null,2.13,2.67,3.23,3.84,4.59,5.58,6.08,6.98,7.94,9.16],borderColor:'#1aa34a'},
        {label:'Tc 40°C',data:[null,null,1.71,2.25,2.78,3.33,3.96,4.75,5.13,5.81,6.51,7.37],borderColor:'#689d00'},
        {label:'Tc 45°C',data:[null,null,null,1.81,2.31,2.81,3.35,4.00,4.30,4.83,5.35,5.97],borderColor:'#00b4d8'},
        {label:'Tc 50°C',data:[null,null,null,null,1.81,2.32,2.80,3.34,3.58,4.00,4.40,4.86],borderColor:'#009df3'}
    ],
    'MATRIX_GENERIC':[
        {label:'Tc 25°C',data:[1.68,2.27,2.91,3.63,4.45,5.38,6.43,7.57,8.06,8.80,null,null],borderColor:'#053e1a'},
        {label:'Tc 30°C',data:[1.29,1.84,2.44,3.10,3.85,4.69,5.65,6.71,7.16,7.87,8.48,9.10],borderColor:'#0b5d2e'},
        {label:'Tc 35°C',data:[null,1.45,2.01,2.61,3.28,4.04,4.90,5.86,6.27,6.92,7.49,8.08],borderColor:'#1aa34a'},
        {label:'Tc 40°C',data:[null,null,1.60,2.15,2.75,3.42,4.18,5.04,5.41,6.00,6.52,7.06],borderColor:'#689d00'},
        {label:'Tc 45°C',data:[null,null,null,1.73,2.26,2.85,3.52,4.28,4.60,5.13,5.59,6.07],borderColor:'#00b4d8'},
        {label:'Tc 50°C',data:[null,null,null,null,null,2.34,2.92,3.57,3.86,4.31,4.72,5.14,null],borderColor:'#009df3'},
        {label:'Tc 55°C',data:[null,null,null,null,null,null,2.38,2.94,3.18,3.58,3.92,4.29,null],borderColor:'#5e6ff1'},
        {label:'Tc 60°C',data:[null,null,null,null,null,null,null,2.38,2.59,2.92,3.22,3.53,null],borderColor:'#8752ef'},
        {label:'Tc 65°C',data:[null,null,null,null,null,null,null,null,2.07,2.35,2.60,2.86,null],borderColor:'#d343e0'}
    ]
};

// =========================================================
// 4. COP CHART PAGE
// =========================================================
function getCopMatrixForModel(modelName) {
    if(modelName==='KSE-AH-25U') return CHART_MATRICES['MATRIX_25U'];
    if(['KSE-AH-14U','KSE-AH-19U','KSE-AH-37U'].includes(modelName)) return CHART_MATRICES['MATRIX_14_19_37'];
    return CHART_MATRICES['MATRIX_GENERIC'];
}

function openCopChartPage() {
    const modelName=document.getElementById('model-select').value;
    const hp=allProducts.find(x=>x.model===modelName);
    const productType=hp?hp.type:''; const copValue=hp?hp.cop:'';
    const clientName=document.getElementById('client').value||'—';
    const projectName=document.getElementById('project').value||'—';
    const incharge=document.getElementById('proj-incharge').value||'—';
    const printDate=new Date().toLocaleDateString('en-GB')+' '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    const xLabels=[-30,-25,-20,-15,-10,-5,0,5,7,10,12.5,15];
    const matrixData=getCopMatrixForModel(modelName);

    let tableHtml=`<table class="cop-data-table"><thead><tr><th class="tc-col">Tc \\ Te →</th>${xLabels.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>`;
    matrixData.forEach(row=>{
        tableHtml+=`<tr><td class="row-label" style="border-left:4px solid ${row.borderColor};color:${row.borderColor};">${row.label}</td>`;
        row.data.forEach(val=>{const display=(val!==null&&val!==undefined)?val.toFixed(2):'';tableHtml+=display?`<td class="val-cell">${display}</td>`:`<td class="null-cell">—</td>`;});
        tableHtml+=`</tr>`;
    });
    tableHtml+=`</tbody></table>`;

    const datasetsJson=JSON.stringify(matrixData.map(d=>({label:d.label,data:d.data,borderColor:d.borderColor,backgroundColor:'transparent',borderWidth:2.2,tension:0.35,spanGaps:true,pointRadius:4,pointHoverRadius:7,pointBackgroundColor:d.borderColor,pointBorderColor:'#ffffff',pointBorderWidth:1.5,pointHoverBorderWidth:2})));
    const baseUrl=window.location.origin+window.location.pathname.substring(0,window.location.pathname.lastIndexOf('/')+1);
    const absoluteLogoUrl=baseUrl+'images/chillers_logo.png';

    const pageHtml=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>COP Performance – ${modelName}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',Arial,sans-serif;background:#e8eaf2;font-size:13px;}.action-bar{background:#1a2a5e;display:flex;align-items:center;justify-content:space-between;padding:10px 28px;position:sticky;top:0;z-index:100;}.bar-title{color:#fff;font-size:14px;font-weight:800;}.bar-tag{background:#e8a020;color:#fff;font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px;}.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;border:none;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;}.btn-back{background:#4b5563;color:#fff;}.btn-pdf{background:#16a34a;color:#fff;}.page-wrap{max-width:1000px;margin:22px auto 48px;padding:0 18px;}#cop-report{background:#fff;border-radius:8px;box-shadow:0 4px 24px rgba(26,42,94,.13);overflow:hidden;}.rpt-header{background:#fff;padding:16px 24px 13px;display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #e8a020;}.co-name{color:#1a2a5e;font-size:17px;font-weight:900;}.rpt-meta{background:#f0f2f9;padding:5px 24px;font-size:10px;color:#6b7280;font-weight:700;display:flex;justify-content:space-between;}.sec-band{background:#1a2a5e;color:#fff;font-size:10px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase;padding:7px 24px;}.sec-body{padding:16px 24px;}.proj-table{width:100%;border-collapse:collapse;font-size:11px;}.proj-table td{padding:6px 12px;border:1px solid #d1d5e0;height:28px;}.proj-table .lbl{background:#f0f2f9;font-weight:800;color:#1a2a5e;width:16%;}.cop-data-table{width:100%;border-collapse:collapse;font-size:9.5px;}.cop-data-table thead tr{background:#1a2a5e;color:#fff;}.cop-data-table thead th{padding:7px 6px;text-align:center;border:1px solid #243570;font-size:9px;font-weight:800;}.cop-data-table thead th.tc-col{text-align:left;padding-left:16px;min-width:90px;}.cop-data-table tbody tr:nth-child(odd){background:#fff;}.cop-data-table tbody tr:nth-child(even){background:#f4f6fb;}.cop-data-table td{padding:5px 6px;text-align:center;border:1px solid #dde2ed;}.cop-data-table td.row-label{text-align:left;padding-left:12px;font-weight:900;font-size:9.5px;white-space:nowrap;border-left-width:5px;background:#fafbfe;}.cop-data-table td.val-cell{font-weight:700;}.cop-data-table td.null-cell{color:#d1d5db;font-size:9px;}.chart-area{padding:22px 28px 18px;background:#fafbff;}.canvas-wrap{position:relative;width:100%;height:460px;background:#fff;border:1px solid #d1d5e0;border-radius:6px;padding:10px;margin-top:12px;}@media print{.action-bar{display:none!important;}@page{size:A4 portrait;margin:6mm 7mm;}*{-webkit-print-color-adjust:exact!important;}}</style></head><body>
<div class="action-bar" id="action-bar"><div style="display:flex;align-items:center;gap:12px;"><div style="font-size:20px;">📊</div><div class="bar-title">COP Performance Report</div><div class="bar-tag">${modelName}</div></div><div style="display:flex;gap:10px;"><button class="btn btn-back" onclick="window.close()">← Back</button><button class="btn btn-pdf" onclick="downloadPDF()">⬇ Download PDF</button></div></div>
<div class="page-wrap"><div id="cop-report">
<div class="rpt-header"><div><div class="co-name">KIRLOSKAR CHILLERS PRIVATE LIMITED</div><div style="color:#6b7280;font-size:11px;margin-top:3px;">A Kirloskar Group Company | COP Performance Analysis</div></div><div><img src="${absoluteLogoUrl}" height="48" onerror="this.parentElement.style.display='none'"></div></div>
<div class="rpt-meta"><span>Version : 1.1.0 | Release Date : 2026/03/31</span><span>Print Date : ${printDate}</span></div>
<div class="sec-band">Project Details</div><div class="sec-body"><table class="proj-table"><tr><td class="lbl">Client</td><td>${clientName}</td><td class="lbl">Model</td><td>${modelName}</td></tr><tr><td class="lbl">Project</td><td>${projectName}</td><td class="lbl">Product Type</td><td>${productType}</td></tr><tr><td class="lbl">Incharge</td><td>${incharge}</td><td class="lbl">Rated COP</td><td>${copValue} kW/kW</td></tr></table></div>
<div class="sec-band">COP Performance Data Table | Te = Evaporator Temp °C · Tc = Condensing Temp °C</div>
<div class="sec-body" style="padding:0;"><div style="overflow-x:auto;" id="pdf-scroll-box">${tableHtml}</div></div>
<div class="chart-area"><div style="text-align:center;margin-bottom:6px;"><div style="font-size:13px;font-weight:900;color:#1a2a5e;">COP Performance Curve — ${modelName}</div><div style="font-size:10px;color:#6b7280;margin-top:3px;">X-axis: Te (°C) | Y-axis: COP (kW/kW) | Each line = one Condensing Temp Tc</div></div><div class="canvas-wrap"><canvas id="copChartPage"></canvas></div></div>
</div></div>
<script>(function(){const canvas=document.getElementById('copChartPage');const dpr=window.devicePixelRatio||1;const wrap=canvas.parentElement;const w=wrap.clientWidth-16;const h=wrap.clientHeight-16;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);new Chart(ctx,{type:'line',data:{labels:${JSON.stringify(xLabels)},datasets:${datasetsJson}},options:{responsive:false,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{boxWidth:22,boxHeight:3,padding:12,font:{size:10,weight:'700'},color:'#1a2a5e'}},tooltip:{backgroundColor:'rgba(26,42,94,0.95)',callbacks:{title:i=>'Te = '+i[0].label+' °C',label:i=>{if(i.raw===null||i.raw===undefined)return null;return '  '+i.dataset.label+' :  '+i.raw.toFixed(2)+' COP';}}}},scales:{x:{title:{display:true,text:'Evaporator Temperature Te (°C)',font:{size:11,weight:'800'},color:'#1a2a5e'},grid:{color:'#e4e8f2'},ticks:{font:{size:10,weight:'600'}}},y:{title:{display:true,text:'COP (kW/kW)',font:{size:11,weight:'800'},color:'#1a2a5e'},min:1,max:12,ticks:{font:{size:10,weight:'600'},callback:v=>v.toFixed(0)}}}}});window.downloadPDF=function(){const el=document.getElementById('cop-report');const sb=document.getElementById('pdf-scroll-box');const cw=document.querySelector('.canvas-wrap');const ab=document.getElementById('action-bar');ab.style.display='none';el.style.width='900px';el.style.margin='0 auto';cw.style.height='380px';if(sb)sb.style.overflowX='visible';html2pdf().set({margin:10,filename:'Kirloskar_COP_${modelName}.pdf',image:{type:'jpeg',quality:1.0},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}}).from(el).save().then(()=>{ab.style.display='flex';el.style.width='';el.style.margin='';cw.style.height='460px';if(sb)sb.style.overflowX='';});};})();<\/script>
</body></html>`;

    const blob=new Blob([pageHtml],{type:'text/html'});
    const url=URL.createObjectURL(blob);
    const tab=window.open(url,'_blank');
    if(tab) tab.addEventListener('load',()=>URL.revokeObjectURL(url),{once:true});
}

// =========================================================
// 5. MAIN REPORT GENERATION
// =========================================================
function generateReport() {
    const app=document.getElementById('app-select').value;
    const mod=document.getElementById('model-select').value;
    const con=document.getElementById('cond-select').value;

    document.getElementById('selection-form').style.display='none';
    document.getElementById('report-wrapper').style.display='block';
    document.getElementById('p-date').innerText=new Date().toLocaleDateString('en-GB')+' '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    document.getElementById('d-client').innerText=document.getElementById('client').value||'—';
    document.getElementById('d-project').innerText=document.getElementById('project').value||'—';
    document.getElementById('d-incharge').innerText=document.getElementById('proj-incharge').value||'—';

    let notes=document.getElementById('notes-area');

    if(app==='Chiller'){
        // ── Hide Heat Pump buttons, show FF button only for BEE ──
        document.getElementById('btn-pnid').style.display='none';
        document.getElementById('btn-cop').style.display='none';
        document.getElementById('btn-calc').style.display='none';
        document.getElementById('btn-ff').style.display=(con==='BEE')?'inline-block':'none';

        const d=chillerDB.find(x=>x.Model===mod&&x.Condition===con);
        if(!d) return;

        // ── Store data for FF modal ──
        window._currentChillerData=d;

        document.getElementById('chiller-sections').style.display='block';
        document.getElementById('hp-sections').style.display='none';
        document.getElementById('d-app-type').innerText='Air Cooled Chiller';
        document.getElementById('d-tech').innerText='Scroll';
        document.getElementById('d-model-name').innerText=d.ModelName;
        document.getElementById('d-condition').innerText=con;

        const starLabel=(con==='BEE')?(BEE_STAR_LABELS[mod]||'3 Star'):'';
        if(con==='BEE'){document.getElementById('d-bmg').innerText=starLabel.includes('2')?'BMGA2':'BMGA3';document.getElementById('bmg-row').style.display='';document.getElementById('starter-row-ahri').style.display='none';}
        else{document.getElementById('bmg-row').style.display='none';document.getElementById('starter-row-ahri').style.display='';}

        if(con==='AHRI'){
            document.getElementById('d-rating-hdr').innerText="Job Conditions in accordance with AHRI-551/591 (SI)";
            document.getElementById('d-eff-hdr').innerText="Part Load Data with AHRI-Relief";
            document.getElementById('d-perf-hdr').innerText="Performance Details At AHRI Relief Load Points";
        } else {
            document.getElementById('d-rating-hdr').innerText="RATED PERFORMANCE AT STANDARD RATING CONDITIONS AS PER TABLE 1, IS 16590 : 2023";
            document.getElementById('d-eff-hdr').innerText="INDIAN SEASONAL ENERGY EFFICIENCY RATIO (ISEER) AS PER ANNEX C, IS 16590 : 2023";
            document.getElementById('d-perf-hdr').innerText="PERFORMANCE DETAILS";
        }

        document.getElementById('comp-data').innerHTML=`<tr><td>No. of quantity </td><td>${d.NumCompressors}</td></tr><tr><td>Hertz</td><td>50.0 Hz</td></tr><tr><td>Volts</td><td>415 V</td></tr><tr><td>Refrigerant</td><td>${d.Refrigerant}</td></tr>`;
        document.getElementById('evap-data').innerHTML=`<tr><td>Flow (m³/h)</td><td>${fmtFlow(d.FlowDesign)}</td></tr><tr><td>Entering Water Temp (°C)</td><td>12.0</td></tr><tr><td>Leaving Water Temp (°C)</td><td>7.0</td></tr><tr><td>No. of Passes</td><td>${d.Passes}</td></tr><tr><td>Fouling Factor</td><td>${d.FF}</td></tr><tr><td>Pressure Drop (kPa)</td><td>${fmt2(d.PD100)}</td></tr><tr><td>Tube Material</td><td>Cu</td></tr>`;
        document.getElementById('cond-data').innerHTML=`<tr><td>Ambient Temperature (°C)</td><td>${fmt2(d.AM100)}</td></tr><tr><td>No. of condenser Coils</td><td>${d.NumCoils}</td></tr><tr><td>No. of condenser Fans</td><td>${d.NumFans}</td></tr>`;

        let rlaRows='';[1,2,3,4].forEach(i=>{let val=d['CompRLA'+i];let display=(val&&val.trim()!=='NA'&&val.trim()!=='')?fmtDynamic(val):'NA';rlaRows+=`<tr><td style="width:65%;">RLA Compressor ${i} (A)</td><td>${display}</td></tr>`;});

        document.getElementById('efficiency-table').innerHTML=`<tr><td class="label-cell"> Capacity (kW)</td><td>${fmt2(d.C100)}</td><td class="label-cell v-sep">75% Load COP</td><td>${fmt3(d.COP75)}</td><td class="label-cell v-sep">Total RLA (A)</td><td style="text-align:right;padding-right:12px;">${fmtDynamic(d.RLA100)}</td></tr><tr><td class="label-cell">Power(kW)</td><td>${fmt2(d.P100)}</td><td class="label-cell v-sep">50% Load COP</td><td>${fmt3(d.COP50)}</td><td rowspan="3" colspan="2" class="v-sep" style="padding:0;vertical-align:top;"><table class="inner-table">${rlaRows}</table></td></tr><tr><td class="label-cell">COP (kW/kW)</td><td>${fmt3(d.COP100)}</td><td class="label-cell v-sep">25% Load COP</td><td>${fmt3(d.COP25)}</td></tr><tr><td class="label-cell">${con==='BEE'?'ISEER':'IPLV'}</td><td>${fmt2(d.ResultVal)}</td><td class="label-cell v-sep">${con==='BEE'?'BEE Star Rating':''}</td><td>${con==='BEE'?starLabel:''}</td></tr>`;

        const needsStar=(con==='BEE'&&(mod==='KAC011'||mod==='KAC022'));
        const pts=[{id:1,lp:100,c:d.C100,p:d.P100,cop:d.COP100,rla:d.RLA100,f:d.F100,tin:d.EI100,tout:d.EO100,pd:d.PD100,amb:d.AM100},{id:2,lp:75,c:d.C75,p:d.P75,cop:d.COP75,rla:d.RLA75,f:d.F75,tin:d.EI75,tout:d.EO75,pd:d.PD75,amb:d.AM75},{id:3,lp:50,c:d.C50,p:d.P50,cop:d.COP50,rla:d.RLA50,f:d.F50,tin:d.EI50,tout:d.EO50,pd:d.PD50,amb:d.AM50},{id:4,lp:25,c:d.C25,p:d.P25,cop:d.COP25,rla:d.RLA25,f:d.F25,tin:d.EI25,tout:d.EO25,pd:d.PD25,amb:d.AM25}];
        let phtml='';
        pts.forEach(p=>{let lpDisplay=p.lp;if(needsStar&&(p.lp===25||p.lp===75))lpDisplay+='*';phtml+=`<tr><td>${p.id}</td><td>${lpDisplay}%</td><td>${fmt2(p.c)}</td><td>${fmt2(p.p)}</td><td>${fmt3(p.cop)}</td><td>${fmtDynamic(p.rla)}</td><td>${fmtFlow(p.f)}</td><td>${fmt2(p.tin)}</td><td>${fmt2(p.tout)}</td><td>${fmt2(p.pd)}</td><td>${fmt2(p.amb)}</td></tr>`;});
        document.getElementById('perf-body').innerHTML=phtml;

        document.getElementById('elevated-hdr').style.display=(con==='BEE')?'block':'none';
        document.getElementById('elevated-section').style.display=(con==='BEE')?'table':'none';
        document.getElementById('elevated-perf-body').innerHTML=`<tr><td>1</td><td>100%</td><td>${fmtDynamic(d.Elev_C)}</td><td>${fmtDynamic(d.Elev_P)}</td><td>${fmtDynamic(d.Elev_COP)}</td><td>${fmtDynamic(d.Elev_RLA)}</td><td>${fmtFlow(d.Elev_F)}</td><td>${fmt2(d.Elev_EI)}</td><td>${fmt2(d.Elev_EO)}</td><td>${fmt2(d.Elev_PD)}</td><td>${fmt2(d.Elev_AM)}</td></tr>`;

        document.getElementById('physical-table').innerHTML=`<tr><td style="padding:0;vertical-align:top;"><div style="padding:3px;background:#f2f2f2;text-align:center;font-weight:bold;border-bottom:1px solid var(--border);">OPTION 1</div><table class="inner-table"><tr><td style="width:50%">LxWxH (mm):</td><td>${d.L1}x${d.W1}x${d.H1}</td></tr><tr><td>Shipping Weight:</td><td>${d.SW1} kg</td></tr><tr><td>Operating Weight:</td><td>${d.OW1} kg</td></tr><tr><td>Refrigerant Charge:</td><td>${d.RC1} kg</td></tr></table></td><td class="v-sep" style="padding:0;vertical-align:top;"><div style="padding:3px;background:#f2f2f2;text-align:center;font-weight:bold;border-bottom:1px solid var(--border);">OPTION 2</div><table class="inner-table"><tr><td style="width:50%">LxWxH (mm):</td><td>${d.L2}x${d.W2}x${d.H2}</td></tr><tr><td>Shipping Weight:</td><td>${d.SW2} kg</td></tr><tr><td>Operating Weight:</td><td>${d.OW2} kg</td></tr><tr><td>Refrigerant Charge:</td><td>${d.RC1} kg</td></tr></table></td></tr>`;

        if(con==='BEE'&&(mod==='KAC011'||mod==='KAC022')){notes.innerText="* NOTE: Physically chiller cannot be unloaded at this condition.Rating are based on degradation factor and interpolation as per IS 16590:2023.";}
        else if(con==='BEE'){notes.innerText="* ";}
        else{notes.innerText="";}

    } else {
        document.getElementById('btn-pnid').style.display='inline-block';
        document.getElementById('btn-cop').style.display='inline-block';
        document.getElementById('btn-calc').style.display='inline-block';
        document.getElementById('btn-ff').style.display='none';

        const hp=allProducts.find(x=>x.model===mod);
        if(!hp) return;

        document.getElementById('chiller-sections').style.display='none';
        document.getElementById('hp-sections').style.display='block';
        document.getElementById('d-app-type').innerText=hp.type||'Heat Pump';
        document.getElementById('d-tech').innerText='Air to Water';
        document.getElementById('d-model-name').innerText=hp.model;
        document.getElementById('d-condition').innerText='User Specified';
        document.getElementById('bmg-row').style.display='none';
        document.getElementById('starter-row-ahri').style.display='none';

        let l='-',w='-',h='-';
        let dimStr=_v(hp.dim);
        if(dimStr!=='-'){let parts=dimStr.replace(/×/g,'x').replace(/X/g,'x').split('x');if(parts.length>=3){l=parts[0].trim();w=parts[1].trim();h=parts[2].trim();}}

        let compStr=_v(hp.comp);let compType='-';let compMake='-';
        if(compStr!=='-'){let parts=compStr.split('(');compType=parts[0].trim();if(parts[1])compMake=parts[1].replace(')','').trim();}

        let hotWaterDisplay='-';
        if(hp.hotWater&&hp.hotWater!=='N/A'){hotWaterDisplay=hp.hotWater;}
        else if(hp.hw60){hotWaterDisplay=`60°C:${hp.hw60} | 70°C:${hp.hw70} | 80°C:${hp.hw80}`;}

        let featureList=productFeatures[hp.type]||[];
        let featureHtml='';
        if(featureList.length>0){let liItems=featureList.map(f=>`<li style="font-size:9px;font-weight:bold;">✔️ ${f}</li>`).join('');featureHtml=`<div class="section-header">PRODUCT KEY FEATURES</div><div style="padding:5px 10px;border:1px solid var(--border);border-top:none;background:#fefefa;"><ul style="column-count:2;column-gap:20px;list-style-type:none;padding:0;margin:0;">${liItems}</ul></div>`;}

        document.getElementById('hp-sections').innerHTML=`
        <table class="hp-table" style="width:100%;table-layout:fixed;margin-top:-1px;">
            <colgroup><col style="width:22%;"><col style="width:22%;"><col style="width:22%;"><col style="width:28%;"></colgroup>
            <tr><th style="background-color:var(--navy);color:white;border-bottom:1px solid var(--border);">specification</th><th class="v-sep" style="background-color:var(--navy);color:white;border-bottom:1px solid var(--border);">Compressor</th><th class="v-sep" style="background-color:var(--navy);color:white;border-bottom:1px solid var(--border);">Evaporator</th><th class="v-sep" style="background-color:var(--navy);color:white;border-bottom:1px solid var(--border);">Condenser</th></tr>
            <tr><td style="padding:0;vertical-align:top;"><table class="inner-table"><tr><td>Power Supply</td><td class="wrap-text" style="text-align:right;">${_v(hp.supply)}</td></tr><tr><td class="label-cell">Throttling Device</td><td>${_v(hp.throttle)}</td></tr><tr><td>Refrigerant</td><td>${_v(hp.ref)}</td></tr></table></td><td class="v-sep" style="padding:0;vertical-align:top;"><table class="inner-table"><tr><td style="width:45%">Type</td><td>${compType}</td></tr><tr><td>Make</td><td>${compMake}</td></tr><tr><td>No. of Compressors</td><td>${_v(hp.compQty)}</td></tr></table></td><td class="v-sep" style="padding:0;vertical-align:top;"><table class="inner-table"><tr><td style="width:35%">Coil Type</td><td class="wrap-text" style="text-align:right;">${_v(hp.evap||'Coil')}</td></tr><tr><td>Fan Quantity</td><td>${_v(hp.fanQty)}</td></tr><tr><td>Fan Direction</td><td>${_v(hp.fanDir)}</td></tr></table></td><td class="v-sep" style="padding:0;vertical-align:top;"><table class="inner-table"><tr><td style="width:25%;">Type</td><td style="text-align:right;white-space:normal;font-size:8.5px;line-height:1;">${_v(hp.heatex||hp.pump||hp.cabinet)}</td></tr><tr><td style="white-space:nowrap;">Ambient Temp (°C)</td><td>${_v(hp.ambient)}</td></tr><tr><td style="white-space:nowrap;">Rated Temp (°C)</td><td>${_v(hp.ratedTemp)}</td></tr><tr><td style="white-space:nowrap;">Water Flow (m³/h)</td><td>${_v(hp.flow)}</td></tr><tr><td style="white-space:nowrap;">Hot Water (L/H)</td><td><span style="font-size:8px;">${hotWaterDisplay}</span></td></tr><tr><td style="white-space:nowrap;">Max Temp (°C)</td><td>${_v(hp.maxTemp)}</td></tr></table></td></tr>
        </table>
        <div class="section-header">HEAT PUMP SPECIFICATIONS</div>
        <table class="hp-table" style="width:100%;table-layout:fixed;"><colgroup><col style="width:22%;"><col style="width:22%;"><col style="width:22%;"><col style="width:28%;"></colgroup>
            <tr><td class="label-cell">Heating Cap. (kW)</td><td class="v-sep">${_v(hp.cap)}</td><td class="label-cell v-sep">Current / RLA (A)</td><td class="v-sep">${_v(hp.current)}</td></tr>
            <tr><td class="label-cell">Input Power (kW)</td><td class="v-sep">${_v(hp.power)}</td><td class="label-cell v-sep">Max Power Input (kW)</td><td class="v-sep">${_v(hp.maxPower)}</td></tr>
            <tr><td class="label-cell">COP (kW/kW)</td><td class="v-sep">${_v(hp.cop)}</td><td class="label-cell v-sep">Pressure Drop (kPa)</td><td class="v-sep">${_v(hp.pd)}</td></tr>
        </table>
        <div class="section-header">PHYSICAL DATA</div>
        <table class="hp-table" style="width:100%;table-layout:fixed;"><colgroup><col style="width:22%;"><col style="width:22%;"><col style="width:22%;"><col style="width:28%;"></colgroup>
            <tr><td class="label-cell">Pipe Size</td><td class="v-sep">${_v(hp.pipe)}</td><td class="label-cell v-sep">Length (mm)</td><td class="v-sep">${l}</td></tr>
            <tr><td class="label-cell">Weight (kg)</td><td class="v-sep">${_v(hp.weight)}</td><td class="label-cell v-sep">Width (mm)</td><td class="v-sep">${w}</td></tr>
            <tr><td class="label-cell">Noise Level (dB)</td><td class="v-sep">${_v(hp.noise)}</td><td class="label-cell v-sep">Height (mm)</td><td class="v-sep">${h}</td></tr>
        </table>
        ${featureHtml}`;

        const hpConditions={'COMMERCIAL HEAT PUMP':"Ambient Temp.(DB/WB) = 30°C/25°C, Inlet Water Temp.= 25°C, Outlet Water Temp. = 55°C (E.T. = 10°C / C.T. = 60°C)",'SWIMMING POOL HEAT PUMP':"Ambient Temp. (DB/WB)=24°C/19°C, Inlet Water Temp. = 26°C, Outlet Water Temp. = 28°C (E.T. 10°C / C.T. 40°C)",'HIGH TEMPERATURE HEAT PUMP':"Ambient Temp. (DB/WB)=20°C/15°C, Inlet Water Temp. = 55°C, Outlet Water Temp. = 60°C (E.T. 10°C / C.T. 65°C)",'EVI HEAT PUMP':"Ambient Temp.(DB/WS)= 20°C/15°C, Input/Output Water Temp. = 15°C/55°C",'MONOBLOCK HEAT PUMP':"Ambient Temp.(DB/WB) = 30°C/25°C, Input/Output Water Temp. = 25°C/55°C"};
        let specCond=hpConditions[hp.type]||"";
        if(specCond){notes.innerHTML=`<span style="font-size:11px;line-height:1.4;"><strong>* NOTE:</strong> Actual performance may vary slightly based on installation environment and site conditions.<br><strong>Testing Condition (${hp.type}):</strong> ${specCond}</span>`;}
        else{notes.innerText="* NOTE: Actual performance may vary slightly based on installation environment and site conditions.";}
    }
}

function downloadPDF() {
    const element=document.getElementById('report-content');
    const clientStr=document.getElementById('client').value||'Client';
    const projStr=document.getElementById('project').value||'Project';
    const appStr=document.getElementById('app-select').value;
    const filename=`Kirloskar_${appStr}_Report_${clientStr}_${projStr}.pdf`.replace(/\s+/g,'_');
    html2pdf().set({margin:[5,5,5,5],filename,image:{type:'jpeg',quality:1.0},html2canvas:{scale:3,useCORS:true},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}}).from(element).save();
}

function openPnIdModal()  { document.getElementById('pnid-modal').style.display='block'; }
function closePnIdModal() { document.getElementById('pnid-modal').style.display='none'; }

window.onclick=function(event){
    let pnidModal=document.getElementById('pnid-modal');
    let calcModal=document.getElementById('calc-modal');
    let regModal=document.getElementById('register-modal');
    let ffModal=document.getElementById('ff-modal');
    if(event.target==pnidModal&&pnidModal) pnidModal.style.display='none';
    if(event.target==calcModal&&calcModal) calcModal.style.display='none';
    if(event.target==regModal&&regModal)   regModal.style.display='none';
    if(event.target==ffModal&&ffModal)     ffModal.style.display='none';
}

function downloadPnIdImage(){const link=document.createElement('a');link.href=document.getElementById('pnid-image').src;link.download="P_and_ID_Diagram.png";document.body.appendChild(link);link.click();document.body.removeChild(link);}

// =========================================================
// 6. ECONOMIC BENEFITS CALCULATOR
// =========================================================
const TEMP_OPTIONS_INLET  = Array.from({length:31},(_,i)=>i+5);
const TEMP_OPTIONS_OUTLET = Array.from({length:26},(_,i)=>i+35);
const ELECTRICITY_OPTIONS = Array.from({length:24},(_,i)=>i+2);
const LPG_OPTIONS         = Array.from({length:121},(_,i)=>i+30);
const PNG_OPTIONS         = Array.from({length:121},(_,i)=>i+30);

function openCalcModal() {
    let cop=4.0;
    try{const modSelect=document.getElementById('model-select');if(modSelect&&typeof allProducts!=='undefined'){const mod=modSelect.value;const hp=allProducts.find(x=>x.model===mod);if(hp&&hp.cop){cop=parseFloat(hp.cop);}}}catch(e){}
    document.getElementById('calc-modal').style.display='flex';
    buildCalcUI(cop); runCalc();
}
function closeCalcModal(){document.getElementById('calc-modal').style.display='none';}
function buildCalcUI(cop){
    let inletSel=document.getElementById('calc-inlet');inletSel.innerHTML=TEMP_OPTIONS_INLET.map(v=>`<option value="${v}" ${v===20?'selected':''}>${v} °C</option>`).join('');
    let outletSel=document.getElementById('calc-outlet');outletSel.innerHTML=TEMP_OPTIONS_OUTLET.map(v=>`<option value="${v}" ${v===55?'selected':''}>${v} °C</option>`).join('');
    let elecSel=document.getElementById('calc-elec');elecSel.innerHTML=ELECTRICITY_OPTIONS.map(v=>`<option value="${v}" ${v===10?'selected':''}>${v}</option>`).join('');
    let lgpSel=document.getElementById('calc-lgp');lgpSel.innerHTML=LPG_OPTIONS.map(v=>`<option value="${v}" ${v===80?'selected':''}>${v}</option>`).join('');
    let pngSel=document.getElementById('calc-png');pngSel.innerHTML=PNG_OPTIONS.map(v=>`<option value="${v}" ${v===50?'selected':''}>${v}</option>`).join('');
    const clampedCop=Math.min(5.0,Math.max(2.0,cop));
    document.getElementById('calc-cop-input').value=clampedCop.toFixed(2);
}
function handleCOPInput(){let input=document.getElementById('calc-cop-input');let warn=document.getElementById('cop-warning');let val=parseFloat(input.value);if(val<2.0||val>5.0){warn.style.display='block';}else{warn.style.display='none';}}
function validateCOP(){let input=document.getElementById('calc-cop-input');let warn=document.getElementById('cop-warning');let val=parseFloat(input.value);if(isNaN(val))val=4.0;let alerted=false;if(val<2.0){alert("Minimum COP allowed is 2.0");val=2.0;alerted=true;}else if(val>5.0){alert("Maximum COP allowed is 5.0");val=5.0;alerted=true;}if(alerted||(val>=2.0&&val<=5.0)){warn.style.display='none';}input.value=val.toFixed(2);runCalc();}
function runCalc(){
    const Tin=parseFloat(document.getElementById('calc-inlet').value)||20;
    const Tout=parseFloat(document.getElementById('calc-outlet').value)||55;
    const Qday=parseFloat(document.getElementById('calc-qty').value)||2000;
    const Elec=parseFloat(document.getElementById('calc-elec').value)||10;
    const LPGp=parseFloat(document.getElementById('calc-lgp').value)||80;
    const PNGp=parseFloat(document.getElementById('calc-png').value)||50;
    let rawCOP=parseFloat(document.getElementById('calc-cop-input').value);if(isNaN(rawCOP))rawCOP=4.0;
    const COP=Math.min(5.0,Math.max(2.0,rawCOP));
    const dT=Tout-Tin;const heatDay_kJ=Qday*4.184*dT;const heat_kW=heatDay_kJ/86400;
    const kWh_elec=heatDay_kJ/3600;const cost_elec_day=kWh_elec*Elec;const cost_elec_month=cost_elec_day*30;const cost_elec_year=cost_elec_day*365;
    const kWh_hp=kWh_elec/COP;const cost_hp_day=kWh_hp*Elec;const cost_hp_month=cost_hp_day*30;const cost_hp_year=cost_hp_day*365;
    const lgp_kg_day=heatDay_kJ/(55000*0.85);const cost_lgp_day=lgp_kg_day*LPGp;const cost_lgp_month=cost_lgp_day*30;const cost_lgp_year=cost_lgp_day*365;
    const png_sm3_day=heatDay_kJ/(36800*0.90);const cost_png_day=png_sm3_day*PNGp;const cost_png_month=cost_png_day*30;const cost_png_year=cost_png_day*365;
    const save_elec_rs=cost_elec_year-cost_hp_year;const save_lgp_rs=cost_lgp_year-cost_hp_year;const save_png_rs=cost_png_year-cost_hp_year;
    const pct_elec=(save_elec_rs/cost_elec_year)*100;const pct_lgp=(save_lgp_rs/cost_lgp_year)*100;const pct_png=(save_png_rs/cost_png_year)*100;
    const fmt=(v,d=0)=>v.toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});
    const fmtR=v=>'₹ '+fmt(v,0);
    setVal('r-dt',dT+' °C');setVal('r-heat',heat_kW.toFixed(2)+' kW');
    setVal('r-hp-eff',COP.toFixed(2));setVal('r-hp-kwh',fmt(kWh_hp,2)+' kWh/day');setVal('r-hp-day',fmtR(cost_hp_day));setVal('r-hp-month',fmtR(cost_hp_month));setVal('r-hp-year',fmtR(cost_hp_year));
    setVal('r-eg-kwh',fmt(kWh_elec,2)+' kWh/day');setVal('r-eg-day',fmtR(cost_elec_day));setVal('r-eg-month',fmtR(cost_elec_month));setVal('r-eg-year',fmtR(cost_elec_year));
    setVal('r-lgp-cons',fmt(lgp_kg_day,3)+' kg/day');setVal('r-lgp-day',fmtR(cost_lgp_day));setVal('r-lgp-month',fmtR(cost_lgp_month));setVal('r-lgp-year',fmtR(cost_lgp_year));
    setVal('r-png-cons',fmt(png_sm3_day,3)+' Sm³/day');setVal('r-png-day',fmtR(cost_png_day));setVal('r-png-month',fmtR(cost_png_month));setVal('r-png-year',fmtR(cost_png_year));
    setVal('r-save-elec',fmtR(save_elec_rs)+' / yr ('+pct_elec.toFixed(1)+'%)');setVal('r-save-lgp',fmtR(save_lgp_rs)+' / yr ('+pct_lgp.toFixed(1)+'%)');setVal('r-save-png',fmtR(save_png_rs)+' / yr ('+pct_png.toFixed(1)+'%)');
}
function setVal(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}
// =========================================================
// 7. FOULING FACTOR — KIRLOSKAR OFFICIAL FORMAT (UPDATED)
// =========================================================

function openFFModal() {
    const d = window._currentChillerData;
    if (!d) { alert('Please generate a BEE Chiller report first.'); return; }

    const areaVal = 11;
    const ewt100 = parseFloat(d.EI100) || 12;
    const lwt    = parseFloat(d.EO100) || 7;
    const cap100 = parseFloat(d.C100)  || 35.72;
    const FF     = parseFloat(d.FF)    || 0.018;

    const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const logoUrl = baseUrl + 'images/chillers_logo.png';

    const loadPts = [
        { pct:'100%', ewt: ewt100,            capF: 1.00 },
        { pct:'75%',  ewt: ewt100*(10.75/12), capF: 0.75 },
        { pct:'50%',  ewt: ewt100*(9.50/12),  capF: 0.50 },
        { pct:'25%',  ewt: ewt100*(8.25/12),  capF: 0.25 },
    ];

    const cols = loadPts.map(lp => {
        const ewt   = lp.ewt;
        const lwtV  = lwt;
        const R     = ewt - lwtV;
        const Tsat  = lwtV - 1.5;
        const Scond = lwtV - Tsat;
        const RoS   = 1 + (R / Scond);
        const lnRoS = Math.log(RoS);
        const LMTD  = R / lnRoS;
        const cap   = cap100 * lp.capF;
        const ILMTD = FF * (cap / areaVal);
        const Z     = R / (LMTD - ILMTD);
        const eZ    = Math.exp(Z);
        const Sc    = R / (eZ - 1);
        const TDa   = Scond - Sc;
        return { ewt, lwtV, R, Tsat, Scond, RoS, lnRoS, LMTD, FF, cap, A: areaVal, ILMTD, Z, eZ, Sc, TDa };
    });

    const f  = (v, dec) => Number(v).toFixed(dec);
    const f2 = v => f(v, 2);
    const f0 = v => f(v, 0);

    const Bi = 'border:1px solid #333;';

    const rows = [
        ['EWT',          'Deg C',   c => f2(c.ewt),   false],
        ['LWT',          'Deg C',   c => f2(c.lwtV),  false],
        ['R',            'Deg C',   c => f2(c.R),     false],
        ['Tsat',         'Deg C',   c => f2(c.Tsat),  false],
        ['S(cond)',       'Deg C',   c => f2(c.Scond), false],
        ['(1+(R\\S))',   '',         c => f2(c.RoS),   false],
        ['ln(1+(R\\S))', '',         c => f2(c.lnRoS), false],
        ['LMTD',         'Deg C',   c => f2(c.LMTD),  false],
        ['FF',           'm² K/kW', c => f(c.FF,3),   false],
        ['q',            'kW',      c => f0(c.cap),   false],
        ['A',            'sq.m',    c => f2(c.A),     false],
        ['ILMTD',        'Deg C',   c => f2(c.ILMTD), false],
        ['Z',            '',        c => f2(c.Z),     false],
        ['e^Z',          '',        c => f2(c.eZ),    false],
        ['Sc',           'Deg C',   c => f2(c.Sc),    false],
        ['TDa',          'Deg C',   c => f2(c.TDa),   true ],
    ];

    const dataRowsHtml = rows.map(([label, unit, valFn, isBold]) => {
        const bold = isBold ? 'font-weight:800;background:#f0f0f0;' : '';
        const cells = cols.map(c =>
            `<td style="${Bi}height:22px;padding:2px 4px;text-align:center;font-size:10px;${bold}">${valFn(c)}</td>`
        ).join('');
        return `<tr>
            <td style="${Bi}padding:3px 8px;font-weight:600;text-align:left;font-size:10px;${bold}">${label}</td>
            <td style="${Bi}padding:3px 6px;color:#333;font-size:9.5px;text-align:center;${bold}">${unit}</td>
            ${cells}
        </tr>`;
    }).join('');

    const glossLines = [
        ['EWT',     'Entering water temperature to the heat exchanger'],
        ['LWT',     'Leaving water temperature to the heat exchanger'],
        ['R',       'Mod of the difference of Leaving water temperature and Entering water temperature'],
        ['Tsat',    'Refrigerant saturated temperature'],
        ['S(cond)', 'Mod of the difference of refrigerant saturated temperature and leaving water temperature'],
        ['LMTD',    'Logarithmic mean temperature difference in the heat exchanger'],
        ['FF',      'Fouling factor allowances for the heat exchanger'],
        ['q',       'Rated net capacity'],
        ['A',       'Water side heat transfer surface area of the heat exchanger'],
        ['ILMTD',   'Incremental logarithmic mean temperature difference in the heat exchanger'],
        ['Sc',      'Small temperature difference as rated in clean condition with no fouling in the heat exchanger'],
        ['TDa',     'Adjustment water temperature to simulate additional fouling in the heat exchanger'],
    ];

    const glossHtml = glossLines.map(([t, desc]) =>
        `<div style="margin:0 0 5px 0;font-size:9.5px;line-height:1.6;text-align:left;">
            <strong>${t}</strong>: ${desc}
        </div>`
    ).join('');

    // === MODAL OVERLAY ===
    const modal = document.getElementById('ff-modal');
    modal.style.cssText = `
        display: flex !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0,0,0,0.65) !important;
        z-index: 999999 !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: auto !important;
        box-sizing: border-box !important;
        padding: 20px !important;
    `;

    // === MODAL INNER BOX ===
    const inner = document.getElementById('ff-modal-inner');
    inner.style.cssText = `
        background: #fff !important;
        border-radius: 6px !important;
        width: 780px !important;
        max-width: 100% !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
        box-shadow: 0 10px 50px rgba(0,0,0,0.4) !important;
        display: flex !important;
        flex-direction: column !important;
    `;

    inner.innerHTML = `
<div style="font-family:Arial,sans-serif;background:#fff;">

  <!-- BUTTON BAR -->
  <div id="ff-btn-bar" style="position:sticky;top:0;z-index:10;display:flex;gap:10px;padding:12px 16px;background:#f0f0f0;border-bottom:2px solid #ccc;justify-content:center;box-sizing:border-box;">
    <button onclick="downloadFFPDF()" style="background:#16a34a;color:#fff;border:none;padding:9px 22px;border-radius:4px;font-weight:800;cursor:pointer;font-size:13px;">⬇ Download Full PDF</button>
    <button onclick="closeFFModal()" style="background:#6b7280;color:#fff;border:none;padding:9px 18px;border-radius:4px;font-weight:800;cursor:pointer;font-size:13px;">✕ Close</button>
  </div>

  <!-- PRINTABLE AREA -->
  <div id="ff-printable" style="padding:20px;background:#fff;box-sizing:border-box;">

    <table style="width:100%;border-collapse:collapse;border:2px solid #000;table-layout:fixed;">
      <colgroup>
        <col style="width:20%;">
        <col style="width:12%;">
        <col style="width:17%;">
        <col style="width:17%;">
        <col style="width:17%;">
        <col style="width:17%;">
      </colgroup>

      <!-- LOGO -->
      <tr>
        <td colspan="6" style="border-bottom:2px solid #000;padding:10px 14px;text-align:right;">
          <img src="${logoUrl}" style="height:50px;width:auto;" onerror="this.style.display='none'">
        </td>
      </tr>

      <!-- MODEL NO -->
      <tr>
        <td style="border-bottom:1.5px solid #000;border-right:1px solid #000;padding:6px 10px;font-weight:800;font-size:11px;background:#eee;">Model No.</td>
        <td colspan="5" style="border-bottom:1.5px solid #000;padding:6px 10px;font-weight:800;font-size:12px;">${d.ModelName}</td>
      </tr>

      <!-- HEADER ROW -->
      <tr style="background:#f2f2f2;">
        <th colspan="2" style="border:1px solid #000;padding:6px 8px;text-align:left;font-size:10px;">BEE Load Point</th>
        <th style="border:1px solid #000;text-align:center;font-size:11px;">100%</th>
        <th style="border:1px solid #000;text-align:center;font-size:11px;">75%</th>
        <th style="border:1px solid #000;text-align:center;font-size:11px;">50%</th>
        <th style="border:1px solid #000;text-align:center;font-size:11px;">25%</th>
      </tr>
      <tr>
        <th colspan="2" style="border:1px solid #000;height:18px;"></th>
        <th style="border:1px solid #000;text-align:center;font-size:9.5px;">Evap.</th>
        <th style="border:1px solid #000;text-align:center;font-size:9.5px;">Evap.</th>
        <th style="border:1px solid #000;text-align:center;font-size:9.5px;">Evap.</th>
        <th style="border:1px solid #000;text-align:center;font-size:9.5px;">Evap.</th>
      </tr>

      <!-- DATA ROWS -->
      ${dataRowsHtml}

      <!-- GLOSSARY -->
      <tr>
        <td colspan="6" style="border-top:2px solid #000;border-bottom:2px solid #000;padding:20px 14px 12px 14px;vertical-align:top;">
            ${glossHtml}
        </td>
      </tr>

    </table>
  </div>
</div>`;
}

function downloadFFPDF() {
    const el  = document.getElementById('ff-printable');
    const d   = window._currentChillerData;
    const mdl = d ? d.ModelName : 'FF_Report';

    const opt = {
        margin:      [25, 5, 5, 5],
        filename:    ('Kirloskar_FF_' + mdl + '.pdf').replace(/\s+/g, '_'),
        image:       { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(el).save();
}