/* ============================================================
   KITCHEN VITALITY — app.js (demo frontend, không backend)
   State lưu localStorage · SPA · không phụ thuộc thư viện ngoài
   ============================================================ */
"use strict";

/* ---------------- TIỆN ÍCH ---------------- */
const $  = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const fmt = n => n.toLocaleString("vi-VN");
const DAY = 864e5;
const DAYS_VI = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function d2s(d) { return d.toISOString().slice(0, 10); }
function daysLeft(iso) { return Math.ceil((new Date(iso + "T00:00:00") - new Date(d2s(new Date()) + "T00:00:00")) / DAY); }

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------------- DỮ LIỆU MẶC ĐỊNH ---------------- */
const RECIPES = [
  { id:"ga-kho-mat-ong", name:"Gà kho mật ong", emojis:["🍗","🍯"], grad:"linear-gradient(135deg,#B71C1C,#8D6E63)",
    time:30, diff:"Trung bình", serve:2, kcal:350, meal:["dinner","lunch"],
    desc:"Món gà kho đậm đà, thịt mềm thơm mùi mật ong và tỏi — dễ làm, hợp cơm trắng nóng.",
    ing:[["Đùi gà (bỏ xương)","500","g"],["Mật ong","2","muỗng canh"],["Nước mắm","3","muỗng canh"],["Tỏi băm","1","củ"],["Dầu hào","1","muỗng canh"],["Hành lá","2","nhánh"],["Tiêu xay","1","ít"]],
    steps:["Sơ chế: gà rửa sạch, chặt miếng vừa ăn, ướp 15 phút với tỏi, tiêu và 1 muỗng nước mắm.","Phi thơm tỏi với 1 muỗng dầu, xếp gà da xuống chảo, chiên nhẹ 2 mặt vàng.","Pha sốt: 2 muỗng mật ong + 2 muỗng nước mắm + dầu hào + 3 muỗng nước, khuấy đều.","Đổ sốt vào chảo, đun liu riu 10–12 phút đến khi sốt sánh và bám đều miếng gà.","Rắc hành lá, tắt bếp. Dùng nóng với cơm trắng và canh rau."],
    nutri:{p:28,c:15,f:12} },
  { id:"pho-bo", name:"Phở bò", emojis:["🍜","🥩"], grad:"linear-gradient(135deg,#5D4037,#8D6E63)",
    time:60, diff:"Khó", serve:4, kcal:420, meal:["morning","lunch"],
    desc:"Tô phở nước dùng trong, thơm hương quế hồi, thịt bò tái mềm và bánh phở trắng mịn.",
    ing:[["Bánh phở tươi","500","g"],["Thịt bò (nạm, bắp)","400","g"],["Xương ống bò","1","kg"],["Hành tây nướng","1","củ"],["Gừng nướng","1","củ"],["Quế + hồi + thảo quả","1","gói"],["Hành lá, rau thơm","1","bó"]],
    steps:["Blanch xương 5 phút, rửa sạch rồi ninh nhỏ lửa 90 phút với hành, gừng nướng và gói gia vị.","Thái bò mỏng, chần nhanh trong nước dùng sôi để giữ độ tái mềm.","Trụng bánh phở, xếp thịt, chan nước dùng đang sôi.","Ăn kèm hành lá, rau thơm, chanh, ớt và tương."],
    nutri:{p:32,c:48,f:10} },
  { id:"com-tam-suon", name:"Cơm tấm sườn bì", emojis:["🍚","🥩"], grad:"linear-gradient(135deg,#BF360C,#FF8F00)",
    time:45, diff:"Trung bình", serve:2, kcal:550, meal:["lunch","dinner"],
    desc:"Đĩa cơm tấm Sài Gòn chuẩn vị: sườn nướng mật ong, bì tôm thịt, chả trứng và nước mắm ngọt.",
    ing:[["Cơm tấm","2","chén"],["Sườn non","400","g"],["Thịt heo + tôm (làm bì)","200","g"],["Trứng vịt","2","trứng"],["Tỏi, đường, nước mắm","1","ít"],["Dưa leo, cà chua","1","ít"]],
    steps:["Ướp sườn với mật ong, tỏi, nước mắm 30 phút rồi nướng 180°C 20 phút.","Luộc thịt, tôm; thái mảnh làm bì trộn thính.","Chiên chả trứng mỏng, thái sợi.","Bào dưa leo, xếp tất cả lên cơm, chan nước mắm ngọt."],
    nutri:{p:35,c:58,f:20} },
  { id:"banh-mi-trung", name:"Bánh mì trứng op-la", emojis:["🥖","🍳"], grad:"linear-gradient(135deg,#F9A825,#C67A00)",
    time:15, diff:"Dễ", serve:1, kcal:380, meal:["morning"],
    desc:"Bữa sáng nhanh 15 phút: trứng ốp la béo mịn, patê, đồ chua trong ổ bánh mì giòn.",
    ing:[["Bánh mì","1","ổ"],["Trứng gà","2","trứng"],["Patê","1","muỗng"],["Đồ chua","1","ít"],["Ngò rí, tương ớt","1","ít"]],
    steps:["Đập trứng vào chảo dầu nóng, để lòng đỏ còn mềm.","Bẻ bánh mì, phết patê, nướng lại cho giòn.","Kẹp trứng, thêm đồ chua, ngò, tương ớt."],
    nutri:{p:16,c:42,f:14} },
  { id:"rau-cu-xao-toi", name:"Rau củ xào tỏi", emojis:["🥦","🧄"], grad:"linear-gradient(135deg,#2E7D32,#81C784)",
    time:15, diff:"Dễ", serve:2, kcal:180, meal:["dinner","lunch"],
    desc:"Đĩa rau xanh giòn ngọt, thơm mùi tỏi bơ — món ăn kèm nhẹ nhàng, lành mạnh.",
    ing:[["Cải ngọt / bông cải","300","g"],["Cà rốt","1","củ"],["Tỏi băm","3","nhánh"],["Dầu ăn (hoặc bơ)","1","muỗng canh"],["Nước mắm, tiêu","1","ít"]],
    steps:["Chần rau củ 1 phút qua nước sôi có chút muối, vớt ngâm nước lạnh.","Phi thơm tỏi, cho rau vào xào lửa lớn 2 phút.","Nêm nước mắm, tiêu, tắt bếp nhanh để rau giữ độ giòn."],
    nutri:{p:6,c:14,f:9} },
  { id:"canh-chua-ca", name:"Canh chua cá", emojis:["🐟","🍅"], grad:"linear-gradient(135deg,#00695C,#4DB6AC)",
    time:40, diff:"Trung bình", serve:4, kcal:250, meal:["dinner","lunch"],
    desc:"Canh chua miền Tây chua ngọt hài hoà với me, dứa, đậu bắp và cá lóc tươi.",
    ing:[["Cá lóc (cá quả)","1","con"],["Me chua","50","g"],["Dứa, cà chua","1","ít"],["Đậu bắp, bạc hà","200","g"],["Rau om, ngò gai","1","bó"],["Nước mắm, đường","1","ít"]],
    steps:["Nấu me với 1 lít nước, lọc lấy nước chua.","Cho dứa, cà chua vào đun sôi, nêm chua ngọt vừa miệng.","Thả cá cắt khúc, đun 5 phút, thêm đậu bắp, bạc hà.","Rắc rau om, ngò gai, tắt bếp, dùng nóng với cơm."],
    nutri:{p:24,c:16,f:8} },
  { id:"sup-bi-do", name:"Súp bí đỏ tôm", emojis:["🎃","🦐"], grad:"linear-gradient(135deg,#E65100,#FFA726)",
    time:25, diff:"Dễ", serve:3, kcal:160, meal:["morning","dinner"],
    desc:"Súp bí đỏ mịn ngọt tự nhiên, chút tôm tươi — nhẹ bụng, giàu vitamin A.",
    ing:[["Bí đỏ","400","g"],["Tôm băm","100","g"],["Sữa tươi (không đường)","100","ml"],["Hành khô","1","củ"],["Muối, tiêu","1","ít"]],
    steps:["Bí đỏ hấp chín, xay nhuyễn cùng 300ml nước.","Phi hành, xào tôm, đổ bí xay vào đun sôi.","Thêm sữa, nêm muối tiêu, khuấy nhẹ 2 phút."],
    nutri:{p:9,c:18,f:4} },
  { id:"bo-xao-hanh", name:"Bò xào hành tây", emojis:["🥩","🧅"], grad:"linear-gradient(135deg,#4E342E,#A1887F)",
    time:20, diff:"Dễ", serve:2, kcal:390, meal:["lunch","dinner"],
    desc:"Thịt bò mềm ngọt, hành tây giòn, sốt đậm đà — hoàn thành chỉ trong 20 phút.",
    ing:[["Thịt bò thăn","300","g"],["Hành tây","1","củ"],["Tỏi, gừng băm","1","ít"],["Dầu hào, nước tương","2","muỗng canh"],["Hành lá","2","nhánh"]],
    steps:["Thái bò mỏng, ướp dầu hào, tỏi gừng 10 phút.","Xào bò lửa lớn 2 phút tới chín tái, trút ra đĩa.","Xào hành tây 1 phút, trả bò vào, nêm lại, rắc hành lá."],
    nutri:{p:30,c:12,f:22} },
  { id:"chao-ga", name:"Cháo gà rau thơm", emojis:["🍲","🌿"], grad:"linear-gradient(135deg,#F57F17,#FFD54F)",
    time:35, diff:"Dễ", serve:3, kcal:280, meal:["morning"],
    desc:"Cháo gà nhuyễn mềm, ấm bụng cho buổi sáng — dễ tiêu, hợp cả trẻ nhỏ.",
    ing:[["Gạo tẻ","100","g"],["Ức gà","250","g"],["Gừng, hành khô","1","ít"],["Rau mùi, tiêu","1","ít"]],
    steps:["Ninh gạo với 1,2 lít nước 25 phút tới nở bung.","Luộc ức gà, xé sợi nhỏ, giữ nước luộc cho vào nồi.","Nêm muối, gừng băm; múc ra bát, rắc rau mùi, tiêu."],
    nutri:{p:22,c:36,f:6} },
  { id:"goi-bo-du-du", name:"Gỏi bò đu đủ", emojis:["🥗","🥕"], grad:"linear-gradient(135deg,#558B2F,#9CCC65)",
    time:20, diff:"Dễ", serve:3, kcal:220, meal:["lunch","dinner"],
    desc:"Gỏi thanh mát, chua cay the the của đu đủ xanh bào, thịt bò tài và rau răm.",
    ing:[["Thịt bò tài","200","g"],["Đu đủ xanh","300","g"],["Cà rốt","1","củ"],["Rau răm, đậu phộng","1","ít"],["Nước mắm chua ngọt","3","muỗng canh"]],
    steps:["Bào sợi đu đủ, cà rốt, ngâm nước muối loãng 10 phút, vắt khô.","Chần bò mỏng qua nước sôi, để nguội.","Trộn tất cả với nước mắm chua ngọt, rắc đậu phộng rang."],
    nutri:{p:20,c:14,f:11} },
];
const R = id => RECIPES.find(r => r.id === id);

