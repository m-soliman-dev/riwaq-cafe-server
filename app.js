"use strict";
/* RIWAQ CAFÉ (server version): Supabase backend, see server.js */
const KEY = "riwaq_srv";
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const EGP = n => Number(n).toLocaleString("en-US") + " EGP";
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
let S = load();
function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.products) return d; } catch (e) {}
  const d = JSON.parse(JSON.stringify(SEED)); d.orders = []; d.bookings = []; d.requests = []; d.messages = []; d.seq = 1000; return d;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("المساحة امتلأت، قلل حجم الصور"); } }
let cart = JSON.parse(sessionStorage.getItem("riwaq_cart") || "[]");
function saveCart() { sessionStorage.setItem("riwaq_cart", JSON.stringify(cart)); $("#cartcount").textContent = cart.reduce((a, c) => a + c.qty, 0); }
function toast(m) { const t = $("#toast"); t.textContent = m; t.className = "show"; setTimeout(() => t.className = "", 2200); }
const SV=(d,x="")=>`<svg viewBox="0 0 64 64" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${x}</svg>`;
const I={
 cup:SV('<path d="M12 26h34v10a16 16 0 0 1-16 16h-2a16 16 0 0 1-16-16z"/><path d="M46 29h4a6 6 0 0 1 0 12h-5"/><path d="M8 56h42"/><path d="M22 8c-3 4 3 6 0 10M32 8c-3 4 3 6 0 10M42 8c-3 4 3 6 0 10"/>'),
 iced:SV('<path d="M16 20h32l-4 36H20z"/><path d="M13 20h38"/><path d="M36 20l6-12"/><rect x="23" y="30" width="9" height="9" rx="2"/><rect x="33" y="40" width="9" height="9" rx="2"/>'),
 leaf:SV('<path d="M12 52C10 28 26 12 52 12c0 26-16 42-40 40z"/><path d="M12 52L38 26"/>'),
 cake:SV('<path d="M8 50h48V34L32 18 8 34z"/><path d="M8 42h48"/><circle cx="32" cy="12" r="3"/>'),
 sand:SV('<path d="M8 28c0-10 10-16 24-16s24 6 24 16z"/><path d="M8 36h48M10 44c4 4 8-4 12 0s8-4 12 0 8-4 12 0M10 52h44"/>'),
 cart:SV('<path d="M6 10h8l7 30h30l6-22H16"/><circle cx="26" cy="52" r="4"/><circle cx="46" cy="52" r="4"/>'),
 pin:SV('<path d="M32 58C20 44 14 36 14 26a18 18 0 0 1 36 0c0 10-6 18-18 32z"/><circle cx="32" cy="26" r="6"/>'),
 clock:SV('<circle cx="32" cy="32" r="24"/><path d="M32 18v15l10 6"/>'),
 phone:SV('<path d="M14 8h10l4 12-6 4c4 8 8 12 16 16l4-6 12 4v10c0 4-4 6-8 6C28 54 10 36 8 16c0-4 2-8 6-8z"/>'),
 check:SV('<circle cx="32" cy="32" r="26"/><path d="M20 33l9 9 16-18"/>'),
 laptop:SV('<rect x="12" y="14" width="40" height="28" rx="3"/><path d="M6 50h52"/>'),
 users:SV('<circle cx="24" cy="22" r="8"/><path d="M8 52c0-10 7-16 16-16s16 6 16 16"/><circle cx="46" cy="24" r="6"/><path d="M46 36c8 0 12 6 12 14"/>'),
 couch:SV('<path d="M10 30V20a6 6 0 0 1 6-6h32a6 6 0 0 1 6 6v10"/><path d="M6 34a4 4 0 0 1 8 0v8h36v-8a4 4 0 0 1 8 0v14H6z"/><path d="M12 54v4M52 54v4"/>'),
 music:SV('<path d="M24 46V12l28-6v34"/><circle cx="16" cy="46" r="8"/><circle cx="44" cy="40" r="8"/>'),
 mail:SV('<rect x="6" y="12" width="52" height="40" rx="4"/><path d="M8 16l24 20 24-20"/>')
};
const CATI={hot:I.cup,cold:I.iced,other:I.leaf,dessert:I.cake,snack:I.sand};
const COLORS = { hot: ["#3b2a20", "#b88a3e"], cold: ["#2B211C", "#87917B"], other: ["#4a5a3f", "#87917B"], dessert: ["#4a2c20", "#D4A85F"], snack: ["#3b2a20", "#87917B"] };
const ICON = CATI;
function ph(p, big) {
  const c = COLORS[p.cat] || COLORS.hot;
  return `<div class="ph" style="--c1:${c[0]};--c2:${c[1]}">${p.image ? `<img src="${p.image}" alt="${esc(p.name)}" loading="lazy">` : (ICON[p.cat] || I.cup)}${p.popular ? '<span class="badge">الأكثر طلباً</span>' : ""}${!p.available ? '<span class="badge off">غير متاح</span>' : ""}</div>`;
}
const isDrink = p => ["hot", "cold", "other"].includes(p.cat);
const catName = id => (S.categories.find(c => c.id === id) || {}).name || id;
const STAT = ["جديد", "تم التأكيد", "قيد التحضير", "جاهز للاستلام", "خرج للتوصيل", "مكتمل", "ملغي"];
const statCls = s => s === "مكتمل" ? "s-done" : s === "ملغي" ? "s-cancel" : s === "جديد" ? "s-new" : "";

/* ---------- Router ---------- */
const routes = { "": home, menu, product, offers, about, gallery, booking, order, events, contact, faq, privacy, terms, admin, track };
function route() {
  const h = location.hash.replace(/^#\/?/, ""); const [name, ...rest] = h.split("/");
  (routes[name] || home)(rest.join("/"));
  $("#nav").classList.remove("open");
  document.querySelectorAll("nav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#/" + name || (name === "" && a.getAttribute("href") === "#/")));
  window.scrollTo(0, 0); footer(); seo(name);
}
function seo(n) {
  const t = { menu: "المنيو", offers: "العروض", about: "من نحن", gallery: "معرض الصور", booking: "حجز طاولة", order: "اطلب أونلاين", events: "الفعاليات", contact: "تواصل معنا", faq: "الأسئلة الشائعة", privacy: "سياسة الخصوصية", terms: "الشروط والأحكام", admin: "لوحة التحكم" }[n];
  document.title = (t ? t + " | " : "") + "رِواق كافيه | RIWAQ CAFÉ";
}
const app = html => { $("#app").innerHTML = html; };
const phead = (t, s, bg) => `<div class="pagehero ${bg ? "pbg" : ""}" ${bg ? `style="background-image:url('${bg}')"` : ""}><h1>${t}</h1>${s ? `<p>${s}</p>` : ""}</div>`;
function wa(msg) { return `https://wa.me/${S.settings.whatsapp}?text=${encodeURIComponent(msg || "أهلاً رِواق كافيه")}`; }

