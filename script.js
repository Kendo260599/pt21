// ============== Parse & quy tắc năm sinh hiệu lực (01/01–13/03 -> năm trước) ==============
function parseDateParts(dateStr){
  if(!dateStr || typeof dateStr!=='string') throw new Error('Ngày sinh không hợp lệ');
  const s = dateStr.trim();
  const sep = s.includes('-')?'-':(s.includes('/')?'/':null);
  if(!sep) throw new Error('Định dạng ngày phải có "-" hoặc "/" (vd 1992-03-13 hoặc 26/05/1992)');
  const parts = s.split(sep).map(x=>parseInt(x,10));
  if(parts.length!==3 || parts.some(isNaN)) throw new Error('Định dạng ngày không đúng');
  if(parts[0] > 31) return {year:parts[0], month:parts[1], day:parts[2]}; // YYYY-MM-DD
  return {year:parts[2], month:parts[1], day:parts[0]}; // DD/MM/YYYY
}
function getEffectiveBirthYear(birthDateString){
  const {year,month,day} = parseDateParts(birthDateString);
  if(month < 3 || (month===3 && day<=13)) return year - 1;
  return year;
}

// ============== CUNG theo bảng ảnh (chu kỳ 9 năm) ==============
const CUNG_INFO = {
  'Càn':  { nguyenTo:'Kim',  huong:'Tây Bắc' },
  'Khôn': { nguyenTo:'Thổ',  huong:'Tây Nam' },
  'Cấn':  { nguyenTo:'Thổ',  huong:'Đông Bắc' },
  'Chấn': { nguyenTo:'Mộc',  huong:'Đông' },
  'Tốn':  { nguyenTo:'Mộc',  huong:'Đông Nam' },
  'Ly':   { nguyenTo:'Hỏa',  huong:'Nam' },
  'Khảm': { nguyenTo:'Thủy', huong:'Bắc' },
  'Đoài': { nguyenTo:'Kim',  huong:'Tây' }
};
const DONG_TU = ['Khảm','Ly','Chấn','Tốn'];

const MALE_START = 1921;
const FEMALE_START = 1922;
const MALE_CUNG_SEQ   = ['Đoài','Càn','Khôn','Tốn','Chấn','Khôn','Khảm','Ly','Cấn'];
const MALE_SO_SEQ     = [7,6,5,4,3,2,1,9,8];
const FEMALE_CUNG_SEQ = ['Cấn','Khảm','Ly','Tốn','Chấn','Khôn','Càn','Đoài','Cấn'];
const FEMALE_SO_SEQ   = [2,1,9,8,7,6,5,4,3];
const mod9 = n => ((n%9)+9)%9;

function getCungMenh(birthDateString, gender){
  const effectiveYear = getEffectiveBirthYear(birthDateString);
  let idx,cung,so;
  if(gender==='nam'){
    idx = mod9(effectiveYear - MALE_START);
    cung = MALE_CUNG_SEQ[idx]; so = MALE_SO_SEQ[idx];
  }else{
    idx = mod9(effectiveYear - FEMALE_START);
    cung = FEMALE_CUNG_SEQ[idx]; so = FEMALE_SO_SEQ[idx];
  }
  const {nguyenTo,huong} = CUNG_INFO[cung];
  const nhomTrach = DONG_TU.includes(cung) ? 'Đông Tứ Trạch' : 'Tây Tứ Trạch';
  return { effectiveYear, so, cung, nhomTrach, nguyenTo, huong };
}