const CATS = { meat:"Thịt & Cá", veg:"Rau củ", dairy:"Trứng & Sữa", spice:"Gia vị" };
const SHOP_CATS = { veg:"🥦 Rau củ & Trái cây", meat:"🥩 Thịt & Hải sản", dairy:"🥛 Sữa, Trứng & Đậu hũ", spice:"🧂 Gia vị & Khác" };

function emo(name) {
  const n = name.toLowerCase();
  const map = { "gà":"🍗", "bò":"🥩", "heo":"🥓", "cá":"🐟", "tôm":"🦐", "cua":"🦀", "trứng":"🥚", "sữa":"🥛", "cà rốt":"🥕", "cải":"🥬", "bông cải":"🥦", "hành":"🌿", "hành tây":"🧅", "tỏi":"🧄", "gừng":"🫚", "cà chua":"🍅", "bí":"🎃", "đu đủ":"🍈", "mật ong":"🍯", "nước mắm":"🫙", "dầu":"🫗", "gạo":"🍚", "cơm":"🍚", "mì":"🍜", "bánh mì":"🥖", "đậu hũ":"⬜", "rau":"🥬", "chanh":"🍋", "ớt":"🌶️", "me":"🟤", "dứa":"🍍", "sữa chua":"🥛", "phô mai":"🧈", "bơ":"🧈" };
  for (const k in map) if (n.includes(k)) return map[k];
  return "🥫";
}

/* ---------------- STATE ---------------- */
const KEY = "kv-demo-v1";
let S = null;

