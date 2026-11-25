"use strict";
/* RIWAQ CAFÉ (server version): data lives in Supabase (Postgres). Customers write orders/bookings/messages; only the admin account can read and edit. */
const SB = { url: "https://mmqxhwhuwuamdsepbrrz.supabase.co", key: "sb_publishable_lxLsHkBvcUo3AUM3c3b29g_1xLCGVlR" };
const SRV_KINDS = { order: "R", booking: "B", request: "E", message: "M" };
const srvTok = () => sessionStorage.getItem("riwaq_tok") || "";
function srvH(extra) { return Object.assign({ apikey: SB.key, Authorization: "Bearer " + (srvTok() || SB.key), "Content-Type": "application/json" }, extra || {}); }
async function srvReq(path, opt) { const r = await fetch(SB.url + path, opt); if (!r.ok) throw new Error(path + " " + r.status); const t = await r.text(); return t ? JSON.parse(t) : null; }
function srvId(kind) { return SRV_KINDS[kind] + String(100000 + Math.floor(Math.random() * 900000)); }
function srvInsert(kind, obj) {
  obj.id = srvId(kind); obj.created = Date.now();
  fetch(SB.url + "/rest/v1/riwaq_submissions", { method: "POST", headers: srvH({ Prefer: "return=minimal" }), body: JSON.stringify({ id: obj.id, kind, data: obj }) })
    .then(r => { if (!r.ok) toast("حصلت مشكلة في الإرسال، حاول تاني"); }).catch(() => toast("مفيش اتصال، حاول تاني"));
  return obj;
}
async function srvGet(code) {
  if (!/^[RBEM]\d{4,9}$/i.test(code || "")) return null;
  try { return await srvReq("/rest/v1/rpc/riwaq_lookup", { method: "POST", headers: srvH(), body: JSON.stringify({ c: code }) }); } catch (e) { return null; }
}
const SRV_LISTS = { order: "orders", booking: "bookings", request: "requests", message: "messages" };
let srvSnap = {};
async function srvLoadState() {
  try { const rows = await srvReq("/rest/v1/riwaq_state?id=eq.1&select=data", { headers: srvH() }); if (rows && rows[0]) { const keep = { orders: S.orders, bookings: S.bookings, requests: S.requests, messages: S.messages, seq: S.seq }; S = Object.assign({}, SEED, rows[0].data, keep); } } catch (e) {}
}
async function srvLoadAdmin() {
  const rows = await srvReq("/rest/v1/riwaq_submissions?select=id,kind,data,created_at&order=created_at.asc&limit=1000", { headers: srvH() });
  for (const k in SRV_LISTS) S[SRV_LISTS[k]] = [];
  srvSnap = {};
  rows.forEach(r => { S[SRV_LISTS[r.kind]].push(r.data); srvSnap[r.id] = JSON.stringify(r.data); });
}
let srvTimer = null;
function save() { if (authed) { clearTimeout(srvTimer); srvTimer = setTimeout(srvPush, 400); } }
async function srvPush() {
  try {
    const st = Object.assign({}, S); ["orders", "bookings", "requests", "messages", "seq"].forEach(k => delete st[k]);
    await srvReq("/rest/v1/riwaq_state", { method: "POST", headers: srvH({ Prefer: "resolution=merge-duplicates,return=minimal" }), body: JSON.stringify({ id: 1, data: st, updated_at: new Date().toISOString() }) });
    const seen = {};
    for (const k in SRV_LISTS) for (const d of S[SRV_LISTS[k]]) { seen[d.id] = 1; const j = JSON.stringify(d); if (srvSnap[d.id] !== j) { await srvReq("/rest/v1/riwaq_submissions?id=eq." + encodeURIComponent(d.id), { method: "PATCH", headers: srvH({ Prefer: "return=minimal" }), body: JSON.stringify({ data: d }) }); srvSnap[d.id] = j; } }
    for (const id in srvSnap) if (!seen[id]) { await srvReq("/rest/v1/riwaq_submissions?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: srvH() }); delete srvSnap[id]; }
  } catch (e) { toast("الحفظ على السيرفر فشل، سجل دخول تاني"); }
}
async function srvLogin(email, pass) {
  const r = await fetch(SB.url + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: SB.key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pass }) });
  if (!r.ok) return false; const j = await r.json(); sessionStorage.setItem("riwaq_tok", j.access_token); return true;
}
function srvLoginUI() {
  app(`${phead("لوحة التحكم")}<div class="wrap"><form id="lf" class="f box"><label>الإيميل<input type="email" name="e" dir="ltr" autocomplete="username"></label><label>كلمة المرور<input type="password" name="p" autocomplete="current-password"></label><span class="err" id="le"></span><button class="btn">دخول</button><p class="note">النسخة بالسيرفر: الدخول بحساب الأدمن، والبيانات محفوظة على قاعدة بيانات.</p></form></div>`);
  $("#lf").onsubmit = async e => { e.preventDefault(); const f = e.target; $("#le").textContent = ""; if (await srvLogin(f.e.value.trim(), f.p.value)) { authed = true; sessionStorage.setItem("riwaq_admin", "1"); try { await srvLoadAdmin(); await srvLoadState(); await srvLoadAdmin(); } catch (x) {} admin(); } else $("#le").textContent = "الإيميل أو كلمة المرور غلط"; };
}
function srvLogout() { sessionStorage.removeItem("riwaq_tok"); }
const srvAdminOrig = routes.admin;
routes.admin = async function () { if (authed && !srvSnap.__ok) { try { await srvLoadAdmin(); srvSnap.__ok = 1; } catch (e) { authed = false; sessionStorage.removeItem("riwaq_admin"); srvLogout(); } } srvAdminOrig(); };
if (!srvTok()) { authed = false; sessionStorage.removeItem("riwaq_admin"); }
srvLoadState().then(() => route());
