import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════
//  CONSTANTS & DATA
// ══════════════════════════════════════════════
const PLANS = [
  { id: "trial", name: "تجريبي", price: 0, period: "يوم واحد", color: "#6b7280", icon: "◈", pages: 1, desc: "اختبر dangal بدون التزام", features: ["صفحة واحدة", "20 تعليق/يوم", "رد يدوي", { t: "إرسال تلقائي", off: true }, { t: "FB + IG", off: true }] },
  { id: "perpage", name: "لكل صفحة", price: 15000, period: "شهرياً/صفحة", color: "#38bdf8", icon: "◆", pages: "مرن", desc: "ادفع فقط عن ما تستخدم", features: ["15,000 IQD / صفحة", "تعليقات غير محدودة", "رد تلقائي", "FB + IG", { t: "Early Bird", off: true }] },
  { id: "earlybird", name: "Early Bird", price: 100000, period: "مرة واحدة", color: "#fbbf24", icon: "🔥", pages: "∞", badge: "أول 50 فقط", desc: "صفحات غير محدودة للأوائل", features: ["صفحات غير محدودة", "تعليقات غير محدودة", "رد تلقائي + AI", "FB + IG معاً", "أولوية دعم فني"] },
];

const NAMES = ["أحمد الموسوي","سارة الربيعي","نور الحسيني","محمد العبيدي","علي الشمري","زينب كاظم","حيدر النجار","ريم الحلبي","يوسف القيسي","لمى العامري"];
const COMMENTS = ["كم سعر المنتج؟","هل يوجد توصيل للبصرة؟","متوفر بألوان ثانية؟","كيف أطلب؟","هل الدفع عند الاستلام؟","جودة المنتج كيف؟","هل يوجد خصم؟","وقت التوصيل كم يوم؟","هل يوجد ضمان؟","مقاس XL متوفر؟"];
const POST_CONTENTS = [
  "🔥 عروض نهاية الموسم! خصم 50% على جميع المنتجات لفترة محدودة",
  "✨ وصل جديد أسبوعي — أحدث الصيحات بأسعار منافسة 👇",
  "🎁 اشتر 2 واحصل على الثالث مجاناً! العرض ينتهي الليلة",
  "📦 شحن مجاني لجميع مناطق العراق اليوم فقط",
  "💎 منتجات فاخرة بجودة عالية وسعر مناسب ⭐⭐⭐⭐⭐",
];
const INIT_PAGES_DATA = [
  { id: "p1", name: "متجر الأناقة", icon: "🛍️", color: "#38bdf8", active: true, caught: 0 },
  { id: "p2", name: "بيت العطور", icon: "🌹", color: "#a78bfa", active: true, caught: 0 },
];
const INIT_POSTS = [
  { id: "pp1", pageId: "p1", pageName: "متجر الأناقة", icon: "🛍️", color: "#38bdf8", content: POST_CONTENTS[0], time: Date.now() - 1200000, likes: 127, shares: 18, comments: [] },
  { id: "pp2", pageId: "p2", pageName: "بيت العطور", icon: "🌹", color: "#a78bfa", content: POST_CONTENTS[1], time: Date.now() - 2800000, likes: 88, shares: 6, comments: [] },
];
const ADMIN_USERS = [
  { id: 1, name: "أحمد الموسوي", phone: "07801234567", plan: "earlybird", pages: 7, status: "active", device: "iPhone 15 — بغداد", paid: 100000, platforms: ["fb","ig"] },
  { id: 2, name: "سارة الربيعي", phone: "07901234567", plan: "earlybird", pages: 4, status: "active", device: "Samsung S24 — البصرة", paid: 100000, platforms: ["fb"] },
  { id: 3, name: "محمد العبيدي", phone: "07711234567", plan: "perpage", pages: 3, status: "active", device: "iPhone 14 — أربيل", paid: 45000, platforms: ["fb","ig"] },
  { id: 4, name: "نور الحسيني", phone: "07801111222", plan: "perpage", pages: 2, status: "trial", device: "Huawei P50 — النجف", paid: 0, platforms: ["ig"] },
  { id: 5, name: "علي الشمري", phone: "07901112233", plan: "earlybird", pages: 9, status: "suspended", device: "—", paid: 100000, platforms: ["fb"] },
];

const rnd = a => a[Math.floor(Math.random() * a.length)];
const fmtT = ts => { const d = Math.floor((Date.now()-ts)/1000); return d<60?`${d}ث`:d<3600?`${Math.floor(d/60)}د`:`${Math.floor(d/3600)}س`; };
const fmtIQD = n => n === 0 ? "مجاناً" : n.toLocaleString("ar-IQ") + " IQD";