// ============== Bát Trạch 8 hướng ==============
function getBatTrachForCung(cung){
  const C = {
    good:{
      'Sinh Khí':{ten:'Sinh Khí',loai:'good',y:'Tài lộc, danh tiếng, thăng tiến, vượng khí.'},
      'Thiên Y': {ten:'Thiên Y', loai:'good',y:'Sức khỏe, trường thọ, quý nhân.'},
      'Diên Niên':{ten:'Diên Niên',loai:'good',y:'Hòa thuận, bền vững quan hệ.'},
      'Phục Vị': {ten:'Phục Vị', loai:'good',y:'Ổn định, thi cử, phát triển bản thân.'}
    },
    bad:{
      'Tuyệt Mệnh':{ten:'Tuyệt Mệnh',loai:'bad',y:'Nặng nhất: tổn hại lớn, bệnh tật, phá sản.'},
      'Ngũ Quỷ':   {ten:'Ngũ Quỷ',   loai:'bad',y:'Thị phi, mất mát, tranh cãi.'},
      'Lục Sát':   {ten:'Lục Sát',   loai:'bad',y:'Kiện tụng, tai nạn, bất hòa.'},
      'Họa Hại':   {ten:'Họa Hại',   loai:'bad',y:'Xui xẻo, thất bại nhỏ lẻ.'}
    }
  };
  const B = {
    'Khảm': {'Đông Nam':C.good['Sinh Khí'],'Đông':C.good['Thiên Y'],'Nam':C.good['Diên Niên'],'Bắc':C.good['Phục Vị'],'Tây Nam':C.bad['Tuyệt Mệnh'],'Đông Bắc':C.bad['Ngũ Quỷ'],'Tây Bắc':C.bad['Lục Sát'],'Tây':C.bad['Họa Hại']},
    'Ly':   {'Đông':C.good['Sinh Khí'],'Đông Nam':C.good['Thiên Y'],'Bắc':C.good['Diên Niên'],'Nam':C.good['Phục Vị'],'Tây Bắc':C.bad['Tuyệt Mệnh'],'Tây':C.bad['Ngũ Quỷ'],'Tây Nam':C.bad['Lục Sát'],'Đông Bắc':C.bad['Họa Hại']},
    'Chấn': {'Nam':C.good['Sinh Khí'],'Bắc':C.good['Thiên Y'],'Đông Nam':C.good['Diên Niên'],'Đông':C.good['Phục Vị'],'Tây':C.bad['Tuyệt Mệnh'],'Tây Bắc':C.bad['Ngũ Quỷ'],'Đông Bắc':C.bad['Lục Sát'],'Tây Nam':C.bad['Họa Hại']},
    'Tốn':  {'Bắc':C.good['Sinh Khí'],'Nam':C.good['Thiên Y'],'Đông':C.good['Diên Niên'],'Đông Nam':C.good['Phục Vị'],'Đông Bắc':C.bad['Tuyệt Mệnh'],'Tây Nam':C.bad['Ngũ Quỷ'],'Tây':C.bad['Lục Sát'],'Tây Bắc':C.bad['Họa Hại']},
    'Càn':  {'Tây':C.good['Sinh Khí'],'Đông Bắc':C.good['Thiên Y'],'Tây Nam':C.good['Diên Niên'],'Tây Bắc':C.good['Phục Vị'],'Nam':C.bad['Tuyệt Mệnh'],'Đông':C.bad['Ngũ Quỷ'],'Bắc':C.bad['Lục Sát'],'Đông Nam':C.bad['Họa Hại']},
    'Khôn': {'Đông Bắc':C.good['Sinh Khí'],'Tây':C.good['Thiên Y'],'Tây Bắc':C.good['Diên Niên'],'Tây Nam':C.good['Phục Vị'],'Bắc':C.bad['Tuyệt Mệnh'],'Đông Nam':C.bad['Ngũ Quỷ'],'Nam':C.bad['Lục Sát'],'Đông':C.bad['Họa Hại']},
    'Cấn':  {'Tây Nam':C.good['Sinh Khí'],'Tây Bắc':C.good['Thiên Y'],'Tây':C.good['Diên Niên'],'Đông Bắc':C.good['Phục Vị'],'Đông Nam':C.bad['Tuyệt Mệnh'],'Bắc':C.bad['Ngũ Quỷ'],'Đông':C.bad['Lục Sát'],'Nam':C.bad['Họa Hại']},
    'Đoài': {'Tây Bắc':C.good['Sinh Khí'],'Tây Nam':C.good['Thiên Y'],'Đông Bắc':C.good['Diên Niên'],'Tây':C.good['Phục Vị'],'Đông':C.bad['Tuyệt Mệnh'],'Nam':C.bad['Ngũ Quỷ'],'Đông Nam':C.bad['Lục Sát'],'Bắc':C.bad['Họa Hại']}
  };
  return B[cung];
}
function analyzeHouseDirection(cungObj, huongNha){
  const table = getBatTrachForCung(cungObj.cung);
  const all = Object.entries(table).map(([huong,info])=>({huong, ...info}));
  const selected = table[huongNha];
  const goods = all.filter(x=>x.loai==='good');
  const bads  = all.filter(x=>x.loai==='bad');
  return {selected, goods, bads, all};
}
function adviceForDirectionClass(cls){
  if(!cls) return [];
  if(cls==='good') return [
    'Ưu tiên cửa chính/ban công theo hướng này.',
    'Bếp, bàn thờ, giường, bàn làm việc xoay về 1 trong 4 hướng tốt.',
    'Giữ lối vào thông thoáng, sạch sẽ.'
  ];
  return [
    'Dùng bình phong/hiên/bậc tam cấp để “bẻ dòng khí xấu”.',
    'Bố trí nội thất “tọa hung – hướng cát”.',
    'Treo Bát Quái lồi ngoài cổng (cân nhắc).',
    'Tăng cây xanh, ánh sáng, nước/đá trang trí để điều hòa khí.'
  ];
}