function seedState() {
  const today = new Date();
  const plus = d => d2s(new Date(today.getTime() + d * DAY));
  const fridge = [
    { id:1, name:"Ức gà", qty:500, unit:"g", cat:"meat", expiry:plus(2) },
    { id:2, name:"Thịt bò thăn", qty:300, unit:"g", cat:"meat", expiry:plus(1) },
    { id:3, name:"Cá lóc", qty:1, unit:"con", cat:"meat", expiry:plus(2) },
    { id:4, name:"Cải ngọt", qty:1, unit:"bó", cat:"veg", expiry:plus(2) },
    { id:5, name:"Cà rốt", qty:3, unit:"củ", cat:"veg", expiry:plus(6) },
    { id:6, name:"Cà chua", qty:4, unit:"quả", cat:"veg", expiry:plus(4) },
    { id:7, name:"Hành lá", qty:1, unit:"bó", cat:"veg", expiry:plus(3) },
    { id:8, name:"Trứng gà", qty:6, unit:"trứng", cat:"dairy", expiry:plus(9) },
    { id:9, name:"Sữa tươi không đường", qty:1, unit:"hộp", cat:"dairy", expiry:plus(5) },
    { id:10, name:"Đậu hũ", qty:2, unit:"miếng", cat:"dairy", expiry:plus(2) },
    { id:11, name:"Tỏi", qty:1, unit:"củ", cat:"spice", expiry:plus(20) },
    { id:12, name:"Gừng", qty:1, unit:"củ", cat:"spice", expiry:plus(25) },
    { id:13, name:"Nước mắm", qty:1, unit:"chai", cat:"spice", expiry:plus(90) },
    { id:14, name:"Mật ong", qty:1, unit:"hũ", cat:"spice", expiry:plus(120) },
  ];
  const shop = [
    { id:1, name:"Đùi gà", qty:"500g", price:72000, cat:"meat", done:false },
    { id:2, name:"Tôm tươi", qty:"300g", price:95000, cat:"meat", done:false },
    { id:3, name:"Bông cải xanh", qty:"1 bó", price:28000, cat:"veg", done:true },
    { id:4, name:"Đu đủ xanh", qty:"1 quả", price:18000, cat:"veg", done:false },
    { id:5, name:"Me chua", qty:"100g", price:12000, cat:"veg", done:false },
    { id:6, name:"Sữa chua Hy Lạp", qty:"2 hộp", price:56000, cat:"dairy", done:false },
    { id:7, name:"Dầu hào", qty:"1 chai", price:45000, cat:"spice", done:true },
    { id:8, name:"Thính làm bì", qty:"1 gói", price:15000, cat:"spice", done:false },
  ];
  // Lịch sử nấu 20 ngày qua để thống kê có dữ liệu
  const cooked = [];
  for (let d = 20; d >= 1; d--) {
    const n = 1 + Math.floor(Math.random() * 3);
    const pool = [...RECIPES].sort(() => Math.random() - .5).slice(0, n);
    pool.forEach(r => cooked.push({ r:r.id, date:plus(-d) }));
  }
  cooked.push({ r:"pho-bo", date:plus(0) }, { r:"rau-cu-xao-toi", date:plus(0) });

  return {
    user:null, onboarded:false,
    fridge, shop, cooked, weekOffset:0,
    plan:{},                       // { 'yyyy-mm-dd': {morning:id, lunch:id, dinner:id} }
    fridgeFilter:"all", serveN:2,
  };
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch { S = null; }
  if (!S) { S = seedState(); save(); }
}

/* ---------------- ĐIỀU HƯỚNG MÀN HÌNH ---------------- */
let navStack = [];
function showScreen(id, opts = {}) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  const el = $("#screen-" + id);
  el.classList.add("active");
  if (!opts.noPush && !["back"].includes(id)) navStack.push(id);
  const isApp = ["home","fridge","recipe","shopping","plan","stats"].includes(id);
  const isOnb = ["onb1","onb2","onb3"].includes(id);
  $("#topbar").style.display = (isApp || isOnb) ? "" : "none";
  $$(".topbar-nav button[data-goto]").forEach(b => b.classList.toggle("active", b.dataset.goto === id));
  if (id === "home") renderHome();
  if (id === "fridge") renderFridge();
  if (id === "plan") renderPlan();
  if (id === "stats") renderStats();
  if (id === "shopping") renderShop();
  window.scrollTo({ top: 0 });
}
function goBack() { navStack.pop(); const prev = navStack[navStack.length - 1] || "home"; showScreen(prev, { noPush:true }); }

document.addEventListener("click", e => {
  const nav = e.target.closest("[data-nav]");
  if (nav) {
    const v = nav.dataset.nav;
    if (v === "back") goBack();
    else if (v.startsWith("back-")) showScreen(v.slice(5));
    else showScreen(v);
    return;
  }
  const goto = e.target.closest("[data-goto]");
  if (goto) { goto.dataset.goto === "back" ? goBack() : showScreen(goto.dataset.goto); return; }
  const openR = e.target.closest("[data-open-recipe]");
  if (openR) openRecipe(openR.dataset.openRecipe);
  const close = e.target.closest("[data-close]");
  if (close) close.closest(".modal-overlay").classList.remove("open");
  if (e.target.classList.contains("modal-overlay")) e.target.classList.remove("open");
  if (e.target.closest("#goto-login")) toggleAuthMode(e);
});

/* ================= MÀN ĐĂNG KÝ / ĐĂNG NHẬP ================= */
let isLoginMode = false;

function toggleAuthMode(e) {
  if (e) e.preventDefault();
  isLoginMode = !isLoginMode;
  const title = $(".auth-form-wrap h3");
  const sub = $(".auth-sub");
  const submitBtn = $("#signup-form button[type=submit]");
  const nameField = $("#su-name").closest(".field");
  const pass2Field = $("#su-pass2").closest(".field");
  const termsRow = $(".check-row");
  const footerText = $(".auth-footer");
  const grid = $(".form-grid");

  if (isLoginMode) {
    title.textContent = "Đăng nhập tài khoản";
    sub.textContent = "Chào mừng bạn quay trở lại với Kitchen Vitality";
    submitBtn.textContent = "Đăng nhập";
    nameField.style.display = "none";
    pass2Field.style.display = "none";
    termsRow.style.display = "none";
    grid.style.gridTemplateColumns = "1fr";
    footerText.innerHTML = `Chưa có tài khoản? <a href="#" id="goto-login">Đăng ký ngay</a>`;
    if (!$("#su-email").value) $("#su-email").value = "minh@vidu.com";
    if (!$("#su-pass").value) $("#su-pass").value = "123456";
  } else {
    title.textContent = "Tạo tài khoản mới";
    sub.textContent = "Bắt đầu hành trình ẩm thực của bạn";
    submitBtn.textContent = "Đăng ký";
    nameField.style.display = "";
    pass2Field.style.display = "";
    termsRow.style.display = "";
    grid.style.gridTemplateColumns = "1fr 1fr";
    footerText.innerHTML = `Đã có tài khoản? <a href="#" id="goto-login">Đăng nhập</a>`;
  }
}

$("#signup-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = $("#su-email").value.trim(), p1 = $("#su-pass").value, err = $("#su-error");
  const fail = m => { err.textContent = m; err.hidden = false; };

  if (isLoginMode) {
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Email chưa hợp lệ.");
    if (p1.length < 6) return fail("Mật khẩu cần tối thiểu 6 ký tự.");
    err.hidden = true;
    const namePart = email.split("@")[0];
    const capName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    S.user = { name: (capName === "Minh" || capName === "Ban") ? "Nguyễn Văn Minh" : capName, email };
    S.onboarded = true;
    save();
    updateUserUI();
    showScreen("home");
    toast(`Đăng nhập thành công! Chào ${S.user.name.split(" ").pop()} 👋`);
    return;
  }

  const name = $("#su-name").value.trim(), p2 = $("#su-pass2").value;
  if (name.length < 2) return fail("Vui lòng nhập họ tên.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Email chưa hợp lệ.");
  if (p1.length < 6) return fail("Mật khẩu cần tối thiểu 6 ký tự.");
  if (p1 !== p2) return fail("Mật khẩu nhập lại chưa khớp.");
  if (!$("#su-terms").checked) return fail("Bạn cần đồng ý điều khoản để tiếp tục.");
  err.hidden = true;
  S.user = { name, email };
  save();
  updateUserUI();
  showScreen("onb1");
  toast("Tạo tài khoản thành công 🎉");
});