/* ---------- Pages ---------- */
function productCard(p) {
  return `<article class="card">${ph(p)}<div class="b"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="row"><span class="price">${EGP(p.price)}</span><a class="btn sm" href="#/product/${p.id}">${p.available ? "اطلب" : "التفاصيل"}</a></div></div></article>`;
}
function home() {
  const s = S.settings, pop = S.products.filter(p => p.popular && p.available).slice(0, 8);
  const tiles = [["hot", "latte"], ["cold", "iced"], ["dessert", "cake"], ["snack", "sandwich"], ["other", "matcha"]];
  app(`<section class="hero ${s.heroImage ? "img" : ""}" ${s.heroImage ? `style="background-image:url('${s.heroImage}')"` : ""}>
  <div class="in"><img class="hlogo" src="img/logo.png" alt="RIWAQ CAFÉ"><div class="tag">SPECIALTY COFFEE · الشيخ زايد</div><h1>${esc(s.heroTitle)}</h1><p>${esc(s.heroText)}</p>
  <div class="cta"><a class="btn" href="#/menu">شوف المنيو</a><a class="btn alt" href="#/booking">احجز طاولة</a><a class="btn alt" href="#/order">اطلب أونلاين</a></div></div>${s.heroImage ? "" : `<div class="cup">${I.cup}</div>`}</section>
  <div class="wrap"><div class="info-strip"><div><b>${I.pin} العنوان</b>${esc(s.address)}</div><div><b>${I.clock} مواعيد العمل</b>${s.hours.map(esc).join("<br>")}</div><div><b>${I.phone} تواصل</b><span dir="ltr">${esc(s.phone)}</span></div></div>
  <div class="feats">${[[I.cup, "قهوة مختصة", "حبوب مختارة ومحمّصة بعناية"], [I.laptop, "للشغل والمذاكرة", "هدوء وإنترنت وأماكن مريحة"], [I.clock, "كل يوم 8ص حتى 12م", "الخميس والجمعة حتى 1ص"], [I.pin, "توصيل في الشيخ زايد", "أو استلام من الفرع"]].map(f => `<div class="feat">${f[0]}<div><b>${f[1]}</b><span>${f[2]}</span></div></div>`).join("")}</div>
  <div class="sec-h"><div><h2>اختار مزاجك</h2><p class="sub">قهوة، حلويات، وجبات خفيفة</p></div><a href="#/menu">كل المنيو ←</a></div>
  <div class="tiles">${tiles.map(t => `<a class="tile" href="#/menu" data-cat="${t[0]}" style="background-image:url('img/${t[1]}.jpg')"><span>${esc(catName(t[0]))}</span></a>`).join("")}</div>
  <div class="split"><img src="img/interior.jpg" alt="داخل رِواق كافيه" loading="lazy"><div><span class="tag2">عن رِواق</span><h2>مش مجرد مكان لشرب القهوة</h2><p>مساحة بتجمع القهوة المختصة والأجواء الهادئة. تيجي تشتغل، تذاكر، تقابل صحابك، أو تاخد قهوتك الصبح وتمشي.</p><ul class="ticks"><li>قهوة مختصة من حبوب مختارة</li><li>أماكن هادئة للشغل والمذاكرة</li><li>حجز مسبق للجلسات واللقاءات</li></ul><a class="btn" href="#/about">اعرف أكتر</a></div></div>
  <div class="sec-h"><div><h2>الأكثر طلباً</h2><p class="sub">اللي ضيوفنا بيرجعوا يطلبوه</p></div><a href="#/menu">كل المنيو ←</a></div>
  <div class="grid">${pop.map(productCard).join("")}</div>
  <div class="split rev"><img src="img/lounge.jpg" alt="جلسة هادئة" loading="lazy"><div><span class="tag2">للشغل واللقاءات</span><h2>احجز طاولتك قبل ما توصل</h2><p>اختار اليوم والوقت وعدد الأشخاص، وهنأكد معاك على الواتساب.</p><a class="btn" href="#/booking">احجز طاولة</a> <a class="btn alt dk" href="#/events">الفعاليات</a></div></div>
  <div class="sec-h"><div><h2>العروض</h2></div><a href="#/offers">كل العروض ←</a></div>
  <div class="grid">${S.offers.slice(0, 3).map(o => `<div class="box offer"><span class="status">${esc(o.tag)}</span><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p></div>`).join("")}</div>
  <div class="cta-banner" style="background-image:url('img/takeaway.jpg')"><h2>قهوتك جاهزة قبل ما توصل</h2><p>اطلب أونلاين واستلم من الفرع أو على باب بيتك.</p><a class="btn" href="#/order">اطلب دلوقتي</a> <a class="btn alt" href="#/menu">شوف المنيو</a></div></div>`);
}
let mq = { q: "", cat: "all", sort: "pop" };
function menu() {
  app(`${phead("المنيو", "كل المشروبات والأكلات بالأسعار بالجنيه", "img/menu.jpg")}<div class="wrap">
  <div class="tools"><input id="q" type="search" placeholder="ابحث عن منتج..." value="${esc(mq.q)}"><select id="sort"><option value="pop">الأكثر طلباً</option><option value="lo">السعر: الأقل</option><option value="hi">السعر: الأعلى</option><option value="az">الاسم</option></select></div>
  <div class="chips" id="chips"></div><div class="grid" id="list"></div></div>`);
  $("#sort").value = mq.sort;
  const draw = () => {
    $("#chips").innerHTML = [{ id: "all", name: "الكل" }, ...S.categories].map(c => `<button class="chip ${mq.cat === c.id ? "on" : ""}" data-c="${c.id}">${esc(c.name)}</button>`).join("");
    let l = S.products.filter(p => (mq.cat === "all" || p.cat === mq.cat) && (p.name + p.desc).toLowerCase().includes(mq.q.toLowerCase()));
    l.sort({ pop: (a, b) => b.popular - a.popular, lo: (a, b) => a.price - b.price, hi: (a, b) => b.price - a.price, az: (a, b) => a.name.localeCompare(b.name) }[mq.sort]);
    $("#list").innerHTML = l.map(productCard).join("") || '<p class="sub">مفيش نتائج.</p>';
    document.querySelectorAll(".chip").forEach(b => b.onclick = () => { mq.cat = b.dataset.c; draw(); });
  };
  $("#q").oninput = e => { mq.q = e.target.value; draw(); }; $("#sort").onchange = e => { mq.sort = e.target.value; draw(); }; draw();
}
function product(id) {
  const p = S.products.find(x => x.id === id); if (!p) return menu();
  const d = isDrink(p);
  app(`${phead(esc(p.name), catName(p.cat))}<div class="wrap"><div class="cols"><div class="card">${ph(p)}</div><div class="box"><h2 dir="ltr" style="text-align:start">${esc(p.name)}</h2><p class="sub">${esc(p.desc)}</p><div class="price" id="pp">${EGP(p.price)}</div>
  <form id="pf" class="f" style="margin-top:14px">
   ${d ? `<label>الحجم<div class="opts">${S.sizes.map((z, i) => `<label><input type="radio" name="size" value="${i}" ${i === 1 ? "checked" : ""}>${esc(z.n)}${z.add ? ` (+${z.add})` : ""}</label>`).join("")}</div></label>
   <label>الإضافات<div class="opts">${S.extras.map((z, i) => `<label><input type="checkbox" name="ex" value="${i}">${esc(z.n)} (+${z.add})</label>`).join("")}</div></label>` : ""}
   <label>الكمية<span class="qty"><button type="button" id="mn">−</button><b id="qv">1</b><button type="button" id="pl">+</button></span></label>
   <label>ملاحظات<textarea name="note" rows="2" maxlength="200" placeholder="مثال: من غير سكر"></textarea></label>
   <button class="btn" ${p.available ? "" : "disabled"}>${p.available ? "أضف للسلة" : "غير متاح حالياً"}</button></form></div></div></div>`);
  let q = 1; const f = $("#pf");
  const unit = () => { let u = p.price; if (d) { u += S.sizes[+f.size.value].add; f.querySelectorAll("[name=ex]:checked").forEach(c => u += S.extras[+c.value].add); } return u; };
  const upd = () => { $("#qv").textContent = q; $("#pp").textContent = EGP(unit() * q); };
  f.onchange = upd; $("#mn").onclick = () => { q = Math.max(1, q - 1); upd(); }; $("#pl").onclick = () => { q = Math.min(20, q + 1); upd(); };
  f.onsubmit = e => {
    e.preventDefault(); if (!p.available) return;
    const item = { id: p.id, name: p.name, qty: q, note: f.note.value.trim(), unit: unit() };
    if (d) { item.size = S.sizes[+f.size.value].n; item.extras = [...f.querySelectorAll("[name=ex]:checked")].map(c => S.extras[+c.value].n); }
    cart.push(item); saveCart(); toast("اتضاف للسلة ✓"); location.hash = "#/order";
  };
}
function offers() { app(`${phead("عروض الكافيه", "عروض بتتغير باستمرار")}<div class="wrap"><div class="grid">${S.offers.map(o => `<div class="box offer"><span class="status">${esc(o.tag)}</span><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p><a class="btn sm" style="margin-top:10px" href="#/menu">اطلب الآن</a></div>`).join("")}</div></div>`); }
function about() {
  app(`${phead("من نحن", "RIWAQ CAFÉ")}<div class="wrap legal" style="max-width:900px"><div class="split" style="margin:0 0 24px"><img src="img/storefront.jpg" alt="واجهة رِواق"><img src="img/lounge.jpg" alt="الجلسات"></div><div class="box"><p>رِواق كافيه مش مجرد مكان لشرب القهوة. هو مساحة بتجمع القهوة المختصة والأجواء الهادئة والشغل والمذاكرة واللقاءات.</p><p>عايزين نقدم تجربة مختلفة للزائر، سواء جاي لقهوة الصبح، أو عايز يشتغل أو يذاكر بعيد عن البيت، أو يقابل صحابه، أو يستمتع بحلويات ومشروبات، أو يحجز مكان لجلسة خاصة.</p></div>
  <h3>لمين المكان؟</h3><div class="grid" style="margin-top:10px">${["الشباب من 18 إلى 35 سنة", "الطلاب", "الموظفين والشغل عن بُعد", "محبي القهوة المختصة", "العائلات والأصدقاء"].map(x => `<div class="box">✔ ${x}</div>`).join("")}</div>
  <div style="margin-top:22px"><a class="btn" href="#/booking">احجز طاولتك</a></div></div>`);
}
function gallery() {
  app(`${phead("معرض الصور", "لقطات من المكان")}<div class="wrap"><div class="grid">${S.gallery.map((g, i) => `<div class="card"><div class="ph" style="--c1:${["#3b2a20", "#2B211C", "#4a2c20", "#4a5a3f", "#3b2a20", "#2B211C"][i % 6]};--c2:${["#b88a3e", "#87917B", "#D4A85F", "#87917B", "#D4A85F", "#b88a3e"][i % 6]}">${g.image ? `<img src="${g.image}" alt="${esc(g.cap)}" loading="lazy">` : [I.cup, I.couch, I.cake, I.laptop, I.leaf, I.music][i % 6]}</div><div class="b"><b>${esc(g.cap)}</b></div></div>`).join("")}</div><p class="note">الصور دي أماكن مؤقتة، تتغير بصور المكان الحقيقية من لوحة التحكم.</p></div>`);
}
function bookingDates() { const o = []; for (let i = 0; i < 14; i++) { const d = new Date(); d.setDate(d.getDate() + i); o.push(d); } return o; }
function booking() {
  const days = bookingDates(), fmt = d => d.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" }), iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const slots = []; for (let h = 8; h < 24; h++) for (const m of [0, 30]) slots.push(String(h).padStart(2, "0") + ":" + (m ? "30" : "00"));
  app(`${phead("حجز طاولة", "اختار اليوم والوقت وعدد الأشخاص")}<div class="wrap"><div class="cols"><form id="bf" class="f box" novalidate>
  <div class="two"><label>اليوم<select name="date">${days.map(d => `<option value="${iso(d)}">${fmt(d)}</option>`).join("")}</select></label>
  <label>الوقت<select name="time"></select></label></div>
  <label>عدد الأشخاص<select name="size">${[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => `<option>${n}</option>`).join("")}</select></label>
  <label>الاسم<input name="name" maxlength="60" autocomplete="name"><span class="err" data-e="name"></span></label>
  <label>رقم الهاتف<input name="phone" inputmode="tel" dir="ltr" placeholder="01XXXXXXXXX" autocomplete="tel"><span class="err" data-e="phone"></span></label>
  <label>ملاحظات (اختياري)<textarea name="note" rows="2" maxlength="200"></textarea></label>
  <button class="btn">إرسال طلب الحجز</button></form>
  <div class="box"><h3>تابع حجزك</h3><p class="sub">اكتب رقم الحجز اللي اتبعتلك.</p><form id="tf" class="f"><input name="n" placeholder="مثال: B1001" dir="ltr"><button class="btn dark">عرض الحالة</button></form><div id="tr" style="margin-top:12px"></div></div></div></div>`);
  const f = $("#bf");
  const fillTimes = () => { const today = f.date.value === iso(new Date()), now = new Date(); const ok = slots.filter(s => { if (!today) return true; const [h, m] = s.split(":"); return +h * 60 + +m > now.getHours() * 60 + now.getMinutes() + 30; }); f.time.innerHTML = ok.length ? ok.map(s => `<option>${s}</option>`).join("") : "<option value=''>لا مواعيد اليوم</option>"; };
  fillTimes(); f.date.onchange = fillTimes;
  f.onsubmit = e => {
    e.preventDefault(); const er = validate(f, { name: v => v.trim().length >= 2 || "اكتب اسمك", phone: v => /^(\+?20|0)?1[0125]\d{8}$/.test(v.replace(/[\s-]/g, "")) || "رقم موبايل مصري صحيح" });
    if (er || !f.time.value) return;
    const b = { id: "B" + (++S.seq), date: f.date.value, time: f.time.value, size: +f.size.value, name: f.name.value.trim(), phone: f.phone.value.trim(), note: f.note.value.trim(), status: "جديد", created: Date.now() };
    srvInsert("booking", b);
    $("#app").querySelector(".wrap").innerHTML = `<div class="box" style="text-align:center;max-width:520px;margin:auto"><div style="font-size:60px;color:var(--sage)">${I.check}</div><h2>وصلنا طلب الحجز</h2><p>رقم الحجز: <b dir="ltr">${b.id}</b></p><p class="sub">احتفظ بالرقم لمتابعة الحالة. هنأكد معاك على الواتساب.</p><a class="btn" target="_blank" rel="noopener" href="${wa(`حجز ${b.id} - ${b.name} - ${b.date} ${b.time} - ${b.size} أشخاص`)}">تأكيد على واتساب</a></div>`;
  };
  $("#tf").onsubmit = e => { e.preventDefault(); const n = e.target.n.value.trim().toUpperCase(); srvGet(n).then(b => { $("#tr").innerHTML = b ? `<div class="box">${esc(b.name)} · ${esc(b.date)} ${esc(b.time)} · ${b.size} أشخاص<br><span class="status ${statCls(b.status)}">${esc(b.status)}</span></div>` : '<p class="err">مفيش حجز بالرقم ده.</p>'; }); };
}
function validate(f, rules) {
  let bad = false; for (const k in rules) { const r = rules[k](f[k].value), el = f.querySelector(`[data-e=${k}]`); if (r !== true) { bad = true; if (el) el.textContent = r; } else if (el) el.textContent = ""; } return bad;
}
function cartTotals(type) { const sub = cart.reduce((a, c) => a + c.unit * c.qty, 0); const fee = type === "delivery" && sub ? S.settings.deliveryFee : 0; return { sub, fee, total: sub + fee }; }
function order() {
  if (!cart.length) { app(`${phead("السلة")}<div class="wrap" style="text-align:center"><div style="font-size:60px;color:var(--caramel)">${I.cart}</div><p class="sub">السلة فاضية.</p><a class="btn" href="#/menu">روح للمنيو</a><div class="box" style="max-width:420px;margin:30px auto 0"><h3>تابع طلبك</h3><form id="tf" class="f"><input name="n" placeholder="مثال: R1001" dir="ltr"><button class="btn dark">عرض الحالة</button></form><div id="tr" style="margin-top:12px"></div></div></div>`); $("#tf").onsubmit = trackSubmit; return; }
  app(`${phead("الطلب أونلاين", "راجع سلتك وأكد الطلب")}<div class="wrap"><div class="cols"><div class="box"><h3>سلتك</h3><div id="cl"></div></div>
  <form id="of" class="f box" novalidate><h3>بيانات الطلب</h3>
  <label>طريقة الاستلام<div class="opts"><label><input type="radio" name="type" value="pickup" checked>استلام من الفرع</label><label><input type="radio" name="type" value="delivery">توصيل</label></div></label>
  <label>الاسم<input name="name" maxlength="60"><span class="err" data-e="name"></span></label>
  <label>رقم الهاتف<input name="phone" inputmode="tel" dir="ltr" placeholder="01XXXXXXXXX"><span class="err" data-e="phone"></span></label>
  <label id="adl" hidden>العنوان<textarea name="addr" rows="2" maxlength="200"></textarea><span class="err" data-e="addr"></span></label>
  <label>ملاحظات للطلب<textarea name="note" rows="2" maxlength="200"></textarea></label>
  <div id="sum"></div><button class="btn">تأكيد الطلب</button><p class="sub" style="font-size:13px">الدفع عند الاستلام.</p></form></div></div>`);
  const f = $("#of"), type = () => f.type.value;
  const draw = () => {
    $("#cl").innerHTML = cart.map((c, i) => `<div class="line"><div><b dir="ltr">${esc(c.name)}</b>${c.size ? `<small>${esc(c.size)}${c.extras.length ? " · " + c.extras.map(esc).join("، ") : ""}</small>` : ""}${c.note ? `<small>ملاحظة: ${esc(c.note)}</small>` : ""}<span class="qty" style="margin-top:6px"><button data-m="${i}">−</button><b>${c.qty}</b><button data-p="${i}">+</button></span></div><div>${EGP(c.unit * c.qty)}<br><button class="btn sm red" data-d="${i}">حذف</button></div></div>`).join("");
    const t = cartTotals(type()); $("#sum").innerHTML = `<div class="line"><span>المجموع</span><span>${EGP(t.sub)}</span></div>${t.fee ? `<div class="line"><span>التوصيل</span><span>${EGP(t.fee)}</span></div>` : ""}<div class="line total"><span>الإجمالي</span><span>${EGP(t.total)}</span></div>`;
    $("#adl").hidden = type() !== "delivery";
    $("#cl").querySelectorAll("button").forEach(b => b.onclick = () => { const d = b.dataset; if (d.m !== undefined) cart[d.m].qty = Math.max(1, cart[d.m].qty - 1); if (d.p !== undefined) cart[d.p].qty = Math.min(20, cart[d.p].qty + 1); if (d.d !== undefined) cart.splice(d.d, 1); saveCart(); cart.length ? draw() : order(); });
  };
  draw(); f.onchange = draw;
  f.onsubmit = e => {
    e.preventDefault();
    const er = validate(f, { name: v => v.trim().length >= 2 || "اكتب اسمك", phone: v => /^(\+?20|0)?1[0125]\d{8}$/.test(v.replace(/[\s-]/g, "")) || "رقم موبايل مصري صحيح", addr: v => type() !== "delivery" || v.trim().length >= 8 || "اكتب العنوان بالتفصيل" });
    if (er) return; const t = cartTotals(type());
    const o = { id: "R" + (++S.seq), items: cart, type: type(), name: f.name.value.trim(), phone: f.phone.value.trim(), addr: f.addr.value.trim(), note: f.note.value.trim(), sub: t.sub, fee: t.fee, total: t.total, status: "جديد", created: Date.now() };
    srvInsert("order", o); cart = []; saveCart();
    $("#app").querySelector(".wrap").innerHTML = `<div class="box" style="text-align:center;max-width:520px;margin:auto"><div style="font-size:60px;color:var(--sage)">${I.check}</div><h2>تم استلام طلبك</h2><p>رقم الطلب: <b dir="ltr">${o.id}</b></p><p>الإجمالي: <b>${EGP(o.total)}</b></p><p class="sub">تقدر تتابع الحالة بالرقم ده.</p><a class="btn" href="#/track/${o.id}">تابع الطلب</a> <a class="btn alt" target="_blank" rel="noopener" href="${wa("طلب " + o.id)}">واتساب</a></div>`;
  };
}
function trackSubmit(e) { e.preventDefault(); const n = e.target.n.value.trim().toUpperCase(); if (n) location.hash = "#/track/" + n; }
function track(n) { srvGet((n || "").toUpperCase()).then(o => trackView(n, o)); }
function trackView(n, o) {
  const flow = ["جديد", "تم التأكيد", "قيد التحضير", "جاهز للاستلام", "خرج للتوصيل", "مكتمل"];
  app(`${phead("متابعة الطلب")}<div class="wrap" style="max-width:700px"><div class="box">${o ? `<h3>طلب <span dir="ltr">${o.id}</span></h3><div class="steps">${flow.filter(s => o.type === "delivery" || s !== "خرج للتوصيل").map(s => `<span class="${flow.indexOf(s) <= flow.indexOf(o.status) ? "on" : ""}">${s}</span>`).join("")}</div>${o.status === "ملغي" ? '<span class="status s-cancel">ملغي</span>' : ""}${o.items.map(c => `<div class="line"><span dir="ltr">${esc(c.name)} × ${c.qty}</span><span>${EGP(c.unit * c.qty)}</span></div>`).join("")}<div class="line total"><span>الإجمالي</span><span>${EGP(o.total)}</span></div>` : '<p class="err">مفيش طلب بالرقم ده.</p>'}<form id="tf" class="f" style="margin-top:14px"><input name="n" placeholder="رقم طلب تاني" dir="ltr"><button class="btn dark">عرض</button></form></div></div>`);
  $("#tf").onsubmit = trackSubmit;
}
function events() {
  app(`${phead("الفعاليات", "جلسات موسيقية وفعاليات قهوة ولقاءات")}<div class="wrap"><div class="grid">${S.events.map(e => `<div class="box offer"><span class="status">${esc(e.date)}</span><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></div>`).join("")}</div>
  <div class="sec-h"><h2>اطلب حجز فعالية أو مناسبة خاصة</h2></div><form id="ef" class="f box" novalidate>
  <label>الاسم<input name="name" maxlength="60"><span class="err" data-e="name"></span></label><label>رقم الهاتف<input name="phone" dir="ltr" inputmode="tel"><span class="err" data-e="phone"></span></label>
  <div class="two"><label>نوع المناسبة<select name="kind"><option>جلسة موسيقية</option><option>فعالية قهوة</option><option>عيد ميلاد / لقاء خاص</option><option>أخرى</option></select></label><label>عدد الأشخاص<input name="n" type="number" min="1" max="200" value="10"></label></div>
  <label>التاريخ المتوقع<input name="date" type="date"></label><label>تفاصيل<textarea name="note" rows="3" maxlength="400"></textarea></label><button class="btn">إرسال الطلب</button></form></div>`);
  const f = $("#ef");
  f.onsubmit = e => { e.preventDefault(); const er = validate(f, { name: v => v.trim().length >= 2 || "اكتب اسمك", phone: v => /^(\+?20|0)?1[0125]\d{8}$/.test(v.replace(/[\s-]/g, "")) || "رقم موبايل مصري صحيح" }); if (er) return; srvInsert("request", { id: "E" + (++S.seq), name: f.name.value.trim(), phone: f.phone.value.trim(), kind: f.kind.value, n: f.n.value, date: f.date.value, note: f.note.value.trim(), created: Date.now() }); save(); f.reset(); toast("وصل طلبك، هنكلمك قريب ✓"); };
}
function contact() {
  const s = S.settings;
  app(`${phead("تواصل معنا")}<div class="wrap"><div class="cols"><div><div class="box"><p>${I.pin} ${esc(s.address)}</p><p>${I.phone} <a dir="ltr" href="tel:${esc(s.phone.replace(/\s/g, ""))}">${esc(s.phone)}</a></p><p>${I.mail} <a href="mailto:${esc(s.email)}">${esc(s.email)}</a></p><p>${I.clock} ${s.hours.map(esc).join(" · ")}</p><p style="margin-top:10px"><a class="btn sm" target="_blank" rel="noopener" href="${wa()}">واتساب</a> <a class="btn sm alt" target="_blank" rel="noopener" href="${esc(s.social.instagram)}">Instagram</a> <a class="btn sm alt" target="_blank" rel="noopener" href="${esc(s.social.facebook)}">Facebook</a> <a class="btn sm alt" target="_blank" rel="noopener" href="${esc(s.social.tiktok)}">TikTok</a></p></div>
  <iframe class="map" style="margin-top:16px" loading="lazy" title="الخريطة" src="https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&output=embed"></iframe></div>
  <form id="cf" class="f box" novalidate><h3>ابعتلنا رسالة</h3><label>الاسم<input name="name" maxlength="60"><span class="err" data-e="name"></span></label><label>الإيميل أو الهاتف<input name="contact" maxlength="80"><span class="err" data-e="contact"></span></label><label>الرسالة<textarea name="msg" rows="4" maxlength="600"></textarea><span class="err" data-e="msg"></span></label><button class="btn">إرسال</button></form></div></div>`);
  const f = $("#cf");
  f.onsubmit = e => { e.preventDefault(); const er = validate(f, { name: v => v.trim().length >= 2 || "اكتب اسمك", contact: v => v.trim().length >= 6 || "اكتب وسيلة تواصل", msg: v => v.trim().length >= 5 || "اكتب رسالتك" }); if (er) return; srvInsert("message", { id: uid("m"), name: f.name.value.trim(), contact: f.contact.value.trim(), msg: f.msg.value.trim(), created: Date.now() }); save(); f.reset(); toast("وصلتنا رسالتك ✓"); };
}
function faq() { app(`${phead("الأسئلة الشائعة")}<div class="wrap" style="max-width:800px">${S.faq.map(q => `<details><summary>${esc(q[0])}</summary><p style="margin-top:8px">${esc(q[1])}</p></details>`).join("")}</div>`); }
function privacy() {
  app(`${phead("سياسة الخصوصية")}<div class="wrap legal" style="max-width:800px"><div class="box"><h3>البيانات اللي بنجمعها</h3><p>الاسم، رقم الهاتف، العنوان (للتوصيل فقط)، وتفاصيل الطلب أو الحجز.</p><h3>إزاي بنستخدمها</h3><ul><li>تنفيذ الطلبات والحجوزات والتواصل معاك بخصوصها.</li><li>الرد على رسائلك واستفساراتك.</li></ul><h3>المشاركة</h3><p>مبنبيعش بياناتك ولا بنشاركها مع حد غير شركة التوصيل لو الطلب توصيل.</p><h3>حقوقك</h3><p>تقدر تطلب حذف أو تعديل بياناتك بالتواصل معانا على ${esc(S.settings.email)}.</p><p class="note">نص تجريبي، يتراجع قانونياً قبل الاستخدام التجاري.</p></div></div>`);
}
function terms() {
  app(`${phead("الشروط والأحكام")}<div class="wrap legal" style="max-width:800px"><div class="box"><h3>الطلبات</h3><ul><li>الأسعار بالجنيه المصري وقابلة للتغيير.</li><li>الدفع عند الاستلام.</li><li>رسوم التوصيل بتظهر قبل التأكيد.</li><li>لا يمكن إلغاء الطلب بعد بدء التحضير.</li></ul><h3>الحجوزات</h3><ul><li>الحجز طلب ويتأكد من الكافيه.</li><li>بنحتفظ بالطاولة 15 دقيقة بعد الميعاد.</li></ul><h3>الفعاليات</h3><p>الأماكن محدودة وتخضع للتأكيد.</p><p class="note">نص تجريبي، يتراجع قبل الاستخدام التجاري.</p></div></div>`);
}
function footer() {
  const s = S.settings;
  $("#footer").innerHTML = `<div class="in"><div><img src="img/logo.png" alt="RIWAQ CAFÉ" style="height:70px;margin-bottom:8px"><h4>RIWAQ CAFÉ · رِواق كافيه</h4><p>${esc(s.address)}</p><p>${s.hours.map(esc).join("<br>")}</p></div><div><h4>روابط</h4><a href="#/menu">المنيو</a><a href="#/booking">حجز طاولة</a><a href="#/order">الطلب أونلاين</a><a href="#/events">الفعاليات</a><a href="#/faq">الأسئلة الشائعة</a></div><div><h4>قانوني</h4><a href="#/privacy">سياسة الخصوصية</a><a href="#/terms">الشروط والأحكام</a><a href="#/admin">دخول الإدارة</a></div></div><div class="copy">© ${new Date().getFullYear()} RIWAQ CAFÉ. جميع الحقوق محفوظة.</div>`;
  $("#wafloat").href = wa();
}

/* ---------- Admin ---------- */
let adminTab = "orders", authed = sessionStorage.getItem("riwaq_admin") === "1";
function readImg(file, max = 900) {
  return new Promise(res => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = im.width * k; c.height = im.height * k; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", .78)); }; im.src = r.result; }; r.readAsDataURL(file); });
}
function admin() {
  if (!authed) {
    srvLoginUI();
    return;
  }
  const tabs = [["orders", "الطلبات"], ["bookings", "الحجوزات"], ["products", "المنتجات"], ["content", "المحتوى"], ["inbox", "الرسائل والفعاليات"]];
  const newO = S.orders.filter(o => o.status === "جديد").length, newB = S.bookings.filter(o => o.status === "جديد").length;
  app(`${phead("لوحة التحكم")}<div class="wrap"><div class="kpis"><div><b>${newO}</b>طلبات جديدة</div><div><b>${S.orders.length}</b>كل الطلبات</div><div><b>${newB}</b>حجوزات جديدة</div><div><b>${EGP(S.orders.filter(o => o.status === "مكتمل").reduce((a, o) => a + o.total, 0))}</b>مبيعات مكتملة</div></div>
  <div class="tabs">${tabs.map(t => `<button class="chip ${adminTab === t[0] ? "on" : ""}" data-t="${t[0]}">${t[1]}</button>`).join("")}<button class="chip" id="rf">تحديث</button><button class="chip" id="out">خروج</button></div><div id="ad"></div></div>`);
  document.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { adminTab = b.dataset.t; admin(); });
  $("#rf").onclick = () => srvLoadAdmin().then(admin).catch(() => toast("فشل التحديث")); $("#out").onclick = () => { authed = false; sessionStorage.removeItem("riwaq_admin"); srvLogout(); admin(); };
  ({ orders: aOrders, bookings: aBookings, products: aProducts, content: aContent, inbox: aInbox })[adminTab]();
}
const dt = t => new Date(t).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" });
const statSel = (id, cur, list = STAT) => `<select data-s="${id}">${list.map(s => `<option ${s === cur ? "selected" : ""}>${s}</option>`).join("")}</select>`;
function aOrders() {
  const l = [...S.orders].reverse();
  $("#ad").innerHTML = l.length ? `<div class="scroll"><table class="table"><tr><th>رقم</th><th>العميل</th><th>الطلب</th><th>الإجمالي</th><th>الحالة</th></tr>${l.map(o => `<tr><td dir="ltr">${o.id}<br><small>${dt(o.created)}</small></td><td>${esc(o.name)}<br><a dir="ltr" href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br>${o.type === "delivery" ? "توصيل: " + esc(o.addr) : "استلام من الفرع"}</td><td>${o.items.map(c => `<div dir="ltr" style="text-align:start">${esc(c.name)} × ${c.qty}${c.size ? " (" + esc(c.size) + ")" : ""}</div>${c.extras && c.extras.length ? "<small>" + c.extras.map(esc).join("، ") + "</small>" : ""}${c.note ? "<small> · " + esc(c.note) + "</small>" : ""}`).join("")}${o.note ? "<small>ملاحظة: " + esc(o.note) + "</small>" : ""}</td><td>${EGP(o.total)}</td><td>${statSel(o.id, o.status)}</td></tr>`).join("")}</table></div>` : '<p class="sub">مفيش طلبات لسه. جرب اطلب من الموقع.</p>';
  document.querySelectorAll("[data-s]").forEach(s => s.onchange = () => { S.orders.find(o => o.id === s.dataset.s).status = s.value; save(); toast("اتحدثت الحالة"); admin(); });
}
function aBookings() {
  const l = [...S.bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  $("#ad").innerHTML = l.length ? `<div class="scroll"><table class="table"><tr><th>رقم</th><th>الميعاد</th><th>العميل</th><th>أشخاص</th><th>الحالة</th><th></th></tr>${l.map(b => `<tr><td dir="ltr">${b.id}</td><td><input type="date" value="${b.date}" data-bd="${b.id}"> <input type="time" value="${b.time}" data-bt="${b.id}"></td><td>${esc(b.name)}<br><a dir="ltr" href="tel:${esc(b.phone)}">${esc(b.phone)}</a>${b.note ? "<br><small>" + esc(b.note) + "</small>" : ""}</td><td>${b.size}</td><td><span class="status ${statCls(b.status)}">${esc(b.status)}</span></td><td><button class="btn sm" data-ok="${b.id}">قبول</button> <button class="btn sm red" data-no="${b.id}">رفض</button></td></tr>`).join("")}</table></div><p class="sub">عدد الأشخاص في الحجوزات المقبولة النهارده: ${S.bookings.filter(b => b.status === "تم التأكيد" && b.date === new Date().toISOString().slice(0, 10)).reduce((a, b) => a + b.size, 0)}</p>` : '<p class="sub">مفيش حجوزات لسه.</p>';
  const g = id => S.bookings.find(b => b.id === id);
  document.querySelectorAll("[data-ok]").forEach(b => b.onclick = () => { g(b.dataset.ok).status = "تم التأكيد"; save(); aBookings(); });
  document.querySelectorAll("[data-no]").forEach(b => b.onclick = () => { g(b.dataset.no).status = "ملغي"; save(); aBookings(); });
  document.querySelectorAll("[data-bd]").forEach(i => i.onchange = () => { g(i.dataset.bd).date = i.value; save(); toast("اتعدل الميعاد"); });
  document.querySelectorAll("[data-bt]").forEach(i => i.onchange = () => { g(i.dataset.bt).time = i.value; save(); toast("اتعدل الميعاد"); });
}
function aProducts() {
  $("#ad").innerHTML = `<div class="row" style="margin-bottom:12px"><button class="btn sm" id="add">+ إضافة منتج</button><button class="btn sm alt" id="cats">إدارة التصنيفات</button></div><div class="scroll"><table class="table"><tr><th>صورة</th><th>الاسم / الوصف</th><th>التصنيف</th><th>السعر</th><th>متاح</th><th></th></tr>${S.products.map(p => `<tr><td><label style="cursor:pointer"><span class="mini">${p.image ? `<img src="${p.image}" class="mini" alt="">` : ICON[p.cat] || I.cup}</span><input type="file" accept="image/*" hidden data-img="${p.id}"></label></td><td><input value="${esc(p.name)}" data-f="name" data-id="${p.id}"><input value="${esc(p.desc)}" data-f="desc" data-id="${p.id}" style="margin-top:4px"></td><td><select data-f="cat" data-id="${p.id}">${S.categories.map(c => `<option value="${c.id}" ${c.id === p.cat ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></td><td><input type="number" min="0" style="width:90px" value="${p.price}" data-f="price" data-id="${p.id}"></td><td><input type="checkbox" ${p.available ? "checked" : ""} data-f="available" data-id="${p.id}"><br><label><input type="checkbox" ${p.popular ? "checked" : ""} data-f="popular" data-id="${p.id}"> مميز</label></td><td><button class="btn sm red" data-del="${p.id}">حذف</button></td></tr>`).join("")}</table></div>`;
  document.querySelectorAll("[data-f]").forEach(i => i.onchange = () => { const p = S.products.find(x => x.id === i.dataset.id), k = i.dataset.f; p[k] = i.type === "checkbox" ? i.checked : i.type === "number" ? Math.max(0, +i.value || 0) : i.value; save(); toast("اتحفظ ✓"); });
  document.querySelectorAll("[data-img]").forEach(i => i.onchange = async () => { if (i.files[0]) { S.products.find(x => x.id === i.dataset.img).image = await readImg(i.files[0], 700); save(); aProducts(); } });
  document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { if (confirm("حذف المنتج؟")) { S.products = S.products.filter(p => p.id !== b.dataset.del); save(); aProducts(); } });
  $("#add").onclick = () => { S.products.unshift({ id: uid("p"), name: "New Item", cat: S.categories[0].id, price: 50, desc: "وصف المنتج", popular: false, available: true, image: "" }); save(); aProducts(); };
  $("#cats").onclick = () => {
    $("#ad").innerHTML = `<div class="box"><h3>التصنيفات</h3>${S.categories.map(c => `<div class="row" style="margin:6px 0"><input value="${esc(c.name)}" data-cn="${c.id}"><button class="btn sm red" data-cd="${c.id}">حذف</button></div>`).join("")}<div class="row"><input id="nc" placeholder="تصنيف جديد"><button class="btn sm" id="ncb">إضافة</button></div><button class="btn dark sm" id="back" style="margin-top:10px">رجوع</button></div>`;
    document.querySelectorAll("[data-cn]").forEach(i => i.onchange = () => { S.categories.find(c => c.id === i.dataset.cn).name = i.value; save(); });
    document.querySelectorAll("[data-cd]").forEach(b => b.onclick = () => { if (S.products.some(p => p.cat === b.dataset.cd)) return toast("فيه منتجات في التصنيف ده"); S.categories = S.categories.filter(c => c.id !== b.dataset.cd); save(); aProducts(); });
    $("#ncb").onclick = () => { const v = $("#nc").value.trim(); if (v) { S.categories.push({ id: uid("c"), name: v, icon: "☕" }); save(); aProducts(); } }; $("#back").onclick = aProducts;
  };
}
function aContent() {
  const s = S.settings;
  $("#ad").innerHTML = `<div class="cols"><form id="sf" class="f box"><h3>البيانات الأساسية</h3>
  <label>رقم الهاتف<input name="phone" dir="ltr" value="${esc(s.phone)}"></label><label>واتساب (بدون +)<input name="whatsapp" dir="ltr" value="${esc(s.whatsapp)}"></label><label>الإيميل<input name="email" dir="ltr" value="${esc(s.email)}"></label><label>العنوان<input name="address" value="${esc(s.address)}"></label><label>بحث الخريطة<input name="mapQuery" dir="ltr" value="${esc(s.mapQuery)}"></label>
  <label>مواعيد العمل (سطر لكل سطر)<textarea name="hours" rows="3">${esc(s.hours.join("\n"))}</textarea></label><label>رسوم التوصيل (جنيه)<input name="deliveryFee" type="number" min="0" value="${s.deliveryFee}"></label>
  <label>Instagram<input name="instagram" dir="ltr" value="${esc(s.social.instagram)}"></label><label>Facebook<input name="facebook" dir="ltr" value="${esc(s.social.facebook)}"></label><label>TikTok<input name="tiktok" dir="ltr" value="${esc(s.social.tiktok)}"></label>
  <label>عنوان الصفحة الرئيسية<input name="heroTitle" value="${esc(s.heroTitle)}"></label><label>نص الصفحة الرئيسية<textarea name="heroText" rows="2">${esc(s.heroText)}</textarea></label>
  <label>صورة الصفحة الرئيسية<input type="file" accept="image/*" id="hi"></label>${s.heroImage ? '<button type="button" class="btn sm red" id="hx">إزالة الصورة</button>' : ""}<button class="btn">حفظ</button></form>
  <div>${listEd("offers", "العروض", [["title", "العنوان"], ["tag", "الوسم"], ["text", "الوصف"]])}${listEd("events", "الفعاليات", [["title", "العنوان"], ["date", "الموعد"], ["text", "الوصف"]])}
  <div class="box" style="margin-top:14px"><h3>معرض الصور</h3>${S.gallery.map(g => `<div class="row" style="margin:8px 0"><input value="${esc(g.cap)}" data-gc="${g.id}"><label class="btn sm alt" style="cursor:pointer">رفع<input type="file" accept="image/*" hidden data-gi="${g.id}"></label><button class="btn sm red" data-gd="${g.id}">حذف</button></div>`).join("")}<button class="btn sm" id="ga">+ صورة</button></div></div></div>`;
  const f = $("#sf");
  f.onsubmit = e => { e.preventDefault(); Object.assign(s, { phone: f.phone.value, whatsapp: f.whatsapp.value.replace(/\D/g, ""), email: f.email.value, address: f.address.value, mapQuery: f.mapQuery.value, hours: f.hours.value.split("\n").map(x => x.trim()).filter(Boolean), deliveryFee: +f.deliveryFee.value || 0, heroTitle: f.heroTitle.value, heroText: f.heroText.value }); s.social = { instagram: f.instagram.value, facebook: f.facebook.value, tiktok: f.tiktok.value }; save(); toast("اتحفظ ✓"); };
  $("#hi").onchange = async e => { if (e.target.files[0]) { s.heroImage = await readImg(e.target.files[0], 1400); save(); aContent(); } };
  if ($("#hx")) $("#hx").onclick = () => { s.heroImage = ""; save(); aContent(); };
  bindList("offers", [["title"], ["tag"], ["text"]], { title: "عرض جديد", tag: "جديد", text: "وصف" }); bindList("events", [["title"], ["date"], ["text"]], { title: "فعالية جديدة", date: "الموعد", text: "وصف" });
  document.querySelectorAll("[data-gc]").forEach(i => i.onchange = () => { S.gallery.find(g => g.id === i.dataset.gc).cap = i.value; save(); });
  document.querySelectorAll("[data-gi]").forEach(i => i.onchange = async () => { if (i.files[0]) { S.gallery.find(g => g.id === i.dataset.gi).image = await readImg(i.files[0]); save(); aContent(); } });
  document.querySelectorAll("[data-gd]").forEach(b => b.onclick = () => { S.gallery = S.gallery.filter(g => g.id !== b.dataset.gd); save(); aContent(); });
  $("#ga").onclick = () => { S.gallery.push({ id: uid("g"), cap: "صورة جديدة", image: "" }); save(); aContent(); };
}
function listEd(key, title, fields) {
  return `<div class="box" style="margin-top:14px"><h3>${title}</h3>${S[key].map(o => `<div style="border-bottom:1px solid #eee3d3;padding:8px 0;display:grid;gap:4px">${fields.map(f => `<input placeholder="${f[1]}" value="${esc(o[f[0]])}" data-l="${key}" data-id="${o.id}" data-k="${f[0]}">`).join("")}<button class="btn sm red" data-ld="${key}|${o.id}">حذف</button></div>`).join("")}<button class="btn sm" data-la="${key}" style="margin-top:8px">+ إضافة</button></div>`;
}
function bindList(key, f, blank) {
  document.querySelectorAll(`[data-l=${key}]`).forEach(i => i.onchange = () => { S[key].find(o => o.id === i.dataset.id)[i.dataset.k] = i.value; save(); });
  document.querySelectorAll(`[data-ld^="${key}|"]`).forEach(b => b.onclick = () => { S[key] = S[key].filter(o => o.id !== b.dataset.ld.split("|")[1]); save(); aContent(); });
  document.querySelector(`[data-la=${key}]`).onclick = () => { S[key].push({ id: uid(key[0]), ...blank }); save(); aContent(); };
}
function aInbox() {
  const t = (rows, h) => rows.length ? `<div class="scroll"><table class="table"><tr>${h.map(x => `<th>${x}</th>`).join("")}</tr>${rows.join("")}</table></div>` : '<p class="sub">فاضي.</p>';
  $("#ad").innerHTML = `<h3>طلبات الفعاليات</h3>${t([...S.requests].reverse().map(r => `<tr><td dir="ltr">${r.id}</td><td>${esc(r.name)}<br><a dir="ltr" href="tel:${esc(r.phone)}">${esc(r.phone)}</a></td><td>${esc(r.kind)} · ${esc(r.n)} أشخاص<br>${esc(r.date)}</td><td>${esc(r.note)}</td></tr>`), ["رقم", "العميل", "التفاصيل", "ملاحظات"])}<h3 style="margin-top:20px">رسائل التواصل</h3>${t([...S.messages].reverse().map(m => `<tr><td>${dt(m.created)}</td><td>${esc(m.name)}<br>${esc(m.contact)}</td><td>${esc(m.msg)}</td></tr>`), ["الوقت", "من", "الرسالة"])}`;
}

$("#burger").onclick = () => $("#nav").classList.toggle("open");
function reveal() {
  const els = document.querySelectorAll("#app .card, #app .tile, #app .split, #app .box, #app .feat, #app .sec-h, #app .cta-banner, #app details");
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
  els.forEach(el => { if (!el.classList.contains("rv")) { el.classList.add("rv"); io.observe(el); } });
}
new MutationObserver(() => { clearTimeout(window._rv); window._rv = setTimeout(reveal, 30); }).observe($("#app"), { childList: true });
window.addEventListener("scroll", () => $("#top").classList.toggle("sc", scrollY > 30), { passive: true });
window.addEventListener("hashchange", route); saveCart(); route();