// ============== 12 con giáp & các kiểm tra năm/tháng xây ==============
const ZODIAC = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
const idxZodiac = y => ((y-4)%12+12)%12;
const nameZodiac = y => ZODIAC[idxZodiac(y)];
const nameByIndex = i => ZODIAC[i];
const TAM_TAI_GROUPS = [
  {group:['Thân','Tý','Thìn'], tamTai:['Dần','Mão','Thìn']},
  {group:['Dần','Ngọ','Tuất'], tamTai:['Thân','Dậu','Tuất']},
  {group:['Hợi','Mão','Mùi'], tamTai:['Tỵ','Ngọ','Mùi']},
  {group:['Tỵ','Dậu','Sửu'], tamTai:['Hợi','Tý','Sửu']}
];
function checkTamTai(ownerYear, constructionYear){
  const ownerChi = nameZodiac(ownerYear);
  const cChi = nameZodiac(constructionYear);
  const g = TAM_TAI_GROUPS.find(x=>x.group.includes(ownerChi));
  return {isTamTai: g ? g.tamTai.includes(cChi) : false, ownerChi, constructionChi:cChi, tamTaiList:g?g.tamTai:[]};
}
function tuoiMu(effYear, consYear){ return consYear - effYear + 1; }
function checkKimLau(tuoi){
  let r = tuoi%9; if(r===0) r=9;
  const types = {1:'Kim Lâu Thân',3:'Kim Lâu Thê',6:'Kim Lâu Tử',8:'Kim Lâu Lục Súc'};
  return {isKimLau:[1,3,6,8].includes(r), type:types[r]||null, remainder:r};
}
function checkHoangOc(tuoi){
  const labels = ['Nhất Cát','Nhì Nghi','Tam Địa Sát','Tứ Tấn Tài','Ngũ Thọ Tử','Lục Hoang Ốc'];
  const m = tuoi%6; const idx = (m===0)?5:m-1; const name = labels[idx];
  return {name, isBad:['Tam Địa Sát','Ngũ Thọ Tử','Lục Hoang Ốc'].includes(name)};
}
function checkXungTuoi(ownerYear, consYear){
  const opp = (idxZodiac(ownerYear)+6)%12;
  return {isXung: idxZodiac(consYear)===opp, ownerChi:nameZodiac(ownerYear), constructionChi:nameZodiac(consYear), oppositeChi:nameByIndex(opp)};
}
function elementYear(y){
  const s = ((y-4)%10+10)%10;
  if(s===0||s===1) return 'Mộc';
  if(s===2||s===3) return 'Hỏa';
  if(s===4||s===5) return 'Thổ';
  if(s===6||s===7) return 'Kim';
  return 'Thủy';
}
function elementMonth(m){
  m = Number(m);
  if([1,6,11].includes(m)) return 'Thủy';
  if([2,7,12].includes(m)) return 'Hỏa';
  if([3,8].includes(m)) return 'Thổ';
  if([4,9].includes(m)) return 'Kim';
  if([5,10].includes(m)) return 'Mộc';
  return null;
}
const KHAC = {'Mộc':'Thổ','Thổ':'Thủy','Thủy':'Hỏa','Hỏa':'Kim','Kim':'Mộc'};
const isElementConflict = (e1,e2)=> e1 && e2 && (KHAC[e1]===e2 || KHAC[e2]===e1);