$("#btn-google").addEventListener("click", () => toast("Đăng nhập Google — chưa kết nối backend 🙂"));
$("#btn-facebook").addEventListener("click", () => toast("Đăng nhập Facebook — chưa kết nối backend 🙂"));

/* ================= ONBOARDING ================= */
const OB = { cuisines:[], spice:1, favs:[], goals:[], goalOther:"", eaters:"3-4 người", cooktime:"15-30 phút", allergies:[], diet:"Không", calo:2000, equip:[] };

function buildChips(sel, items, store, multi = true) {
  const box = $(sel);
  box.innerHTML = "";
  items.forEach(it => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = it;
    b.onclick = () => {
      if (!multi) { store.length = 0; store.push(it); $$(".chip", box).forEach(c => c.classList.remove("active")); b.classList.add("active"); return; }
      const i = store.indexOf(it);
      i > -1 ? store.splice(i, 1) : store.push(it);
      b.classList.toggle("active");
    };
    box.appendChild(b);
  });
}
buildChips("#q-cuisines", ["🇻🇳 Việt Nam","🥢 Á – Trung Hoa","🌶️ Thái Lan","🥘 Hàn Quốc","🍣 Nhật Bản","🍛 Ấn Độ","🍝 Ý","🥖 Pháp","🌮 Mexico","🫒 Địa Trung Hải"], OB.cuisines);
buildChips("#q-allergy", ["🥜 Đậu phộng","🦐 Tôm / Cua","🐟 Cá","🥛 Sữa","🥚 Trứng","🌾 Gluten","🫘 Đậu nành","🌰 Hạt khác","✅ Không có dị ứng"], OB.allergies);
buildChips("#q-equip", ["🔥 Bếp gas","⚡ Bếp từ","🍞 Lò nướng","🍟 Nồi chiên không dầu","🍚 Nồi cơm điện","💨 Nồi áp suất","🥤 Máy xay sinh tố"], OB.equip);

const GOALS = [
  { ic:"🥗", t:"Ăn kiêng giảm cân", d:"Giảm 0,5kg mỗi tuần" },
  { ic:"💪", t:"Tăng cơ", d:"Đạm cao, ít tinh bột" },
  { ic:"⚖️", t:"Duy trì cân nặng", d:"Cân bằng dinh dưỡng" },
  { ic:"🌿", t:"Ăn lành mạnh", d:"Ít dầu, nhiều rau" },
  { ic:"⏰", t:"Tiết kiệm thời gian", d:"Món dưới 30 phút" },
  { ic:"💰", t:"Tiết kiệm chi phí", d:"Nguyên liệu giá tốt" },
];
$("#q-goals").innerHTML = GOALS.map((g,i) => `
  <button type="button" class="goal-card" data-i="${i}">
    <div class="g-ic">${g.ic}</div><div class="g-t">${g.t}</div><div class="g-d">${g.d}</div>
  </button>`).join("");
$$("#q-goals .goal-card").forEach(b => b.onclick = () => {
  const g = GOALS[+b.dataset.i].t, i = OB.goals.indexOf(g);
  i > -1 ? OB.goals.splice(i,1) : OB.goals.push(g);
  b.classList.toggle("active");
});
$("#goal-other-input").addEventListener("input", e => OB.goalOther = e.target.value);

function bindSeg(sel, store, key) {
  $$(sel + " button").forEach(b => b.onclick = () => {
    $$(sel + " button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    OB[key] = b.dataset.v;
  });
}
bindSeg("#q-eaters", null, "eaters"); bindSeg("#q-cooktime", null, "cooktime"); bindSeg("#q-diet", null, "diet");

const spice = $("#q-spice");
spice.addEventListener("input", () => {
  OB.spice = +spice.value;
  $$(".spice-labels span").forEach(s => s.classList.toggle("active", +s.dataset.s === OB.spice));
});
$$(".spice-labels span")[1].classList.add("active");

const favInput = $("#fav-input"), favTags = $("#fav-tags");
favInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && favInput.value.trim()) {
    e.preventDefault();
    OB.favs.push(favInput.value.trim());
    favInput.value = "";
    renderFavs();
  }
});
function renderFavs() {
  favTags.innerHTML = OB.favs.map((f,i) => `<span class="tag">${f}<button data-i="${i}" aria-label="Xoá">×</button></span>`).join("");
  $$("#fav-tags button").forEach(b => b.onclick = () => { OB.favs.splice(+b.dataset.i,1); renderFavs(); });
}

const calo = $("#q-calo");
calo.addEventListener("input", () => { OB.calo = +calo.value; $("#calo-out").textContent = fmt(OB.calo) + " kcal"; });

$("#finish-onb").addEventListener("click", () => {
  S.profile = { ...OB };
  S.onboarded = true;
  save();
  showScreen("home");
  toast(`Hoàn tất hồ sơ! Chào ${S.user.name.split(" ").pop()} 🌿`);
});