// ══════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;900&family=Space+Grotesk:wght@700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#030508}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:#111e2e;border-radius:2px}
.fi{animation:fi .4s cubic-bezier(.22,1,.36,1) both}
@keyframes fi{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
.slide{animation:slide .35s cubic-bezier(.22,1,.36,1) both}
@keyframes slide{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
.pop{animation:pop .3s cubic-bezier(.175,.885,.32,1.275) both}
@keyframes pop{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}

/* Buttons */
.btn{border:none;cursor:pointer;font-family:'Cairo',sans-serif;font-weight:700;border-radius:10px;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.btn-pr{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;box-shadow:0 0 24px rgba(124,58,237,.25)}
.btn-pr:hover{box-shadow:0 0 36px rgba(124,58,237,.4);transform:translateY(-1px)}
.btn-cy{background:linear-gradient(135deg,#0891b2,#06b6d4);color:white;box-shadow:0 0 20px rgba(6,182,212,.2)}
.btn-cy:hover{box-shadow:0 0 32px rgba(6,182,212,.35);transform:translateY(-1px)}
.btn-go{background:linear-gradient(135deg,#92400e,#f59e0b);color:white}
.btn-go:hover{box-shadow:0 0 28px rgba(245,158,11,.3);transform:translateY(-1px)}
.btn-gh{background:transparent;border:1px solid #111e2e;color:#374151}
.btn-gh:hover{border-color:#1e3050;color:#64748b;background:rgba(255,255,255,.02)}
.btn-rd{background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2)}
.btn-rd:hover{background:rgba(239,68,68,.18)}
.btn-gn{background:rgba(16,185,129,.1);color:#34d399;border:1px solid rgba(16,185,129,.2)}
.btn-gn:hover{background:rgba(16,185,129,.18)}
.btn-yl{background:rgba(251,191,36,.1);color:#fbbf24;border:1px solid rgba(251,191,36,.2)}

/* Cards */
.card{background:#07101e;border:1px solid #0d1c2e;border-radius:14px;padding:18px}
.card-sm{background:#060e1a;border:1px solid #0b1828;border-radius:11px;padding:14px}

/* Inputs */
.inp{background:#040a14;border:1px solid #0b1828;border-radius:10px;color:#dde3ee;padding:11px 14px;font-family:'Cairo',sans-serif;font-size:13px;outline:none;transition:border-color .2s;width:100%}
.inp:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.08)}
.inp-err{border-color:#ef4444 !important}
.ta{background:#040a14;border:1px solid #0b1828;border-radius:10px;color:#dde3ee;padding:11px 14px;font-family:'Cairo',sans-serif;font-size:13px;outline:none;resize:vertical;min-height:90px;width:100%;line-height:1.7;transition:border-color .2s}
.ta:focus{border-color:#4f46e5}

/* Tags */
.tag{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
.tag-g{background:rgba(16,185,129,.1);color:#34d399;border:1px solid rgba(16,185,129,.25)}
.tag-r{background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.25)}
.tag-b{background:rgba(56,189,248,.1);color:#38bdf8;border:1px solid rgba(56,189,248,.25)}
.tag-y{background:rgba(251,191,36,.1);color:#fbbf24;border:1px solid rgba(251,191,36,.25)}
.tag-p{background:rgba(167,139,250,.1);color:#a78bfa;border:1px solid rgba(167,139,250,.25)}

/* Toggle */
.tog{width:38px;height:21px;border-radius:11px;cursor:pointer;border:none;position:relative;flex-shrink:0;transition:background .2s}
.tok{position:absolute;top:2.5px;width:16px;height:16px;border-radius:8px;background:white;transition:left .2s;pointer-events:none}

/* Misc */
.dvd{height:1px;background:#080f1a;margin:14px 0}
.dot-live{width:7px;height:7px;border-radius:50%;background:#34d399;animation:pl 1.2s ease infinite;flex-shrink:0}
@keyframes pl{0%,100%{opacity:1}50%{opacity:.3}}
.nav-btn{background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:7px;padding:9px 13px;border-radius:9px;font-family:'Cairo',sans-serif;font-size:12px;font-weight:700;color:#2d3f52;transition:all .18s;width:100%}
.nav-btn:hover{background:#080f1c;color:#4a5568}
.nav-btn.on{background:#0a1628;color:#60a5fa}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:#07101e;border:1px solid #0d1c2e;border-radius:22px;width:100%;max-width:400px;overflow:hidden;position:relative;max-height:90vh;overflow-y:auto}
.plan-card{border-radius:18px;padding:24px 20px;cursor:pointer;border:1px solid #0b1828;transition:transform .25s,box-shadow .25s,border-color .25s;position:relative;overflow:hidden;background:#07101e}
.plan-card:hover{transform:translateY(-6px);border-color:#142035}
.plan-card.hot{background:linear-gradient(160deg,#0d0920,#09061a);border-color:#3b1f6e}
.prog{height:5px;border-radius:3px;background:#070d18;overflow:hidden}
.prog-f{height:100%;border-radius:3px}
.row{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #070e18;gap:10px}
.row:last-child{border-bottom:none}
.row-cl{cursor:pointer;transition:background .15s;border-radius:8px}
.row-cl:hover{background:rgba(255,255,255,.015);margin:0 -4px;padding:10px 4px}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:32px;height:32px;border:3px solid #111e2e;border-top-color:#7c3aed;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px}
.flash{animation:fl .7s ease}
@keyframes fl{0%,100%{border-color:#0b1828}50%{border-color:#fbbf24;box-shadow:0 0 14px rgba(251,191,36,.2)}}
`;

// ══════════════════════════════════════════════
//  LOGO COMPONENT
// ══════════════════════════════════════════════
const Logo = ({ size = 32 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <div style={{ width: size, height: size, borderRadius: Math.round(size * .28), background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 900, fontSize: size * .5, color: "white" }}>D</span>
    </div>
    <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 900, fontSize: size * .56, color: "#f0f6ff", letterSpacing: "-0.5px" }}>dangal</span>
  </div>
);

// ══════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════
const Toast = ({ msg }) => (
  <div className="pop" style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#07101e", border: "1px solid #0d1c2e", color: "#60a5fa", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, zIndex: 500, whiteSpace: "nowrap", boxShadow: "0 8px 30px rgba(0,0,0,.6)" }}>
    {msg}
  </div>
);

// ══════════════════════════════════════════════
//  ZAINCASH MODAL
// ══════════════════════════════════════════════
const ZainModal = ({ plan, onClose, onSuccess }) => {
  const [step, setStep] = useState(plan.price === 0 ? "free" : "phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [dots, setDots] = useState(1);

  useEffect(() => {
    if (step !== "proc") return;
    const a = setInterval(() => setDots(d => d < 3 ? d + 1 : 1), 500);
    const b = setTimeout(() => setStep("otp"), 2600);
    return () => { clearInterval(a); clearTimeout(b); };
  }, [step]);

  const submitPhone = () => {
    if (!/^07[3-9]\d{8}$/.test(phone.replace(/\s/g, ""))) { setErr("رقم غير صحيح — أدخل رقم زين كاش العراقي (07XXXXXXXXX)"); return; }
    setErr(""); setStep("proc");
  };
  const submitOtp = () => {
    if (otp !== "4321") { setErr("رمز غير صحيح — حاول مجدداً"); return; }
    setErr(""); setStep("done");
    setTimeout(() => { onSuccess(plan); onClose(); }, 1800);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal pop" onClick={e => e.stopPropagation()}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${plan.color},${plan.color}99)` }} />
        <div style={{ padding: "24px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${plan.color}18`, border: `1px solid ${plan.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: plan.color, fontWeight: 900 }}>{plan.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#f0f6ff" }}>خطة {plan.name}</div>
                <div style={{ fontSize: 13, color: plan.color, fontWeight: 700 }}>{fmtIQD(plan.price)}</div>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-gh" style={{ width: 28, height: 28, padding: 0, borderRadius: 7, fontSize: 13 }}>✕</button>
          </div>

          {step === "free" && (
            <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#f0f6ff", marginBottom: 8 }}>جاهز للانطلاق!</div>
              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8, marginBottom: 22 }}>لديك <strong style={{ color: "#f0f6ff" }}>24 ساعة</strong> كاملة على صفحة واحدة.<br />بدون بطاقة ائتمانية.</div>
              <button className="btn btn-pr" style={{ width: "100%", padding: 13, fontSize: 14 }} onClick={() => { onSuccess(plan); onClose(); }}>ابدأ التجربة الآن ◈</button>
            </div>
          )}

          {step === "phone" && (
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#006600,#00aa00)", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 900, color: "white", marginBottom: 16 }}>
                Z ZainCash — الدفع الآمن
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#374151", marginBottom: 5 }}>رقم هاتفك المسجل في زين كاش</div>
                <input className={`inp ${err ? "inp-err" : ""}`} placeholder="07XXXXXXXXX" maxLength={11} value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setErr(""); }} onKeyDown={e => e.key === "Enter" && submitPhone()} />
                {err && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 5 }}>⚠ {err}</div>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#374151", marginBottom: 16, padding: "10px 12px", background: "#040a14", borderRadius: 9 }}>
                <span>المبلغ الإجمالي</span>
                <span style={{ color: plan.color, fontWeight: 900 }}>{fmtIQD(plan.price)}</span>
              </div>
              <button className="btn btn-pr" style={{ width: "100%", padding: 13, fontSize: 14 }} onClick={submitPhone}>إرسال طلب الدفع →</button>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#1e3050" }}>🔒 دفع آمن ومشفر عبر ZainCash API</div>
            </div>
          )}

          {step === "proc" && (
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <div className="spin" />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f6ff" }}>جاري إرسال الطلب{".".repeat(dots)}</div>
              <div style={{ fontSize: 11, color: "#1e3050", marginTop: 6 }}>الاتصال بخوادم ZainCash</div>
              <div style={{ marginTop: 16, background: "#040a14", border: "1px solid #0b1828", borderRadius: 9, padding: "12px", textAlign: "right" }}>
                {["⚡ إنشاء طلب...", "🔐 تشفير البيانات...", "📡 إرسال لـ ZainCash..."].slice(0, dots + 1).map((l, i) => (
                  <div key={i} style={{ fontSize: 10, color: "#1e3050", marginBottom: 3, fontFamily: "monospace" }}>{l}</div>
                ))}
              </div>
            </div>
          )}

          {step === "otp" && (
            <div>
              <div style={{ background: "rgba(34,211,238,.06)", border: "1px solid rgba(34,211,238,.15)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#22d3ee", fontWeight: 700, marginBottom: 3 }}>📱 تم إرسال الرمز</div>
                <div style={{ fontSize: 11, color: "#374151" }}>راجع تطبيق ZainCash على رقم <strong style={{ color: "#f0f6ff" }}>{phone}</strong></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#374151", marginBottom: 5 }}>رمز التأكيد (4 أرقام)</div>
                <input className={`inp ${err ? "inp-err" : ""}`} placeholder="••••" maxLength={4} value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setErr(""); }} style={{ fontSize: 20, fontWeight: 900, letterSpacing: 8, textAlign: "center" }} onKeyDown={e => e.key === "Enter" && submitOtp()} />
                {err && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 5, textAlign: "center" }}>⚠ {err}</div>}
                <div style={{ fontSize: 10, color: "#1e3050", marginTop: 6, textAlign: "center" }}>تجريبي: الرمز هو <span style={{ color: "#7c3aed", fontWeight: 700 }}>4321</span></div>
              </div>
              <button className="btn btn-pr" style={{ width: "100%", padding: 13, fontSize: 14 }} onClick={submitOtp}>تأكيد الدفع ✓</button>
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#f0f6ff", marginBottom: 6 }}>{plan.price === 0 ? "التجربة فعّالة!" : "تم الاشتراك!"}</div>
              <div style={{ fontSize: 11, color: "#374151" }}>جاري تحويلك للوحة التحكم...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  LANDING PAGE
// ══════════════════════════════════════════════
const Landing = ({ onLogin, onSubscribe }) => {
  const [billing, setBilling] = useState("monthly");
  const [faq, setFaq] = useState(null);
  const EARLY_REMAINING = 47;

  const getPrice = p => {
    if (p.price === 0) return "مجاناً";
    if (billing === "yearly") return fmtIQD(Math.round(p.price * 0.7));
    return fmtIQD(p.price);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030508", direction: "rtl" }}>
      {/* Nav */}
      <nav style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #07101a", background: "#030508", position: "sticky", top: 0, zIndex: 50 }}>
        <Logo size={34} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#1e3050" }}>🇮🇶 العراق</span>
          <button className="btn btn-gh" style={{ padding: "8px 16px", fontSize: 12 }} onClick={onLogin}>تسجيل الدخول</button>
          <button className="btn btn-pr" style={{ padding: "8px 16px", fontSize: 12 }} onClick={() => onSubscribe(PLANS[0])}>ابدأ مجاناً ⚡</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 20px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse,rgba(124,58,237,.07),transparent 70%)", pointerEvents: "none" }} />
        <div className="fi tag tag-p" style={{ marginBottom: 22, fontSize: 11 }}>◈ &nbsp; رصد المنافسين — مخصص للسوق العراقي</div>
        <h1 className="fi d1" style={{ fontSize: "clamp(30px,6vw,54px)", fontWeight: 900, color: "#f0f6ff", lineHeight: 1.2, marginBottom: 16 }}>
          كن أول من يصل<br />
          <span style={{ background: "linear-gradient(135deg,#a78bfa,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>لعملاء منافسيك</span>
        </h1>
        <p className="fi d2" style={{ fontSize: 14, color: "#374151", maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.9 }}>
          رصد تعليقات فيسبوك وانستاجرام · رد تلقائي · وصول فوري للعملاء قبل المنافس
        </p>
        <div className="fi d3" style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
          {[{ v: "+500", l: "متجر يستخدمها" }, { v: "12ث", l: "متوسط وقت الرصد" }, { v: "FB+IG", l: "منصتان مدعومتان" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#f0f6ff" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: "#1e3050" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Early Bird Banner */}
        <div className="fi d4" style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.2)", borderRadius: 14, padding: "12px 20px", marginBottom: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fbbf24" }}>Early Bird — أول 50 مشترك فقط</div>
            <div style={{ fontSize: 11, color: "#374151" }}>100,000 IQD مرة واحدة — صفحات غير محدودة للأبد</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f0f6ff" }}>{EARLY_REMAINING}</div>
            <div style={{ fontSize: 10, color: "#1e3050" }}>مقعد متبقي</div>
          </div>
          <button className="btn btn-go" style={{ padding: "9px 18px", fontSize: 12 }} onClick={() => onSubscribe(PLANS[2])}>احجز مقعدك</button>
        </div>
      </div>

      {/* Billing Toggle */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ display: "inline-flex", background: "#060e1a", border: "1px solid #0b1828", borderRadius: 30, padding: 4, gap: 2 }}>
          {["monthly", "yearly"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ padding: "7px 22px", borderRadius: 26, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Cairo", color: billing === b ? "#60a5fa" : "#2d3f52", background: billing === b ? "#0d1e38" : "transparent", transition: "all .2s" }}>
              {b === "monthly" ? "شهري" : <>سنوي <span style={{ background: "rgba(16,185,129,.1)", color: "#34d399", borderRadius: 4, padding: "1px 5px", fontSize: 9 }}>وفّر 30%</span></>}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, maxWidth: 860, margin: "0 auto 70px", padding: "0 18px" }}>
        {PLANS.map((p, i) => (
          <div key={p.id} className={`plan-card fi d${i + 1} ${p.id === "earlybird" ? "hot" : ""}`}>
            {p.badge && <div className="tag tag-y" style={{ marginBottom: 14, fontSize: 10 }}>{p.badge}</div>}
            <div style={{ fontSize: 20, color: p.color, marginBottom: 6, fontWeight: 900 }}>{p.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#f0f6ff", marginBottom: 3 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: "#1e3050", marginBottom: 16 }}>{p.desc}</div>
            <div style={{ fontSize: p.price === 0 ? 22 : 20, fontWeight: 900, color: p.color, marginBottom: 3 }}>{getPrice(p)}</div>
            <div style={{ fontSize: 10, color: "#1e3050", marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid #080f1a" }}>{p.period}</div>
            {p.features.map((f, j) => {
              const off = typeof f === "object" && f.off;
              const txt = typeof f === "object" ? f.t : f;
              return (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: off ? "#070e18" : `${p.color}15`, border: `1px solid ${off ? "#0b1828" : p.color + "25"}`, fontSize: 8, fontWeight: 900, color: off ? "#1a2535" : p.color }}>
                    {off ? "–" : "✓"}
                  </div>
                  <span style={{ fontSize: 11, color: off ? "#1e3050" : "#64748b" }}>{txt}</span>
                </div>
              );
            })}
            <button className={`btn ${p.id === "earlybird" ? "btn-go" : p.id === "perpage" ? "btn-cy" : "btn-gh"}`} style={{ width: "100%", padding: 11, fontSize: 13, marginTop: 16 }} onClick={() => onSubscribe(p)}>
              {p.price === 0 ? "ابدأ مجاناً" : "اشترك الآن"}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #07101a", padding: "28px 20px", textAlign: "center" }}>
        <Logo size={28} />
        <div style={{ fontSize: 11, color: "#1e3050", marginTop: 10 }}>© 2026 dangal — العراق 🇮🇶 · ZainCash · FB + IG</div>
        <button className="btn btn-gh" style={{ marginTop: 12, padding: "6px 14px", fontSize: 11 }} onClick={onLogin}>دخول لوحة الأدمن</button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════
const Login = ({ onBack, onLogin }) => {
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!phone || !pass) { setErr("يرجى تعبئة جميع الحقول"); return; }
    setLoading(true); setErr("");
    setTimeout(() => {
      setLoading(false);
      if (phone === "admin" && pass === "admin") { onLogin("admin"); return; }
      if (phone.startsWith("07") && pass.length >= 4) { onLogin("user"); return; }
      setErr("بيانات غير صحيحة — جرّب: admin/admin أو 07XXXXXXXXX/1234");
    }, 1400);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030508", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, direction: "rtl" }}>
      <div className="fi" style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo size={38} />
          <div style={{ fontSize: 12, color: "#1e3050", marginTop: 8 }}>تسجيل الدخول لحسابك</div>
        </div>
        <div className="card">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#374151", marginBottom: 5 }}>رقم الهاتف أو اسم المستخدم</div>
            <input className="inp" placeholder="07XXXXXXXXX أو admin" value={phone} onChange={e => { setPhone(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#374151", marginBottom: 5 }}>كلمة المرور</div>
            <input className="inp" type="password" placeholder="••••••••" value={pass} onChange={e => { setPass(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          {err && <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 12, textAlign: "center" }}>⚠ {err}</div>}
          <button className="btn btn-pr" style={{ width: "100%", padding: 13, fontSize: 14 }} onClick={submit} disabled={loading}>
            {loading ? <><span className="spin" style={{ width: 16, height: 16, borderWidth: 2, display: "inline-block", verticalAlign: "middle", marginLeft: 6 }} />جاري التحقق...</> : "دخول →"}
          </button>
          <div className="dvd" />
          <div style={{ background: "rgba(56,189,248,.06)", border: "1px solid rgba(56,189,248,.12)", borderRadius: 9, padding: "10px 12px", fontSize: 11, color: "#22d3ee", lineHeight: 1.8 }}>
            💡 للتجربة:<br />
            <strong>مستخدم:</strong> 07XXXXXXX / 1234<br />
            <strong>أدمن:</strong> admin / admin
          </div>
        </div>
        <button className="btn btn-gh" style={{ width: "100%", marginTop: 12, padding: 10, fontSize: 12 }} onClick={onBack}>← العودة للصفحة الرئيسية</button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  USER DASHBOARD
// ══════════════════════════════════════════════
const Dashboard = ({ plan, onLogout }) => {
  const [tab, setTab] = useState("monitor");
  const [pages, setPages] = useState(INIT_PAGES_DATA);
  const [posts, setPosts] = useState(INIT_POSTS);
  const [template, setTemplate] = useState("مرحباً {name}! 👋\nلدينا عرض حصري لك أفضل من المنافسين.\nتواصل معنا الآن ✨");
  const [autoReply, setAutoReply] = useState(false);
  const [newPage, setNewPage] = useState("");
  const [sending, setSending] = useState(new Set());
  const [totalSent, setTotalSent] = useState(3);
  const [totalCaught, setTotalCaught] = useState(7);
  const [newFlash, setNewFlash] = useState(null);
  const [openPost, setOpenPost] = useState(null);
  const counterRef = useRef(0);

  // Simulation
  useEffect(() => {
    const t = setInterval(() => {
      const active = pages.filter(p => p.active);
      if (!active.length) return;
      counterRef.current++;
      if (counterRef.current % 3 !== 0) return;
      const pg = rnd(active);
      const name = rnd(NAMES);
      const comment = { id: `c${Date.now()}`, user: name, text: rnd(COMMENTS), time: Date.now(), sent: false };
      setPosts(prev => {
        const pp = prev.filter(p => p.pageId === pg.id);
        if (pp.length > 0) {
          const target = rnd(pp);
          return prev.map(p => p.id === target.id ? { ...p, comments: [{ ...comment, postId: p.id }, ...p.comments.slice(0, 9)] } : p);
        }
        const np = { id: `pp${Date.now()}`, pageId: pg.id, pageName: pg.name, icon: pg.icon, color: pg.color, content: rnd(POST_CONTENTS), time: Date.now() - Math.floor(Math.random() * 3600000), likes: Math.floor(Math.random() * 200) + 20, shares: Math.floor(Math.random() * 30), comments: [{ ...comment, postId: `pp${Date.now()}` }] };
        return [...prev, np];
      });
      setTotalCaught(c => c + 1);
      setNewFlash(name);
      setPages(prev => prev.map(p => p.id === pg.id ? { ...p, caught: p.caught + 1 } : p));
      setTimeout(() => setNewFlash(null), 2500);
      if (autoReply) setTimeout(() => { setSending(s => new Set([...s, comment.id])); setTimeout(() => { setPosts(prev => prev.map(p => ({ ...p, comments: p.comments.map(c => c.id === comment.id ? { ...c, sent: true } : c) }))); setSending(s => { const ns = new Set(s); ns.delete(comment.id); return ns; }); setTotalSent(t => t + 1); }, 1500); }, 3000);
    }, 4000);
    return () => clearInterval(t);
  }, [pages, autoReply]);

  const sendOne = (postId, cId) => {
    setSending(s => new Set([...s, cId]));
    setTimeout(() => {
      setPosts(p => p.map(po => po.id !== postId ? po : { ...po, comments: po.comments.map(c => c.id === cId ? { ...c, sent: true } : c) }));
      setSending(s => { const n = new Set(s); n.delete(cId); return n; });
      setTotalSent(t => t + 1);
    }, 1200);
  };

  const sendAll = () => posts.forEach(p => p.comments.filter(c => !c.sent).forEach((c, i) => setTimeout(() => sendOne(p.id, c.id), i * 400)));
  const allUnsent = posts.flatMap(p => p.comments.filter(c => !c.sent));

  const NAV = [{ id: "monitor", l: "المراقبة", icon: "◆" }, { id: "pages", l: "الصفحات", icon: "◉" }, { id: "settings", l: "الإعدادات", icon: "⚙" }];

  return (
    <div style={{ minHeight: "100vh", background: "#030508", direction: "rtl", display: "flex", flexDirection: "column" }}>
      {/* Top */}
      <div style={{ background: "#04080f", borderBottom: "1px solid #080f1a", padding: "11px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <Logo size={30} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {newFlash && <div className="slide tag tag-y" style={{ fontSize: 11 }}>🆕 {newFlash}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#34d399" }}>
            <span className="dot-live" />{totalCaught} رُصد
          </div>
          <div className="tag tag-p" style={{ fontSize: 10 }}>{plan?.name || "تجريبي"}</div>
          <button className="btn btn-gh" style={{ padding: "6px 12px", fontSize: 11 }} onClick={onLogout}>خروج</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: 160, background: "#04080f", borderLeft: "1px solid #080f1a", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
          {NAV.map(n => (
            <button key={n.id} className={`nav-btn ${tab === n.id ? "on" : ""}`} onClick={() => setTab(n.id)}>
              <span style={{ fontSize: 12, color: tab === n.id ? "#60a5fa" : "#1e3050" }}>{n.icon}</span>{n.l}
            </button>
          ))}
          <div style={{ marginTop: "auto" }}>
            <div className="dvd" />
            <div style={{ padding: "8px 6px" }}>
              <div style={{ fontSize: 10, color: "#1e3050", marginBottom: 4 }}>اليوم</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 900, color: "#34d399" }}>{totalSent}</div><div style={{ fontSize: 9, color: "#1e3050" }}>أُرسل</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 900, color: "#f87171" }}>{allUnsent.length}</div><div style={{ fontSize: 9, color: "#1e3050" }}>ينتظر</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "18px 16px" }}>

          {tab === "monitor" && (
            <div className="fi">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 900, color: "#f0f6ff" }}>المنشورات المرصودة</h2>
                {allUnsent.length > 0 && <button className="btn btn-pr" style={{ padding: "7px 14px", fontSize: 12 }} onClick={sendAll}>⚡ إرسال الكل ({allUnsent.length})</button>}
              </div>
              {posts.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "40px 0", color: "#1e3050" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
                  <div style={{ fontSize: 12 }}>جاري الرصد... تعليق جديد كل ~12 ثانية</div>
                </div>
              ) : posts.map(post => {
                const unsent = post.comments.filter(c => !c.sent).length;
                const open = openPost === post.id;
                return (
                  <div key={post.id} className="card" style={{ marginBottom: 10, cursor: "pointer", borderColor: open ? "#1e3050" : "#0d1c2e" }} onClick={() => setOpenPost(open ? null : post.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${post.color}15`, border: `1px solid ${post.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{post.icon}</div>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{post.pageName}</div><div style={{ fontSize: 10, color: "#1e3050" }}>{fmtT(post.time)} مضى</div></div>
                      {unsent > 0 && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <span className="tag tag-r">{unsent} جديد</span>
                          <button className="btn btn-gn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={e => { e.stopPropagation(); post.comments.filter(c => !c.sent).forEach((c, i) => setTimeout(() => sendOne(post.id, c.id), i * 350)); }}>إرسال الكل</button>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", background: "#040a14", borderRadius: 8, padding: "8px 11px", marginBottom: 8, borderRight: `3px solid ${post.color}`, lineHeight: 1.6 }}>{post.content}</div>
                    <div style={{ fontSize: 11, color: "#1e3050" }}>❤️ {post.likes} · 💬 {post.comments.length} · {open ? "▲ إخفاء" : "▼ التعليقات"}</div>
                    {open && (
                      <div style={{ marginTop: 12, borderTop: "1px solid #070e18", paddingTop: 10 }} onClick={e => e.stopPropagation()}>
                        {post.comments.length === 0
                          ? <div style={{ fontSize: 11, color: "#1e3050", textAlign: "center", padding: "10px 0" }}>لا تعليقات بعد</div>
                          : post.comments.map(c => (
                            <div key={c.id} className={`card-sm ${newFlash === c.user && !c.sent ? "flash" : ""}`} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                              <div style={{ width: 26, height: 26, borderRadius: 7, background: "#070e18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#60a5fa", flexShrink: 0 }}>{c.user[0]}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{c.user}</div>
                                <div style={{ fontSize: 11, color: "#374151" }}>{c.text}</div>
                              </div>
                              {c.sent ? <span className="tag tag-g" style={{ fontSize: 10 }}>✓ أُرسل</span>
                                : sending.has(c.id) ? <span className="tag tag-y" style={{ fontSize: 10 }}>⏳</span>
                                  : <button className="btn btn-pr" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => sendOne(post.id, c.id)}>إرسال</button>}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "pages" && (
            <div className="fi">
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#f0f6ff", marginBottom: 14 }}>صفحات المنافسين</h2>
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#374151", marginBottom: 8 }}>➕ إضافة صفحة</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="inp" placeholder="اسم الصفحة أو رابطها..." value={newPage} onChange={e => setNewPage(e.target.value)} onKeyDown={e => e.key === "Enter" && newPage.trim() && (setPages(p => [...p, { id: `p${Date.now()}`, name: newPage, icon: "📄", color: "#60a5fa", active: true, caught: 0 }]), setNewPage(""))} />
                  <button className="btn btn-pr" style={{ padding: "9px 16px", fontSize: 12, flexShrink: 0 }} onClick={() => { if (!newPage.trim()) return; setPages(p => [...p, { id: `p${Date.now()}`, name: newPage, icon: "📄", color: "#60a5fa", active: true, caught: 0 }]); setNewPage(""); }}>+ إضافة</button>
                </div>
              </div>
              {pages.map(p => (
                <div key={p.id} className="card-sm" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${p.color}15`, border: `1px solid ${p.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#1e3050" }}>💬 {p.caught} تعليق مرصود</div>
                  </div>
                  <button className="tog" style={{ background: p.active ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#0b1828" }} onClick={() => setPages(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x))}>
                    <div className="tok" style={{ left: p.active ? 19 : 2.5 }} />
                  </button>
                  <button className="btn btn-rd" style={{ padding: "5px 9px", fontSize: 12 }} onClick={() => setPages(prev => prev.filter(x => x.id !== p.id))}>✕</button>
                </div>
              ))}
            </div>
          )}

          {tab === "settings" && (
            <div className="fi">
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#f0f6ff", marginBottom: 14 }}>الإعدادات</h2>
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#374151", marginBottom: 4 }}>📝 قالب الرد التلقائي</div>
                <div style={{ fontSize: 10, color: "#1e3050", marginBottom: 8 }}>متغير: <code style={{ background: "#040a14", padding: "1px 5px", borderRadius: 4, color: "#60a5fa" }}>{"{name}"}</code></div>
                <textarea className="ta" value={template} onChange={e => setTemplate(e.target.value)} rows={5} />
                <div className="dvd" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>الإرسال التلقائي</div>
                    <div style={{ fontSize: 10, color: "#1e3050" }}>يُرسل رد فور رصد تعليق جديد</div>
                  </div>
                  <button className="tog" style={{ background: autoReply ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#0b1828" }} onClick={() => setAutoReply(v => !v)}>
                    <div className="tok" style={{ left: autoReply ? 19 : 2.5 }} />
                  </button>
                </div>
              </div>
              <div className="card" style={{ background: "rgba(16,185,129,.04)", borderColor: "rgba(16,185,129,.12)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#34d399", marginBottom: 10 }}>📱 الجهاز الحالي</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>مسجّل دخول من جهاز واحد فقط</div>
                <div style={{ fontSize: 10, color: "#1e3050", marginTop: 4 }}>عند الدخول من جهاز آخر سيُطرد هذا الجهاز تلقائياً</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  ADMIN PANEL
// ══════════════════════════════════════════════
const Admin = ({ onLogout }) => {
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState(ADMIN_USERS);
  const [sel, setSel] = useState(null);
  const [liveR, setLiveR] = useState(47);
  const [fbOn, setFbOn] = useState(true);
  const [igOn, setIgOn] = useState(true);

  useEffect(() => { const t = setInterval(() => setLiveR(r => r + Math.floor(Math.random() * 2)), 7000); return () => clearInterval(t); }, []);

  const totalRev = users.reduce((a, u) => a + u.paid, 0);
  const earlyCount = users.filter(u => u.plan === "earlybird").length;

  const NAV = [{ id: "overview", l: "نظرة عامة" }, { id: "users", l: "المستخدمون" }, { id: "platforms", l: "المنصات" }, { id: "pricing", l: "الإيرادات" }];

  const SS = { active: { c: "#34d399", b: "rgba(16,185,129,.1)", l: "نشط" }, suspended: { c: "#f87171", b: "rgba(239,68,68,.1)", l: "موقوف" }, trial: { c: "#fbbf24", b: "rgba(251,191,36,.1)", l: "تجريبي" } };

  return (
    <div style={{ minHeight: "100vh", background: "#030508", direction: "rtl", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#04080f", borderBottom: "1px solid #080f1a", padding: "11px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={30} />
          <span className="tag tag-r" style={{ fontSize: 10 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#34d399" }}><span className="dot-live" />{liveR} رد اليوم</div>
          <button className="btn btn-gh" style={{ padding: "6px 12px", fontSize: 11 }} onClick={onLogout}>خروج</button>
        </div>
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ width: 160, background: "#04080f", borderLeft: "1px solid #080f1a", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
          {NAV.map(n => <button key={n.id} className={`nav-btn ${tab === n.id ? "on" : ""}`} onClick={() => setTab(n.id)}>{n.l}</button>)}
          <div style={{ marginTop: "auto", padding: "10px 6px" }}>
            <div style={{ background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.15)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 700, marginBottom: 4 }}>🔥 Early Bird</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#f0f6ff" }}>{earlyCount}<span style={{ fontSize: 11, color: "#1e3050" }}>/50</span></div>
              <div style={{ height: 4, background: "#070e18", borderRadius: 2, marginTop: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(earlyCount / 50) * 100}%`, background: "linear-gradient(90deg,#f59e0b,#ef4444)", borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, color: "#1e3050", marginTop: 4 }}>{50 - earlyCount} متبقي</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "18px 16px" }}>

          {tab === "overview" && (
            <div className="fi">
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#f0f6ff", marginBottom: 14 }}>لوحة التحكم الأم</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 14 }}>
                {[
                  { l: "الإيرادات", v: fmtIQD(totalRev), c: "#34d399", i: "💰" },
                  { l: "مستخدمون نشطون", v: users.filter(u => u.status === "active").length, c: "#60a5fa", i: "◉" },
                  { l: "صفحات مراقَبة", v: users.reduce((a, u) => a + u.pages, 0), c: "#a78bfa", i: "◆" },
                  { l: "ردود اليوم", v: liveR, c: "#fbbf24", i: "⚡" },
                ].map((s, i) => (
                  <div key={i} className="card-sm" style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: 10, left: 10, fontSize: 18, opacity: .4 }}>{s.i}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 10 }}>حالة المنصات</div>
                {[{ n: "Facebook", icon: "📘", on: fbOn, set: setFbOn }, { n: "Instagram", icon: "📸", on: igOn, set: setIgOn }].map((p, i) => (
                  <div key={i} className="row">
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{p.n}</span>
                    <span className={`tag ${p.on ? "tag-g" : "tag-r"}`} style={{ fontSize: 10 }}>{p.on ? "● نشط" : "● متوقف"}</span>
                    <button className="tog" style={{ background: p.on ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#0b1828" }} onClick={() => p.set(v => !v)}>
                      <div className="tok" style={{ left: p.on ? 19 : 2.5 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="fi">
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#f0f6ff", marginBottom: 14 }}>المستخدمون ({users.length})</h2>
              <div className="card">
                {users.map(u => {
                  const ss = SS[u.status];
                  return (
                    <div key={u.id} className="row row-cl" onClick={() => setSel(u)}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{u.name}</div>
                        <div style={{ fontSize: 10, color: "#1e3050" }}>{u.phone} · {u.device}</div>
                      </div>
                      <span className="tag tag-y" style={{ fontSize: 9 }}>{u.plan === "earlybird" ? "🔥 EB" : "📄 لكل صفحة"}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: "#60a5fa" }}>{u.pages}📄</span>
                      <span className="tag" style={{ background: ss.b, color: ss.c, border: `1px solid ${ss.c}30`, fontSize: 10 }}>{ss.l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "platforms" && (
            <div className="fi">
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#f0f6ff", marginBottom: 14 }}>المنصات المدعومة</h2>
              {[
                { n: "Facebook", icon: "📘", color: "#1877f2", on: fbOn, set: setFbOn, users: 5, api: "Graph API v19.0 · pages_messaging · pages_read_engagement" },
                { n: "Instagram", icon: "📸", color: "#e1306c", on: igOn, set: setIgOn, users: 4, api: "Instagram Graph API · instagram_manage_comments · instagram_basic" },
              ].map(p => (
                <div key={p.n} className="card" style={{ marginBottom: 10, borderColor: p.on ? p.color + "20" : "#0d1c2e" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 26 }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#f0f6ff" }}>{p.n}</div>
                      <div style={{ fontSize: 10, color: "#1e3050" }}>{p.users} مستخدم · {p.on ? "نشط" : "متوقف"}</div>
                    </div>
                    <button className="tog" style={{ background: p.on ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#0b1828" }} onClick={() => p.set(v => !v)}>
                      <div className="tok" style={{ left: p.on ? 19 : 2.5 }} />
                    </button>
                  </div>
                  <div style={{ background: "#040a14", borderRadius: 8, padding: "8px 12px", fontSize: 10, color: "#1e3050", fontFamily: "monospace" }}>🔌 {p.api}</div>
                </div>
              ))}
              <div className="card" style={{ background: "rgba(79,70,229,.04)", borderColor: "rgba(79,70,229,.12)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>✅ dangal يدعم Facebook + Instagram معاً</div>
                <div style={{ fontSize: 11, color: "#1e3050", lineHeight: 1.8 }}>نفس التوكن، نفس الاشتراك، نفس الواجهة — المستخدم يختار ما يريد مراقبته.</div>
              </div>
            </div>
          )}

          {tab === "pricing" && (
            <div className="fi">
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#f0f6ff", marginBottom: 14 }}>الإيرادات</h2>
              <div className="card" style={{ marginBottom: 12 }}>
                {[
                  { l: `Early Bird × ${earlyCount}`, v: fmtIQD(earlyCount * 100000), c: "#fbbf24" },
                  { l: `لكل صفحة × ${users.filter(u => u.plan === "perpage").reduce((a, u) => a + u.pages, 0)}`, v: fmtIQD(users.filter(u => u.plan === "perpage").reduce((a, u) => a + u.paid, 0)), c: "#60a5fa" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i === 0 ? "1px solid #080f1a" : "none" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{r.l}</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: r.c }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", borderTop: "1px solid #0d1c2e", marginTop: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>الإجمالي</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#34d399" }}>{fmtIQD(totalRev)}</span>
                </div>
              </div>
              <div className="card" style={{ background: "rgba(251,191,36,.04)", borderColor: "rgba(251,191,36,.12)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", marginBottom: 8 }}>🔥 Early Bird</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                  <span>المباعة</span><span style={{ color: "#fbbf24" }}>{earlyCount}/50</span>
                </div>
                <div style={{ height: 6, background: "#070e18", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(earlyCount / 50) * 100}%`, background: "linear-gradient(90deg,#f59e0b,#ef4444)", borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: "#1e3050", marginTop: 6 }}>إيراد Early Bird: {fmtIQD(earlyCount * 100000)} — متبقي {50 - earlyCount} مقعد</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User detail modal */}
      {sel && (
        <div className="modal-bg" onClick={() => setSel(null)}>
          <div className="modal pop" onClick={e => e.stopPropagation()}>
            <div style={{ height: 3, background: "linear-gradient(90deg,#4f46e5,#7c3aed)" }} />
            <div style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div><div style={{ fontSize: 15, fontWeight: 900, color: "#f0f6ff" }}>{sel.name}</div><div style={{ fontSize: 11, color: "#1e3050" }}>{sel.phone}</div></div>
                <button onClick={() => setSel(null)} className="btn btn-gh" style={{ width: 27, height: 27, padding: 0, borderRadius: 7, fontSize: 12 }}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[{ l: "الخطة", v: sel.plan === "earlybird" ? "🔥 Early Bird" : "📄 لكل صفحة" }, { l: "المدفوع", v: fmtIQD(sel.paid) }, { l: "الصفحات", v: sel.pages }, { l: "الجهاز", v: sel.device }].map((s, i) => (
                  <div key={i} className="card-sm"><div style={{ fontSize: 9, color: "#1e3050", marginBottom: 3 }}>{s.l}</div><div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{s.v}</div></div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
                {["fb", "ig"].map(p => <span key={p} className={`tag ${sel.platforms.includes(p) ? "tag-p" : ""}`} style={{ fontSize: 11, opacity: sel.platforms.includes(p) ? 1 : .3 }}>{p === "fb" ? "📘 FB" : "📸 IG"}</span>)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-rd" style={{ flex: 1, padding: "9px" }} onClick={() => { setUsers(prev => prev.map(u => u.id === sel.id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u)); setSel(null); }}>
                  {sel.status === "active" ? "تعليق الحساب" : "رفع التعليق"}
                </button>
                <button className="btn btn-yl" style={{ flex: 1, padding: "9px" }} onClick={() => { setUsers(prev => prev.map(u => u.id === sel.id ? { ...u, device: "—" } : u)); setSel(null); }}>
                  📱 طرد الجهاز
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("landing"); // landing | login | dashboard | admin
  const [activePlan, setActivePlan] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [toast, setToast] = useState(null);
  const toastRef = useRef();

  const showToast = useCallback((msg) => {
    clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSubscribe = (plan) => setPayModal(plan);

  const handlePaySuccess = (plan) => {
    setActivePlan(plan);
    setPayModal(null);
    showToast(plan.price === 0 ? "⚡ التجربة فعّالة! أهلاً في dangal" : `🎉 تم الاشتراك في خطة ${plan.name}`);
    setTimeout(() => setView("dashboard"), 500);
  };

  const handleLogin = (role) => {
    if (role === "admin") {
      showToast("👑 أهلاً في لوحة التحكم الأم");
      setTimeout(() => setView("admin"), 300);
    } else {
      setActivePlan(PLANS[0]);
      showToast("✅ تم تسجيل الدخول بنجاح");
      setTimeout(() => setView("dashboard"), 300);
    }
  };

  const handleLogout = () => {
    setView("landing");
    setActivePlan(null);
    showToast("👋 تم تسجيل الخروج");
  };

  return (
    <>
      <style>{CSS}</style>
      {view === "landing" && <Landing onLogin={() => setView("login")} onSubscribe={handleSubscribe} />}
      {view === "login" && <Login onBack={() => setView("landing")} onLogin={handleLogin} />}
      {view === "dashboard" && <Dashboard plan={activePlan} onLogout={handleLogout} />}
      {view === "admin" && <Admin onLogout={handleLogout} />}
      {payModal && <ZainModal plan={payModal} onClose={() => setPayModal(null)} onSuccess={handlePaySuccess} />}
      {toast && <Toast msg={toast} />}
    </>
  );
}