// ============== Yếu tố xấu BĐS & hóa giải ==============
function checkSiteIssues(features){
  const problems=[]; const solutions=[];
  if(features.includes('benh-vien')){ problems.push('Trước mặt Bệnh viện: âm khí nặng, ảnh hưởng trường khí & sức khỏe.'); solutions.push('Tăng cây xanh, rèm dày, chiếu sáng tốt; cân nhắc Bát Quái lồi; tượng Di Lặc tăng dương khí.'); }
  if(features.includes('chua') || features.includes('nha-tho')){ problems.push('Đối diện Chùa/Nhà thờ: khí tĩnh/âm mạnh, dễ ảnh hưởng tài khí.'); solutions.push('Quan Công gần cửa, chuông gió kim loại, cây Kim Ngân/Trầu bà; hạn chế cửa nhìn thẳng.'); }
  if(features.includes('truong-hoc')){ problems.push('Đối diện Trường học: ồn ào, khí động, ảnh hưởng nghỉ ngơi.'); solutions.push('Hàng rào/vách ngăn/rèm cách âm; phòng ngủ lùi sâu; tăng cây xanh.'); }
  if(features.includes('duong-dam')){ problems.push('Đường đâm thẳng vào nhà: sát khí trực xung, hao tài.'); solutions.push('Bình phong/tiểu cảnh, cây to, bậc tam cấp “gãy dòng”; cân nhắc Bát Quái lồi.'); }
  if(features.includes('nga-ba') || features.includes('nga-tu')){ problems.push('Nhà tại Ngã ba/Ngã tư: khí loạn, bất ổn, khó tụ tài.'); solutions.push('Cổng kín/hàng rào; hồ cá/đá/đèn cân bằng; sảnh/hiên che; cân nhắc cửa phụ.'); }
  if(features.includes('duong-doc')){ problems.push('Đường dốc trước nhà: khí trượt, khó tụ.'); solutions.push('Bậc thềm, ốp đá nhám, bồn cây bậc cấp; ưu tiên cửa lệch/bình phong.'); }
  if(features.includes('cot-dien')){ problems.push('Cột điện gần cổng/nhà: sát khí, từ trường xấu.'); solutions.push('Lùi cổng/cửa, cây cao che chắn, đá hộ mệnh; tránh kê giường sát tường phía cột.'); }
  return {problems, solutions};
}

// ============== Tổng hợp đánh giá ==============
function evaluateBuildTime(birthDate, gender, consYear, consMonth){
  const cung = getCungMenh(birthDate, gender);
  const age = tuoiMu(cung.effectiveYear, consYear);
  const kimLau = checkKimLau(age);
  const hoangOc = checkHoangOc(age);
  const tamTai = checkTamTai(cung.effectiveYear, consYear);
  const xung = checkXungTuoi(cung.effectiveYear, consYear);
  const yElem = elementYear(consYear);
  const mElem = elementMonth(consMonth);
  const conflictYear = isElementConflict(cung.nguyenTo, yElem);
  const conflictMonth = isElementConflict(cung.nguyenTo, mElem);
  const yearWarnings=[];
  if(kimLau.isKimLau) yearWarnings.push(`Phạm Kim Lâu (${kimLau.type}) — tuổi mụ ${age}.`);
  if(hoangOc.isBad)   yearWarnings.push(`Phạm Hoang Ốc (${hoangOc.name}).`);
  if(tamTai.isTamTai) yearWarnings.push(`Phạm Tam Tai (${tamTai.constructionChi}); chu kỳ Tam Tai: ${tamTai.tamTaiList.join(', ')}.`);
  if(xung.isXung)     yearWarnings.push(`Xung tuổi với năm ${consYear} (năm ${xung.constructionChi} đối xung ${xung.oppositeChi}).`);
  if(conflictYear)    yearWarnings.push(`Ngũ hành Cung (${cung.nguyenTo}) khắc Ngũ hành Năm (${yElem}).`);
  const monthWarnings=[];
  if(conflictMonth)   monthWarnings.push(`Tháng ${consMonth}: Cung (${cung.nguyenTo}) khắc tháng (${mElem}).`);
  return { cung, ageMu:age, kimLau, hoangOc, tamTai, xung, yearElement:yElem, monthElement:mElem, yearWarnings, monthWarnings,
    isYearGood: yearWarnings.length===0, isMonthGood: monthWarnings.length===0 };
}
function evaluateAll(birthDate, gender, huongNha, consYear, consMonth, features){
  const build = evaluateBuildTime(birthDate, gender, consYear, consMonth);
  const dir = analyzeHouseDirection(build.cung, huongNha);
  const site = checkSiteIssues(features);
  return {build, dir, site};
}