/* ================= TRANG CHỦ ================= */
function greeting() {
  const h = new Date().getHours();
  return h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
}
function renderHome() {
  const name = S.user ? S.user.name.split(" ").pop() : "bạn";
  $("#hello-line").textContent = `${greeting()}, ${name}! 👋`;
  const d = new Date();
  $("#date-line").textContent = `${DAYS_VI[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;

  const exp = S.fridge.filter(i => daysLeft(i.expiry) <= 3);
  $("#fridge-brief").innerHTML = `
    <div class="mini-chip">📦 Còn <b>${S.fridge.length}</b> nguyên liệu</div>
    <div class="mini-chip ${exp.length ? "warn" : ""}">⏰ <b>${exp.length}</b> món sắp hết hạn</div>
    <div class="mini-chip">🍳 Nấu được <b>${cookable().length}</b> món</div>`;

  const soon = exp.map(i => i.name.toLowerCase()).join(", ") || "không có gì";
  $("#ai-suggest-text").innerHTML = exp.length
    ? `Hôm nay <b>${exp.map(i => i.name).join(", ")}</b> sắp hết hạn — món <b>Gà kho mật ong</b> vừa hợp khẩu vị vừa dùng hết nguyên liệu!`
    : `Tủ lạnh của bạn đang rất tươi 🌿 Thử món <b>bò xào hành tây</b> 20 phút cho bữa tối nay nhé!`;

  const q = ($("#home-search").value || "").toLowerCase().trim();
  ["morning","lunch","dinner"].forEach(slot => {
    const list = RECIPES.filter(r => r.meal.includes(slot) && (!q || r.name.toLowerCase().includes(q)));
    const box = $("#meal-" + slot).closest(".meal-block");
    box.style.display = list.length ? "" : "none";
    $("#meal-" + slot).innerHTML = list.map(r => cardHTML(r, matchPct(r))).join("");
    const kcal = list.reduce((a,r) => a + r.kcal, 0);
    box.querySelector(".kcal-tag").textContent = `~${fmt(kcal)} kcal tổng`;
  });
  $$("#meal-morning .recipe-card, #meal-lunch .recipe-card, #meal-dinner .recipe-card")
    .forEach(c => c.onclick = () => openRecipe(c.dataset.id));

  // Sidebar: kế hoạch hôm nay
  const t = d2s(new Date()), meals = S.plan[t] || {};
  $("#today-plan").innerHTML = ["morning","lunch","dinner"].map(slot => {
    const r = meals[slot] ? R(meals[slot]) : null;
    const slotName = { morning:"🌅 Sáng", lunch:"☀️ Trưa", dinner:"🌙 Tối" }[slot];
    return `<div class="today-meal-row"><span class="meal-slot">${slotName}</span><b>${r ? r.name : "—"}</b>${r ? `<span class="meal-kcal">${r.kcal} kcal</span>` : ""}</div>`;
  }).join("");
}
$("#home-search").addEventListener("input", renderHome);

function matchPct(r) {
  const need = r.ing.map(i => i[0].toLowerCase());
  const have = S.fridge.map(i => i.name.toLowerCase());
  const hit = need.filter(n => have.some(h => n.includes(h.split(" ")[0]) || h.includes(n.split(" ")[0]))).length;
  return Math.min(95, Math.round(45 + hit / need.length * 55));
}
function cardHTML(r, pct) {
  const cls = pct >= 80 ? "" : "mid";
  return `<div class="recipe-card" data-id="${r.id}">
    <div class="rc-img" style="background:${r.grad}">${r.emojis[0]}</div>
    <div class="rc-body">
      <span class="rc-match ${cls}">${pct}% khớp</span>
      <div class="rc-name">${r.name}</div>
      <div class="rc-meta"><span>⏱ ${r.time}′</span><span>🔥 ${r.kcal} kcal</span><span>📊 ${r.diff}</span></div>
    </div></div>`;
}
function cookable() { return RECIPES.filter(r => matchPct(r) >= 75); }

/* ================= TỦ LẠNH ================= */
$("#fridge-filter").addEventListener("click", e => {
  const b = e.target.closest(".fchip"); if (!b) return;
  $$("#fridge-filter .fchip").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  S.fridgeFilter = b.dataset.cat;
  renderFridge();
});
$("#open-add-item").addEventListener("click", openAddItem);
$("#nav-fab").addEventListener("click", openAddItem);
function openAddItem() {
  $("#ai-expiry").value = d2s(new Date(Date.now() + 3 * DAY));
  $("#ai-error").hidden = true;
  $("#modal-add-item").classList.add("open");
}
$("#ai-submit").addEventListener("click", () => {
  const name = $("#ai-name").value.trim(), err = $("#ai-error");
  if (name.length < 2) { err.textContent = "Nhập tên nguyên liệu."; err.hidden = false; return; }
  S.fridge.push({ id:Date.now(), name, qty:+$("#ai-qty").value || 1, unit:$("#ai-unit").value, cat:$("#ai-cat").value, expiry:$("#ai-expiry").value || d2s(new Date(Date.now()+3*DAY)) });
  save();
  $("#modal-add-item").classList.remove("open");
  $("#ai-name").value = "";
  showScreen("fridge", { noPush:true });
  toast(`Đã thêm ${name} vào tủ lạnh 🧊`);
});

function expBadge(iso) {
  const d = daysLeft(iso);
  if (d < 0) return `<span class="item-exp expired">Đã hết hạn</span>`;
  if (d === 0) return `<span class="item-exp soon">Hết hạn hôm nay</span>`;
  if (d <= 3) return `<span class="item-exp soon">Còn ${d} ngày</span>`;
  return `<span class="item-exp ok">Còn ${d} ngày</span>`;
}
function renderFridge() {
  const exp = S.fridge.filter(i => daysLeft(i.expiry) <= 3).sort((a,b) => daysLeft(a.expiry) - daysLeft(b.expiry));
  $("#fridge-stats").innerHTML = `
    <div class="stat-box"><b>${S.fridge.length}</b><span>Nguyên liệu</span></div>
    <div class="stat-box ${exp.length ? "warn" : ""}"><b>${exp.length}</b><span>Đến hạn ≤3 ngày</span></div>
    <div class="stat-box"><b>${cookable().length}</b><span>Món nấu được</span></div>`;

  const box = $("#expiring-box");
  if (!exp.length) { box.style.display = "none"; }
  else {
    box.style.display = "";
    $("#expiring-list").innerHTML = exp.map(i => `
      <div class="warn-item"><span class="w-emoji">${emo(i.name)}</span>
      <span class="w-name">${i.name}</span>
      <span class="w-count">${daysLeft(i.expiry) < 0 ? "Đã hết hạn!" : daysLeft(i.expiry) === 0 ? "Hôm nay" : daysLeft(i.expiry) + " ngày nữa"}</span></div>`).join("");
  }

  const f = S.fridgeFilter;
  const items = f === "all" ? S.fridge : S.fridge.filter(i => i.cat === f);
  const box2 = $("#fridge-list");
  if (!items.length) { box2.innerHTML = `<div class="empty-note">Không có nguyên liệu trong mục này.</div>`; return; }
  box2.innerHTML = Object.entries(CATS).filter(([c]) => items.some(i => i.cat === c)).map(([c, label]) => {
    const list = items.filter(i => i.cat === c);
    return `<div class="cat-title">${label} <span class="cnt">${list.length}</span></div>` +
      list.map(i => `
        <div class="item-row">
          <div class="item-emoji">${emo(i.name)}</div>
          <div class="item-info"><div class="item-name">${i.name}</div>
          <div class="item-qty">${fmt(i.qty)} ${i.unit} · ${CATS[i.cat]}</div></div>
          ${expBadge(i.expiry)}
          <button class="item-del" data-id="${i.id}" title="Xoá">🗑</button>
        </div>`).join("");
  }).join("");
  $$("#fridge-list .item-del").forEach(b => b.onclick = () => {
    S.fridge = S.fridge.filter(i => i.id !== +b.dataset.id);
    save(); renderFridge(); toast("Đã xoá khỏi tủ lạnh");
  });
}

/* ================= CHI TIẾT MÓN ĂN ================= */
let curRecipe = null;
function openRecipe(id) {
  curRecipe = R(id);
  if (!curRecipe) return;
  const r = curRecipe;
  S.serveN = r.serve;
  $("#recipe-hero").style.background = r.grad;
  $("#recipe-emojis").innerHTML = r.emojis.map(e => `<span>${e}</span>`).join("");
  $("#recipe-title").textContent = r.name;
  $("#recipe-desc").textContent = r.desc;
  $("#recipe-meta").innerHTML =
    `<span>⏱ ${r.time} phút</span><span>📊 ${r.diff}</span><span>🍽 ${r.serve} người</span><span>🔥 ${r.kcal} kcal</span>`;
  $("#recipe-save").innerHTML = (S.saved || []).includes(id) ? "❤️ Đã lưu" : "🤍 Lưu món";
  renderIngs(); renderSteps(); renderNutri();
  $$(".tab").forEach(t => t.classList.remove("active"));
  $('.tab[data-tab="ing"]').classList.add("active");
  $$(".tab-pane").forEach(p => p.classList.remove("active"));
  $("#tab-ing").classList.add("active");
  showScreen("recipe");
}
$$(".tab").forEach(t => t.onclick = () => {
  $$(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  $$(".tab-pane").forEach(p => p.classList.remove("active"));
  $("#tab-" + t.dataset.tab).classList.add("active");
});
function renderIngs() {
  const r = curRecipe, k = S.serveN / r.serve;
  $("#serve-count").textContent = S.serveN;
  $("#ing-list").innerHTML = r.ing.map((i, idx) => {
    const q = Math.round(i[1] * k * 10) / 10;
    return `<li><input type="checkbox" data-i="${idx}"><span>${i[0]}</span><span class="qty">${fmt(q)} ${i[2]}</span></li>`;
  }).join("");
  $$("#ing-list input").forEach(c => c.onchange = () => c.closest("li").classList.toggle("checked", c.checked));
}
$("#serve-minus").onclick = () => { if (S.serveN > 1) { S.serveN--; renderIngs(); } };
$("#serve-plus").onclick = () => { if (S.serveN < 12) { S.serveN++; renderIngs(); } };
function renderSteps() {
  $("#steps-list").innerHTML = curRecipe.steps.map(s => `<li>${s}</li>`).join("");
}
function renderNutri() {
  const n = curRecipe.nutri, total = n.p + n.c + n.f, max = { p:50, c:80, f:40 };
  $("#nutri-bars").innerHTML = [["p","Đạm (Protein)",n.p,max.p],["c","Tinh bột (Carbs)",n.c,max.c],["f","Chất béo (Fat)",n.f,max.f]]
    .map(([k,label,v,m]) => `<div class="nutri-row"><div class="nr-top"><span>${label}</span><span>${v}g · ${Math.round(v/total*100)}% năng lượng</span></div><div class="bar"><i style="width:${Math.min(100, v/m*100)}%"></i></div></div>`).join("");
}
$("#recipe-save").onclick = () => {
  S.saved = S.saved || [];
  const i = S.saved.indexOf(curRecipe.id);
  i > -1 ? S.saved.splice(i,1) : S.saved.push(curRecipe.id);
  save();
  $("#recipe-save").innerHTML = i > -1 ? "🤍 Lưu món" : "❤️ Đã lưu";
  toast(i > -1 ? "Đã bỏ lưu món" : "Đã lưu vào món yêu thích ❤️");
};
$("#recipe-share").onclick = () => toast("Đã copy link món ăn (demo) 🔗");
$("#recipe-to-plan").onclick = () => openAddMeal(curRecipe.id);
$("#cook-now").onclick = () => {
  S.cooked.push({ r:curRecipe.id, date:d2s(new Date()) });
  save();
  toast(`Nấu ngon miệng nhé! Đã ghi nhận 🍳 ${curRecipe.name}`);
  goBack();
};

/* ================= MUA SẮM ================= */
function renderShop() {
  const done = S.shop.filter(i => i.done).length, total = S.shop.length;
  $("#shop-count").textContent = `${done}/${total}`;
  $("#shop-progress-text").textContent = `${done}/${total} món đã mua`;
  const pct = total ? Math.round(done / total * 100) : 0;
  $("#shop-percent").textContent = pct + "%";
  $("#shop-progress-bar").style.width = pct + "%";

  const remain = S.shop.filter(i => !i.done);
  const sum = remain.reduce((a,i) => a + i.price, 0);
  $("#shop-total").textContent = fmt(sum) + "đ";

  $("#shop-list").innerHTML = Object.entries(SHOP_CATS).map(([c,label]) => {
    const list = S.shop.filter(i => i.cat === c);
    if (!list.length) return "";
    return `<div class="cat-title">${label} <span class="cnt">${list.length}</span></div>` +
      list.map(i => `
        <div class="shop-item">
          <input type="checkbox" ${i.done ? "checked" : ""} data-id="${i.id}">
          <div class="shop-info"><div class="shop-name ${i.done ? "done" : ""}">${i.name}</div>
          <div class="shop-sub">${i.qty}</div></div>
          <span class="shop-price">${fmt(i.price)}đ</span>
          <button class="item-del" data-id="${i.id}" title="Xoá">🗑</button>
        </div>`).join("");
  }).join("");

  $$("#shop-list input[type=checkbox]").forEach(c => c.onchange = () => {
    const it = S.shop.find(i => i.id === +c.dataset.id);
    it.done = c.checked; save(); renderShop();
  });
  $$("#shop-list .item-del").forEach(b => b.onclick = () => {
    S.shop = S.shop.filter(i => i.id !== +b.dataset.id); save(); renderShop(); toast("Đã xoá khỏi danh sách");
  });
}
$("#shop-add").addEventListener("click", addShop);
$("#shop-input").addEventListener("keydown", e => { if (e.key === "Enter") addShop(); });
function addShop() {
  const v = $("#shop-input").value.trim();
  if (!v) return;
  S.shop.push({ id:Date.now(), name:v.charAt(0).toUpperCase() + v.slice(1), qty:"1 phần", price:30000, cat:"spice", done:false });
  save(); $("#shop-input").value = ""; renderShop(); toast("Đã thêm vào danh sách 🛒");
}
$("#shop-clear").addEventListener("click", () => {
  const n = S.shop.filter(i => i.done).length;
  if (!n) return toast("Chưa có món nào được mua.");
  S.shop = S.shop.filter(i => !i.done); save(); renderShop(); toast(`Đã dọn ${n} món đã mua 🧹`);
});

/* ================= KẾ HOẠCH TUẦN ================= */
function weekDays(offset = S.weekOffset) {
  const now = new Date();
  const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length:7 }, (_,i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    return d;
  });
}
function renderPlan() {
  const days = weekDays();
  const f = d => `${d.getDate()}/${d.getMonth()+1}`;
  $("#week-label").textContent = `Tuần ${f(days[0])} – ${f(days[6])}`;

  const today = d2s(new Date());
  const weekPlan = days.map(d => ({ d, key:d2s(d), meals:S.plan[d2s(d)] || {} }));
  const nMeals = weekPlan.reduce((a,x) => a + Object.keys(x.meals).length, 0);
  const kcal = weekPlan.reduce((a,x) => a + Object.values(x.meals).reduce((s,id) => s + (R(id)?.kcal || 0), 0), 0);
  $("#plan-summary").innerHTML = `
    <div class="stat-box"><b>${nMeals}/21</b><span>Bữa đã lên kế hoạch</span></div>
    <div class="stat-box"><b>${nMeals ? fmt(Math.round(kcal / Math.max(1, weekPlan.filter(x=>Object.keys(x.meals).length).length))) : 0}</b><span>kcal TB / ngày có kế hoạch</span></div>`;

  $("#plan-days").innerHTML = weekPlan.map(({ d, key, meals }) => `
    <div class="day-card ${key === today ? "today" : ""}">
      <div class="day-head">
        <h4>${DAYS_VI[d.getDay()]}<small style="color:var(--text-2);font-weight:600"> · ${f(d)}</small>${key === today ? '<span class="today-pill">HÔM NAY</span>' : ""}</h4>
        <span class="day-kcal">${fmt(Object.values(meals).reduce((s,id) => s + (R(id)?.kcal || 0), 0))} kcal</span>
      </div>
      ${["morning","lunch","dinner"].map(slot => meals[slot] ? `
        <div class="meal-row">
          <span class="meal-slot">${{morning:"🌅 Sáng",lunch:"☀️ Trưa",dinner:"🌙 Tối"}[slot]}</span>
          <span class="meal-name" data-open-recipe="${meals[slot]}">${R(meals[slot]).emojis[0]} ${R(meals[slot]).name}</span>
          <span class="meal-kcal">${R(meals[slot]).kcal} kcal</span>
          <button class="meal-x" data-day="${key}" data-slot="${slot}" title="Xoá bữa">✕</button>
        </div>` : "").join("")}
      <button class="add-meal-btn" data-add-day="${key}">＋ Thêm bữa ăn</button>
    </div>`).join("");

  $$("#plan-days .meal-x").forEach(b => b.onclick = () => {
    delete S.plan[b.dataset.day][b.dataset.slot];
    save(); renderPlan(); toast("Đã xoá bữa ăn khỏi kế hoạch");
  });
  $$("#plan-days .add-meal-btn").forEach(b => b.onclick = () => openAddMeal(null, b.dataset.addDay));
}
$("#week-prev").onclick = () => { S.weekOffset--; save(); renderPlan(); };
$("#week-next").onclick = () => { S.weekOffset++; save(); renderPlan(); };
$("#plan-ai").addEventListener("click", () => {
  const days = weekDays();
  let added = 0;
  days.forEach(d => {
    const key = d2s(d);
    S.plan[key] = S.plan[key] || {};
    ["morning","lunch","dinner"].forEach(slot => {
      if (S.plan[key][slot]) return;
      const pool = RECIPES.filter(r => r.meal.includes(slot));
      S.plan[key][slot] = pool[Math.floor(Math.random() * pool.length)].id;
      added++;
    });
  });
  save(); renderPlan();
  toast(added ? `✨ AI đã lên kế hoạch ${added} bữa trong tuần!` : "Kế hoạch tuần đã đầy đủ ✨");
});

function openAddMeal(recipeId, presetDay) {
  const days = weekDays();
  $("#am-day").innerHTML = days.map(d => {
    const key = d2s(d);
    return `<option value="${key}" ${key === (presetDay || d2s(new Date())) ? "selected" : ""}>${DAYS_VI[d.getDay()]} · ${d.getDate()}/${d.getMonth()+1}</option>`;
  }).join("");
  $("#am-recipe").innerHTML = RECIPES.map(r => `<option value="${r.id}" ${r.id === recipeId ? "selected" : ""}>${r.emojis[0]} ${r.name}</option>`).join("");
  $("#modal-add-meal").classList.add("open");
}
$("#am-submit").addEventListener("click", () => {
  const day = $("#am-day").value, slot = $("#am-slot").value, rid = $("#am-recipe").value;
  S.plan[day] = S.plan[day] || {};
  S.plan[day][slot] = rid;
  save();
  $("#modal-add-meal").classList.remove("open");
  showScreen("plan", { noPush:true });
  toast(`Đã thêm ${R(rid).name} vào kế hoạch 📅`);
});

/* ================= THỐNG KÊ ================= */
let statsPeriod = "week";
$("#stats-period").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  $$("#stats-period button").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  statsPeriod = b.dataset.v;
  renderStats();
});

function kcalByDay() {
  const m = {};
  S.cooked.forEach(c => { m[c.date] = (m[c.date] || 0) + (R(c.r)?.kcal || 0); });
  return m;
}
function renderStats() {
  const kcalMap = kcalByDay();
  const now = new Date();
  let cookedCount, labels, kcalSeries, days;

  if (statsPeriod === "week") {
    const SHORT_VI = ["CN","T2","T3","T4","T5","T6","T7"];
    days = weekDays(0).map(d => d2s(d));
    labels = days.map(k => SHORT_VI[new Date(k + "T00:00:00").getDay()]);
    kcalSeries = days.map(k => kcalMap[k] || Math.round(1400 + Math.random() * 400));
    cookedCount = S.cooked.filter(c => days.includes(c.date)).length;
  } else if (statsPeriod === "month") {
    labels = ["T1","T2","T3","T4"];
    days = 30;
    cookedCount = S.cooked.filter(c => (now - new Date(c.date + "T00:00:00")) / DAY <= 30).length;
    kcalSeries = labels.map(() => Math.round(1600 + Math.random() * 500));
  } else {
    labels = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
    days = 365;
    cookedCount = Math.round(S.cooked.length * 365 / 21);
    kcalSeries = labels.map(() => Math.round(1700 + Math.random() * 400));
  }

  const avgKcal = Math.round(kcalSeries.reduce((a,b) => a + b, 0) / kcalSeries.length);
  const spend = cookedCount * 38000;
  $("#kpi-grid").innerHTML = `
    <div class="kpi good"><span class="k-ic">🍳</span><b>${cookedCount}</b><span>món đã nấu</span></div>
    <div class="kpi good"><span class="k-ic">🥕</span><b>${cookedCount * 4}</b><span>nguyên liệu đã dùng</span></div>
    <div class="kpi warn"><span class="k-ic">🔥</span><b>${fmt(avgKcal)}<small> kcal</small></b><span>trung bình / ngày</span></div>
    <div class="kpi"><span class="k-ic">💰</span><b>${spend >= 1e6 ? (spend/1e6).toFixed(1).replace(".",",") + "tr" : fmt(spend)}<small> đ</small></b><span>chi tiêu nguyên liệu</span></div>`;

  drawLine(kcalSeries, labels);

  // Cột: món nấu theo tuần (6 tuần gần nhất)
  const barData = Array.from({ length:6 }, (_,i) => {
    const off = -(5 - i);
    const ws = weekDays(off);
    return S.cooked.filter(c => ws.some(d => d2s(d) === c.date)).length;
  });
  const maxBar = Math.max(...barData, 1);
  $("#bar-chart").innerHTML = barData.map((v,i) => `
    <div class="bar-col"><b style="font-size:11px;color:var(--text-2)">${v}</b>
    <i style="height:${Math.round(v / maxBar * 78)}%"></i><em>T${i+1}</em></div>`).join("");

  // Donut dinh dưỡng
  const segs = [["Đạm",30,"#006633"],["Tinh bột",45,"#FFB300"],["Chất béo",25,"#EF6C00"]];
  const C = 2 * Math.PI * 46;
  let acc = 0;
  $("#donut").innerHTML = segs.map(([l,v,c]) => {
    const dash = `${v / 100 * C - 3} ${C}`, off = -acc / 100 * C;
    acc += v;
    return `<circle cx="60" cy="60" r="46" stroke="${c}" stroke-dasharray="${dash}" stroke-dashoffset="${off}"></circle>`;
  }).join("");
  $("#donut-legend").innerHTML = segs.map(([l,v,c]) => `<span><i style="background:${c}"></i>${l} · ${v}%</span>`).join("");

  // Badge
  const badges = [
    { ic:"👨‍🍳", t:"Đầu bếp tập sự", got:cookedCount >= 3 },
    { ic:"🔥", t:"7 ngày liên tiếp", got:cookedCount >= 7 },
    { ic:"🥗", t:"Ăn lành mạnh", got:true },
    { ic:"🍜", t:"Bậc thầy mì sợi", got:false },
    { ic:"💰", t:"Tiết kiệm 500k", got:spend > 500000 },
  ];
  $("#badges").innerHTML = badges.map(b => `<div class="badge-tile ${b.got ? "" : "locked"}"><div class="b-ic">${b.ic}</div><span>${b.t}</span></div>`).join("");

  // Top món
  const cnt = {};
  S.cooked.forEach(c => cnt[c.r] = (cnt[c.r] || 0) + 1);
  const top = Object.entries(cnt).sort((a,b) => b[1] - a[1]).slice(0,4);
  $("#top-dishes").innerHTML = (top.length ? top : [["rau-cu-xao-toi",1]]).map(([id,n]) => `
    <div class="top-row"><div class="top-emoji">${R(id).emojis[0]}</div><div class="top-name">${R(id).name}</div><span class="top-cnt">×${n} lần</span></div>`).join("");
}

function drawLine(series, labels) {
  const W = 340, H = 150, pad = 8;
  const max = Math.max(...series), min = Math.min(...series);
  const x = i => pad + i * (W - pad * 2) / (series.length - 1);
  const y = v => H - 14 - (v - min) / Math.max(1, max - min) * (H - 40);
  const pts = series.map((v,i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const svg = $("#line-chart");
  svg.innerHTML = `
    <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2E9E5B" stop-opacity=".35"/>
      <stop offset="100%" stop-color="#2E9E5B" stop-opacity="0"/>
    </linearGradient></defs>
    ${[0.25,0.5,0.75].map(p => `<line class="grid-line" x1="0" x2="${W}" y1="${H*p}" y2="${H*p}"/>`).join("")}
    <polygon class="area" points="${pad},${H} ${pts.join(" ")} ${W-pad},${H}"/>
    <polyline class="ln" points="${pts.join(" ")}"/>
    ${pts.map((p,i) => `<circle class="dot" cx="${p.split(",")[0]}" cy="${p.split(",")[1]}" r="3.5"><title>${labels[i]}: ${fmt(series[i])} kcal</title></circle>`).join("")}`;
  $("#line-x-labels").innerHTML = labels.map(l => `<span>${l}</span>`).join("");
}

/* ================= USER MENU & ĐĂNG XUẤT ================= */
function updateUserUI() {
  if (!S.user) return;
  const first = S.user.name.split(" ").pop();
  $("#user-avatar").textContent = first.charAt(0).toUpperCase();
  $("#ud-name").textContent = S.user.name;
  $("#ud-email").textContent = S.user.email;
  $$(".avatar:not(#user-avatar), .avatar.big").forEach(a => a.textContent = first.charAt(0).toUpperCase());
}

function openProfileModal() {
  $("#user-dropdown").classList.remove("open");
  if (!S.user) return;
  const first = S.user.name.split(" ").pop();
  $("#pm-avatar").textContent = first.charAt(0).toUpperCase();
  $("#pm-name").textContent = S.user.name;
  $("#pm-email").textContent = S.user.email;
  $("#pm-diet").textContent = (S.profile && S.profile.diet) ? S.profile.diet : "Không";
  $("#pm-calo").textContent = (S.profile && S.profile.calo) ? fmt(S.profile.calo) + " kcal" : "2.000 kcal";
  $("#pm-fridge-count").textContent = (S.fridge ? S.fridge.length : 0) + " món";
  $("#modal-profile").classList.add("open");
}

function logoutUser() {
  localStorage.removeItem(KEY);
  S = seedState();
  save();
  navStack = [];
  $("#user-dropdown").classList.remove("open");
  const pm = $("#modal-profile");
  if (pm) pm.classList.remove("open");
  showScreen("auth", { noPush: true });
  toast("Đã đăng xuất thành công. Hẹn gặp lại! 👋");
}

function resetUserData() {
  localStorage.removeItem(KEY);
  S = seedState();
  save();
  navStack = [];
  $("#user-dropdown").classList.remove("open");
  const pm = $("#modal-profile");
  if (pm) pm.classList.remove("open");
  showScreen("auth", { noPush: true });
  toast("Đã đặt lại toàn bộ dữ liệu 🔄");
}

$("#user-avatar").addEventListener("click", e => {
  e.stopPropagation();
  $("#user-dropdown").classList.toggle("open");
});

document.addEventListener("click", e => {
  if (!e.target.closest("#user-menu")) $("#user-dropdown").classList.remove("open");
  if (e.target.closest(".avatar.big")) openProfileModal();
});

$("#ud-logout").addEventListener("click", logoutUser);
$("#pm-logout").addEventListener("click", logoutUser);

$("#ud-reset").addEventListener("click", resetUserData);
$("#pm-reset").addEventListener("click", resetUserData);

$("#ud-profile").addEventListener("click", openProfileModal);

/* ================= KHỞI ĐỘNG ================= */
load();
updateUserUI();
if (S.onboarded && S.user) showScreen("home", { noPush:true });
else if (S.user) showScreen("onb1", { noPush:true });
else showScreen("auth", { noPush:true });

// Mặc định mở sẵn vài bữa trong tuần nếu kế hoạch trống
if (!Object.keys(S.plan).length) {
  const days = weekDays(0), t = d2s(new Date());
  const ti = days.findIndex(d => d2s(d) === t);
  S.plan[t] = { morning:"pho-bo", dinner:"ga-kho-mat-ong" };
  if (ti < 6) S.plan[d2s(days[ti+1])] = { lunch:"com-tam-suon", dinner:"canh-chua-ca" };
  save();
}