// ============== Lưu hồ sơ khách hàng (LocalStorage) ==============
const STORAGE_KEY = 'ptpro_profiles_v1';
const getProfiles = ()=> JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
const setProfiles = arr => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
const uuid = ()=> (crypto?.randomUUID ? crypto.randomUUID() : 'id_'+Date.now()+Math.random().toString(16).slice(2));
function normalizePhone(phone){
  const p = (phone||'').replace(/[^\d+]/g,'').trim();
  if(p.startsWith('+84')) return p;
  if(p.startsWith('0') && p.length>=9) return '+84'+p.slice(1);
  return p;
}
function isValidPhone(phone){
  const p = normalizePhone(phone);
  // Ưu tiên mobile VN, fallback: 8–13 digits
  const vnMobile = /^\+?84(3|5|7|8|9)\d{8}$/;
  const generic  = /^\+?\d{8,13}$/;
  return vnMobile.test(p) || generic.test(p);
}

function gatherInputs(){
  const name  = document.getElementById('kh-ten').value.trim();
  const phone = document.getElementById('kh-phone').value.trim();
  const birth = document.getElementById('ngay-sinh').value.trim();
  const gender= document.getElementById('gioi-tinh').value;
  const dir   = document.getElementById('huong-nha').value;
  const yearX = parseInt(document.getElementById('nam-xay').value,10);
  const monthX= parseInt(document.getElementById('thang-xay').value,10);
  const features = Array.from(document.querySelectorAll('input[name="location-feature"]:checked')).map(c=>c.value);
  return {name, phone, birth, gender, dir, yearX, monthX, features};
}

function saveProfile(currentResult){
  const i = gatherInputs();
  if(!i.name) return alert('Vui lòng nhập họ tên khách hàng.');
  if(!i.phone) return alert('Vui lòng nhập số điện thoại.');
  if(!isValidPhone(i.phone)) return alert('Số điện thoại chưa đúng định dạng.');
  if(!i.birth) return alert('Vui lòng nhập ngày sinh.');
  if(!i.yearX || i.yearX<1900 || i.yearX>2099) return alert('Năm xây không hợp lệ.');
  if(!i.monthX || i.monthX<1 || i.monthX>12) return alert('Tháng xây không hợp lệ.');

  // Tính lại nếu chưa có result
  const R = currentResult || evaluateAll(i.birth, i.gender, i.dir, i.yearX, i.monthX, i.features);

  const profiles = getProfiles();
  const phoneKey = normalizePhone(i.phone);

  // Nếu đã có SĐT -> cập nhật
  const existIdx = profiles.findIndex(p => p.customer.phoneKey === phoneKey);
  const profile = {
    id: existIdx>=0 ? profiles[existIdx].id : uuid(),
    createdAt: existIdx>=0 ? profiles[existIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: { name: i.name, phone: i.phone, phoneKey },
    input: { birth: i.birth, gender: i.gender, huongNha: i.dir, year: i.yearX, month: i.monthX, features: i.features },
    summary: {
      cung: R.build.cung.cung,
      menh: R.build.cung.nguyenTo,
      nhom: R.build.cung.nhomTrach,
      huongNha: i.dir,
      yearWarnings: R.build.yearWarnings.length,
      monthWarnings: R.build.monthWarnings.length
    },
    result: R // có thể cắt gọn nếu muốn
  };

  if(existIdx>=0) profiles[existIdx] = profile; else profiles.unshift(profile);
  setProfiles(profiles);
  renderProfiles();
  alert('Đã lưu hồ sơ khách hàng.');
}

function renderProfiles(filter=''){
  const tbody = document.getElementById('profiles-tbody');
  const list = getProfiles().filter(p=>{
    const key = (p.customer.name+' '+p.customer.phone).toLowerCase();
    return key.includes(filter.toLowerCase());
  });
  const fmt = s => new Date(s).toLocaleString();
  tbody.innerHTML = list.map(p=>`
    <tr data-id="${p.id}">
      <td>${p.customer.name}</td>
      <td>${p.customer.phone}</td>
      <td>${p.summary.cung} (${p.summary.menh})</td>
      <td>${p.summary.huongNha}</td>
      <td>${fmt(p.createdAt)}</td>
      <td class="row-actions">
        <button class="view">Xem</button>
        <button class="delete">Xóa</button>
      </td>
    </tr>
  `).join('');
}

function exportCSV(){
  const rows = getProfiles();
  if(rows.length===0) return alert('Chưa có dữ liệu để xuất.');
  const header = ['id','name','phone','birth','gender','huongNha','year','month','cung','menh','nhom','yearWarnings','monthWarnings','createdAt'];
  const csvRows = [header.join(',')];
  rows.forEach(p=>{
    const r = [
      p.id,
      `"${p.customer.name.replace(/"/g,'""')}"`,
      p.customer.phone,
      p.input.birth,
      p.input.gender,
      p.input.huongNha,
      p.input.year,
      p.input.month,
      p.summary.cung,
      p.summary.menh,
      p.summary.nhom,
      p.summary.yearWarnings,
      p.summary.monthWarnings,
      p.createdAt
    ];
    csvRows.push(r.join(','));
  });
  const blob = new Blob([csvRows.join('\n')], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'khach_hang_phong_thuy.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============== UI: Phân tích + Lưu + Danh sách ==============
document.addEventListener('DOMContentLoaded', ()=>{
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnSave    = document.getElementById('btn-save');
  const btnExport  = document.getElementById('btn-export');
  const searchBox  = document.getElementById('profiles-search');
  const tableBody  = document.getElementById('profiles-tbody');

  renderProfiles();

  btnAnalyze?.addEventListener('click', ()=>{
    try{
      const i = gatherInputs();
      if(!i.birth) return alert('Vui lòng nhập ngày sinh.');
      if(!i.yearX || i.yearX<1900 || i.yearX>2099) return alert('Vui lòng nhập năm xây hợp lệ.');
      if(!i.monthX || i.monthX<1 || i.monthX>12) return alert('Vui lòng chọn tháng xây (1–12).');

      const R = evaluateAll(i.birth, i.gender, i.dir, i.yearX, i.monthX, i.features);

      const r = document.getElementById('result-content');
      let html = '';
      html += `<div class="ket-luan"><div><span class="badge">Cung mệnh</span> <strong>${R.build.cung.cung}</strong> — Ngũ hành: <strong>${R.build.cung.nguyenTo}</strong> — Nhóm: <strong>${R.build.cung.nhomTrach}</strong></div></div>`;

      const sel = R.dir.selected;
      html += `<h3 class="block-title">Hướng nhà: ${i.dir} <span class="tag ${sel?.loai||'warn'}">${sel?sel.ten:'?'}</span></h3>`;
      if(sel){
        html += `<p><em>Ý nghĩa:</em> ${sel.y}</p>`;
        const adv = adviceForDirectionClass(sel.loai);
        if(adv.length){ html += `<p><strong>Gợi ý:</strong></p><ul class="clean">`+adv.map(a=>`<li>${a}</li>`).join('')+`</ul>`; }
      }
      if(R.dir.goods?.length){
        const priority = {'Sinh Khí':1,'Thiên Y':2,'Diên Niên':3,'Phục Vị':4};
        const gsort = [...R.dir.goods].sort((a,b)=>(priority[a.ten]||9)-(priority[b.ten]||9));
        html += `<p><strong>4 hướng tốt nên ưu tiên:</strong></p><ul class="clean">`+
          gsort.map(g=>`<li><span class="good">${g.huong}</span> — ${g.ten}: ${g.y}</li>`).join('')+`</ul>`;
      }

      html += `<hr/>`;
      html += `<h3 class="block-title">Năm/Tháng xây</h3>`;
      html += `<p>Tuổi mụ: <strong>${R.build.ageMu}</strong> — Ngũ hành năm: <strong>${R.build.yearElement}</strong> — Ngũ hành tháng: <strong>${R.build.monthElement||'?'}</strong></p>`;
      if(R.build.yearWarnings.length===0) html += `<p class="good">Năm ${i.yearX}: Không thấy cảnh báo lớn.</p>`;
      else html += `<p><strong>Cảnh báo năm ${i.yearX}:</strong></p><ul class="clean">`+R.build.yearWarnings.map(w=>`<li class="bad">${w}</li>`).join('')+`</ul>`;
      if(R.build.monthWarnings.length===0) html += `<p class="good">Tháng ${i.monthX}: Không thấy cảnh báo lớn.</p>`;
      else html += `<p><strong>Cảnh báo tháng ${i.monthX}:</strong></p><ul class="clean">`+R.build.monthWarnings.map(w=>`<li class="warn">${w}</li>`).join('')+`</ul>`;

      html += `<hr/><h3 class="block-title">Môi trường xung quanh BĐS</h3>`;
      if(R.site.problems.length===0) html += `<p class="good">Không phát hiện yếu tố xấu đã chọn.</p>`;
      else{
        html += `<p><strong>Vấn đề:</strong></p><ul class="clean">`+R.site.problems.map(p=>`<li class="bad">${p}</li>`).join('')+`</ul>`;
        html += `<p><strong>Hóa giải gợi ý:</strong></p><ul class="clean">`+R.site.solutions.map(s=>`<li>${s}</li>`).join('')+`</ul>`;
      }

      r.innerHTML = html;
    }catch(err){
      console.error(err); alert('Lỗi: '+(err.message||err));
    }
  });

  btnSave?.addEventListener('click', ()=>{
    try{
      // Lưu, tự tính lại nếu cần
      saveProfile();
    }catch(err){
      console.error(err); alert('Lỗi: '+(err.message||err));
    }
  });

  btnExport?.addEventListener('click', exportCSV);

  searchBox?.addEventListener('input', e=> renderProfiles(e.target.value));

  tableBody?.addEventListener('click', e=>{
    const tr = e.target.closest('tr'); if(!tr) return;
    const id = tr.getAttribute('data-id');
    const profiles = getProfiles();
    const p = profiles.find(x=>x.id===id);
    if(!p) return;
    if(e.target.classList.contains('view')){
      // đổ dữ liệu lên form
      document.getElementById('kh-ten').value = p.customer.name;
      document.getElementById('kh-phone').value = p.customer.phone;
      document.getElementById('ngay-sinh').value = p.input.birth;
      document.getElementById('gioi-tinh').value = p.input.gender;
      document.getElementById('huong-nha').value = p.input.huongNha;
      document.getElementById('nam-xay').value = p.input.year;
      document.getElementById('thang-xay').value = p.input.month;
      // tick lại features
      document.querySelectorAll('input[name="location-feature"]').forEach(cb=>{
        cb.checked = p.input.features.includes(cb.value);
      });
      // cuộn lên kết quả
      document.getElementById('btn-analyze').click();
      window.scrollTo({top:0, behavior:'smooth'});
    }
    if(e.target.classList.contains('delete')){
      if(confirm('Xóa hồ sơ này?')){
        setProfiles(profiles.filter(x=>x.id!==id));
        renderProfiles(searchBox.value);
      }
    }
  });
});