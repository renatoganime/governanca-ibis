import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ════════════════════════════════════════
// SUPABASE — COLE SUAS CREDENCIAIS AQUI
// ════════════════════════════════════════
const SUPABASE_URL = "https://wpanomdbqersqhqnjban.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYW5vbWRicWVyc3FocW5qYmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNDMwNjMsImV4cCI6MjA5MTkxOTA2M30.Kp9i_CfhhPDCo0BYWLmoiGuSAoAcxvctsQahS9X2eX8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ════════════════════════════════════════
// DADOS ESTÁTICOS
// ════════════════════════════════════════
const ROOMS_BY_SECTION = {
  "1": ["0138","0139","0141","0142","0143","0144","0145","0146","0147","0148","0149","0150","0151","0152","0153","0154","0155","0157","0159","0161","0163","0165","0167","0168","0169","0170","0171","0172","0173","0174","0175","0176","0177","0178","0179","0180","0181","0182","0183","0184","0185","0186","0187","0188","0189","0190","0191","0192","0193","0194","0195","0196","0197","0199"],
  "2": ["0238","0239","0241","0242","0243","0244","0245","0246","0247","0248","0249","0250","0251","0252","0253","0254","0255","0257","0259","0261","0263","0265","0267","0268","0269","0270","0271","0272","0273","0274","0275","0276","0277","0278","0279","0280","0281","0282","0283","0284","0285","0286","0287","0288","0289","0290","0291","0292","0293","0294","0295","0296","0297","0299"],
  "3": ["0338","0339","0341","0342","0343","0344","0345","0346","0347","0348","0349","0350","0351","0352","0353","0354","0355","0357","0359","0361","0363","0365","0367","0368","0369","0370","0371","0372","0373","0374","0375","0376","0377","0378","0379","0380","0381","0382","0383","0384","0385","0386","0387","0388","0389","0390","0391","0392","0393","0394","0395","0396","0397","0399"],
  "4": ["0438","0439","0441","0442","0443","0444","0445","0446","0447","0448","0449","0450","0451","0452","0453","0454","0455","0457","0459","0461","0463","0465","0467","0468","0469","0470","0471","0472","0473","0474","0475","0476","0477","0478","0479","0480","0481","0482","0483","0484","0485","0486","0487","0488","0489","0490","0491","0492","0493","0494","0495","0496","0497","0499"],
  "5": ["0538","0539","0541","0542","0543","0544","0545","0546","0547","0548","0549","0550","0551","0552","0553","0554","0555","0557","0559","0561","0563","0565","0567","0568","0569","0570","0571","0572","0573","0574","0575","0576","0577","0578","0579","0580","0581","0582","0583","0584","0585","0586","0587","0588","0589","0590","0591","0592","0593","0594","0595","0596","0597","0599"],
};
const ALL_ROOMS = Object.values(ROOMS_BY_SECTION).flat();

const DEFAULT_STATUS = [
  { value: "VL", label: "Vago Limpo", color: "#22c55e", bg: "#f0fdf4", icon: "🟢" },
  { value: "OL", label: "Ocupado Limpo", color: "#3b82f6", bg: "#eff6ff", icon: "🔵" },
  { value: "NP", label: "Não Perturbe", color: "#f59e0b", bg: "#fffbeb", icon: "🟡" },
  { value: "VS", label: "Vago Sujo", color: "#ef4444", bg: "#fef2f2", icon: "🔴" },
  { value: "OS", label: "Ocupado Sujo", color: "#a16207", bg: "#fef3c7", icon: "🟤" },
];
const DEFAULT_ENXOVAL = [
  { key: "lencol", label: "Lençol" },{ key: "fronha", label: "Fronha" },
  { key: "toalha_banho", label: "Toa. Banho" },{ key: "toalha_rosto", label: "Toa. Rosto" },
  { key: "toalha_piso", label: "Toa. Piso" },{ key: "edredom", label: "Edredom" },
  { key: "protetor", label: "Prot. Colchão" },{ key: "cobertor", label: "Cobertor" },
  { key: "travesseiro", label: "Travesseiro" },
];
const ICON_COLORS = ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316"];
const ICON_EMOJIS = ["🟢","🔵","🟡","🔴","🟣","🩷","🟤","🟠"];

function todayStr() { return new Date().toLocaleDateString("pt-BR"); }
function nowTime() { return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
function nowISO() { return new Date().toISOString(); }

function getDatasDisp(records, filterFn) {
  const recs = filterFn ? records.filter(filterFn) : records;
  const ds = [...new Set(recs.map(r => r.data))].sort((a, b) => {
    const [da,ma,ya] = a.split("/"); const [db,mb,yb] = b.split("/");
    return new Date(yb,mb-1,db) - new Date(ya,ma-1,da);
  });
  if (!ds.includes(todayStr())) ds.unshift(todayStr());
  return ds;
}

// ════════════════════════════════════════
// SUPABASE HELPERS
// ════════════════════════════════════════
async function loadRecords() {
  const { data, error } = await supabase.from("registros").select("*").order("timestamp", { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(r => ({ ...r, enxoval: r.enxoval || {} }));
}

async function insertRecord(rec) {
  const { error } = await supabase.from("registros").insert([rec]);
  if (error) console.error("insert:", error);
}

async function updateRecord(id, updates) {
  const { error } = await supabase.from("registros").update(updates).eq("id", id);
  if (error) console.error("update:", error);
}

async function deleteRecordDB(id) {
  const { error } = await supabase.from("registros").delete().eq("id", id);
  if (error) console.error("delete:", error);
}

async function loadConfig(chave) {
  const { data, error } = await supabase.from("config").select("valor").eq("chave", chave).single();
  if (error || !data) return null;
  return data.valor;
}

async function saveConfig(chave, valor) {
  const { error } = await supabase.from("config").upsert({ chave, valor });
  if (error) console.error("saveConfig:", error);
}

// ════════════════════════════════════════
// HEADER
// ════════════════════════════════════════
function Header({ page, setPage }) {
  const tabs = [
    { id: "registro", icon: "📝", label: "Registro" },
    { id: "painel",   icon: "📋", label: "Painel" },
    { id: "manut",    icon: "🔧", label: "Manut." },
    { id: "dash",     icon: "📊", label: "Dash" },
    { id: "config",   icon: "⚙️", label: "Config" },
  ];
  return (
    <div style={{ background: "linear-gradient(135deg,#1e3a5f 0%,#0f2440 100%)", padding: "12px 10px 6px", color: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ marginBottom: 8, paddingLeft: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Ibis Budget Guarulhos</div>
        <div style={{ fontSize: 10, opacity: 0.7 }}>Controle de Governança • {todayStr()}</div>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setPage(t.id)} style={{
            flex: 1, padding: "5px 2px 4px", border: "none", borderRadius: 8,
            background: page === t.id ? "rgba(255,255,255,0.2)" : "transparent",
            color: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: page === t.id ? 700 : 400, opacity: page === t.id ? 1 : 0.7 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// ROOM SELECTOR
// ════════════════════════════════════════
function RoomSelector({ quarto, setQuarto, onConfirm, records, statusList }) {
  const [mode, setMode] = useState("type");
  const [andar, setAndar] = useState("1");
  const [search, setSearch] = useState("");

  const lastStatusByRoom = {};
  records.filter(r => r.data === todayStr()).forEach(r => {
    if (!lastStatusByRoom[r.quarto] || r.timestamp > lastStatusByRoom[r.quarto].timestamp) {
      lastStatusByRoom[r.quarto] = r;
    }
  });

  const fRooms = (ROOMS_BY_SECTION[andar]||[]).filter(r => search ? r.includes(search) : true);
  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 600, color: "#334155", display: "block", marginBottom: 8 }}>1️⃣ Número do Quarto</label>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
        {[["type","⌨️ Digitar"],["grid","🏨 Por Andar"]].map(([m,l]) => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 8, background: mode===m?"#1e3a5f":"transparent", color: mode===m?"#fff":"#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      {mode === "type" ? (
        <>
          <input type="text" inputMode="numeric" value={quarto} onChange={e => { const v=e.target.value.replace(/\D/g,""); setQuarto(v.slice(0,4)); }} placeholder="Ex: 0141"
            style={{ width: "100%", padding: 16, fontSize: 28, fontWeight: 700, border: "2px solid #e2e8f0", borderRadius: 12, textAlign: "center", outline: "none", boxSizing: "border-box", letterSpacing: 4 }}
          />
          {quarto && quarto.length >= 3 && !ALL_ROOMS.includes(quarto.padStart(4,"0")) && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 6, textAlign: "center" }}>⚠️ Quarto não encontrado</div>}
          {quarto && lastStatusByRoom[quarto.padStart(4,"0")] && (
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, textAlign: "center" }}>
              Último status: <b>{statusList.find(s => s.value === lastStatusByRoom[quarto.padStart(4,"0")].status)?.label || lastStatusByRoom[quarto.padStart(4,"0")].status}</b> às {lastStatusByRoom[quarto.padStart(4,"0")].hora}
            </div>
          )}
          <button onClick={() => { const p=quarto.padStart(4,"0"); setQuarto(p); onConfirm(p); }} disabled={!quarto} style={{ width: "100%", marginTop: 12, padding: 14, border: "none", borderRadius: 12, background: quarto?"#1e3a5f":"#cbd5e1", color: "#fff", fontSize: 16, fontWeight: 700, cursor: quarto?"pointer":"default" }}>Próximo →</button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {Object.keys(ROOMS_BY_SECTION).map(s => (
              <button key={s} onClick={() => setAndar(s)} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 8, background: andar===s?"#1e3a5f":"#e2e8f0", color: andar===s?"#fff":"#475569", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{s}°</button>
            ))}
          </div>
          <input type="text" inputMode="numeric" value={search} onChange={e => setSearch(e.target.value.replace(/\D/g,""))} placeholder="🔍 Filtrar..."
            style={{ width: "100%", padding: 10, fontSize: 14, border: "1px solid #e2e8f0", borderRadius: 10, outline: "none", boxSizing: "border-box", marginBottom: 10 }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4, maxHeight: 280, overflowY: "auto", padding: 2 }}>
            {fRooms.map(room => {
              const last = lastStatusByRoom[room];
              const st = last ? statusList.find(s => s.value === last.status) : null;
              return <button key={room} onClick={() => { setQuarto(room); onConfirm(room); }} style={{
                padding: "10px 2px", borderRadius: 8,
                background: st ? st.bg : "#f8fafc", color: st ? st.color : "#334155",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: st ? `1px solid ${st.color}` : "1px solid #e2e8f0", position: "relative",
              }}>
                {room.replace(/^0/,"")}
                {st && <span style={{ position: "absolute", top: -4, right: -4, fontSize: 9, background: "#fff", borderRadius: 4, padding: "1px 3px", border: `1px solid ${st.color}`, color: st.color, fontWeight: 800 }}>{st.value}</span>}
              </button>;
            })}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8, textAlign: "center" }}>
            Cor do quarto = último status registrado hoje
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// REGISTRO
// ════════════════════════════════════════
function RegistroPage({ records, reload, statusList, enxovalList, camareirasList }) {
  const [cam, setCam] = useState("");
  const [ok, setOk] = useState(false);
  const [quarto, setQuarto] = useState("");
  const [status, setStatus] = useState("");
  const [enxoval, setEnxoval] = useState({});
  const [manut, setManut] = useState("");
  const [msg, setMsg] = useState("");
  const [step, setStep] = useState(1);

  if (!ok) return (
    <div style={{ padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "#1e3a5f" }}>Quem está registrando?</div>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Digite seu nome para começar</div>
        <input type="text" value={cam} onChange={e => setCam(e.target.value)} placeholder="Seu nome" autoCapitalize="words"
          style={{ width: "100%", padding: 16, fontSize: 20, fontWeight: 600, border: "2px solid #e2e8f0", borderRadius: 12, textAlign: "center", outline: "none", boxSizing: "border-box" }}
          onKeyDown={e => e.key === "Enter" && cam.trim() && setOk(true)}
        />
        {camareirasList.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Ou selecione:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {camareirasList.map(n => <button key={n} onClick={() => { setCam(n); setOk(true); }} style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", color: "#334155", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{n}</button>)}
            </div>
          </div>
        )}
        <button onClick={() => cam.trim() && setOk(true)} disabled={!cam.trim()} style={{ width: "100%", marginTop: 12, padding: 14, border: "none", borderRadius: 12, background: cam.trim()?"#1e3a5f":"#cbd5e1", color: "#fff", fontSize: 16, fontWeight: 700, cursor: cam.trim()?"pointer":"default" }}>Começar →</button>
      </div>
    </div>
  );

  const submit = async () => {
    if (!quarto || !status) return;
    const rec = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      camareira: cam.trim(), quarto, status,
      enxoval: { ...enxoval }, manutencao: manut.trim(),
      data: todayStr(), hora: nowTime(), timestamp: nowISO(),
      liberado: false, liberado_hora: "", liberado_por: "",
      repasse: false, repasse_hora: "", repasse_por: "",
      manut_resolvido: false, manut_tipo: "", manut_resolvido_por: "", manut_resolvido_hora: "",
    };
    await insertRecord(rec);
    await reload();
    setMsg(`✅ Quarto ${quarto} registrado!`); setQuarto(""); setStatus(""); setEnxoval({}); setManut(""); setStep(1);
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div style={{ padding: 16 }}>
      {msg && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: 14, marginBottom: 12, textAlign: "center", fontSize: 15, fontWeight: 600, color: "#166534" }}>{msg}</div>}
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f" }}>👤 {cam.trim()}</div>
          <button onClick={() => { setOk(false); setCam(""); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#64748b", cursor: "pointer" }}>Trocar</button>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>{[1,2,3,4].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? "#1e3a5f" : "#e2e8f0" }} />)}</div>

        {step === 1 && <RoomSelector quarto={quarto} setQuarto={setQuarto} onConfirm={r => { setQuarto(r); setStep(2); }} records={records} statusList={statusList} />}

        {step === 2 && <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: "#334155", display: "block", marginBottom: 8 }}>2️⃣ Status — {quarto}</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {statusList.map(o => <button key={o.value} onClick={() => { setStatus(o.value); setStep(3); }} style={{ padding: 18, border: `2px solid ${status===o.value?o.color:"#e2e8f0"}`, borderRadius: 12, background: status===o.value?o.bg:"#fff", color: o.color, fontSize: 18, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>{o.icon} {o.label}</button>)}
          </div>
          <button onClick={() => setStep(1)} style={{ width: "100%", marginTop: 8, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#64748b", fontSize: 14, cursor: "pointer" }}>← Voltar</button>
        </div>}

        {step === 3 && <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>3️⃣ Enxoval — {quarto}</label>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Quantidade (0 se não retirou)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {enxovalList.map(it => (
              <div key={it.key} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", border: (enxoval[it.key]||0)>0?"2px solid #1e3a5f":"1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#475569", flex: 1 }}>{it.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => setEnxoval(p => ({...p,[it.key]:Math.max(0,(p[it.key]||0)-1)}))} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>−</button>
                  <span style={{ width: 22, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#1e3a5f" }}>{enxoval[it.key]||0}</span>
                  <button onClick={() => setEnxoval(p => ({...p,[it.key]:(p[it.key]||0)+1}))} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#1e3a5f", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#64748b", fontSize: 14, cursor: "pointer" }}>← Voltar</button>
            <button onClick={() => setStep(4)} style={{ flex: 2, padding: 14, border: "none", borderRadius: 12, background: "#1e3a5f", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Próximo →</button>
          </div>
        </div>}

        {step === 4 && <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: "#334155", display: "block", marginBottom: 8 }}>4️⃣ Manutenção — {quarto}</label>
          <textarea value={manut} onChange={e => setManut(e.target.value)} placeholder="Descreva problemas (ou deixe em branco)" rows={3}
            style={{ width: "100%", padding: 14, fontSize: 14, border: "2px solid #e2e8f0", borderRadius: 12, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          <div style={{ background: "#f0f9ff", borderRadius: 12, padding: 14, marginTop: 12, border: "1px solid #bae6fd" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0c4a6e", marginBottom: 6 }}>📋 Resumo</div>
            <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
              <div><b>Quarto:</b> {quarto}</div>
              <div><b>Status:</b> {statusList.find(s => s.value===status)?.label}</div>
              <div><b>Enxoval:</b> {Object.entries(enxoval).filter(([,v])=>v>0).map(([k,v])=>`${enxovalList.find(i=>i.key===k)?.label||k}: ${v}`).join(", ")||"Nenhum"}</div>
              {manut && <div><b>Manutenção:</b> {manut}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setStep(3)} style={{ flex: 1, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#64748b", fontSize: 14, cursor: "pointer" }}>← Voltar</button>
            <button onClick={submit} style={{ flex: 2, padding: 16, border: "none", borderRadius: 12, background: "#16a34a", color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>✅ Confirmar</button>
          </div>
        </div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// PAINEL
// ════════════════════════════════════════
function PainelPage({ records, reload, statusList, vistoriadorasList }) {
  const [fStatus, setFStatus] = useState("todos");
  const [fAndar, setFAndar] = useState("todos");
  const [vist, setVist] = useState("");
  const [showVist, setShowVist] = useState(false);
  const [pendAction, setPendAction] = useState(null);
  const [dataSel, setDataSel] = useState(todayStr());
  const [confirmDel, setConfirmDel] = useState(null);

  const datas = getDatasDisp(records);
  const fil = records.filter(r => {
    if (r.data !== dataSel) return false;
    if (fStatus !== "todos" && r.status !== fStatus) return false;
    if (fAndar !== "todos" && !(ROOMS_BY_SECTION[fAndar]||[]).includes(r.quarto)) return false;
    return true;
  });

  const doAction = async (id, tipo, nome) => {
    if (tipo === "liberado") {
      await updateRecord(id, { liberado: true, repasse: false, liberado_hora: nowTime(), liberado_por: nome });
    } else if (tipo === "repasse") {
      await updateRecord(id, { liberado: false, repasse: true, repasse_hora: nowTime(), repasse_por: nome });
    }
    await reload();
  };

  const handleAction = async (id, tipo) => {
    if (tipo === "undo-liberado") { await updateRecord(id, { liberado: false, liberado_hora: "", liberado_por: "" }); await reload(); return; }
    if (tipo === "undo-repasse") { await updateRecord(id, { repasse: false, repasse_hora: "", repasse_por: "" }); await reload(); return; }
    if (vistoriadorasList.length === 0) { await doAction(id, tipo, "Supervisão"); return; }
    if (vist) { await doAction(id, tipo, vist); return; }
    setPendAction({id, tipo}); setShowVist(true);
  };

  const pickVist = async (n) => {
    setVist(n); setShowVist(false);
    if (pendAction) { await doAction(pendAction.id, pendAction.tipo, n); setPendAction(null); }
  };

  const deleteRec = async (id) => {
    await deleteRecordDB(id); await reload(); setConfirmDel(null);
  };

  const allSel = records.filter(r => r.data === dataSel);
  const cts = { total: allSel.length, lib: allSel.filter(r=>r.liberado).length, rep: allSel.filter(r=>r.repasse).length };
  statusList.forEach(s => { cts[s.value] = allSel.filter(r=>r.status===s.value).length; });

  return (
    <div style={{ padding: 16 }}>
      {showVist && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f", marginBottom: 4 }}>Quem está vistoriando?</div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Selecione seu nome</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vistoriadorasList.map(n => <button key={n} onClick={() => pickVist(n)} style={{ padding: 14, border: "2px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#334155", fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>🔍 {n}</button>)}
          </div>
          <button onClick={() => { setShowVist(false); setPendAction(null); }} style={{ width: "100%", marginTop: 12, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#64748b", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
        </div>
      </div>}

      {confirmDel && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 340 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>🗑️ Excluir Registro</div>
          <div style={{ fontSize: 14, color: "#475569", marginBottom: 16 }}>Excluir o registro do quarto <b>{confirmDel.quarto}</b> feito por <b>{confirmDel.camareira}</b>?</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#64748b", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => deleteRec(confirmDel.id)} style={{ flex: 1, padding: 12, border: "none", borderRadius: 12, background: "#dc2626", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Excluir</button>
          </div>
        </div>
      </div>}

      {vist && <div style={{ background: "#f5f3ff", border: "1px solid #c4b5fd", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#6d28d9" }}>🔍 Vistoriadora: {vist}</span>
        <button onClick={() => setVist("")} style={{ background: "#ede9fe", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#7c3aed", cursor: "pointer", fontWeight: 600 }}>Trocar</button>
      </div>}

      <div style={{ display: "flex", gap: 4, marginBottom: 10, overflowX: "auto" }}>
        {datas.map(d => <button key={d} onClick={() => setDataSel(d)} style={{ padding: "6px 12px", border: "none", borderRadius: 20, whiteSpace: "nowrap", background: dataSel===d?"#1e3a5f":"#f1f5f9", color: dataSel===d?"#fff":"#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{d===todayStr()?`Hoje (${d})`:d}</button>)}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 10, overflowX: "auto" }}>
        {[{label:"Total",count:cts.total,color:"#1e3a5f"}, ...statusList.map(s=>({label:s.value,count:cts[s.value]||0,color:s.color})), {label:"Liber.",count:cts.lib,color:"#8b5cf6"}, {label:"Repasse",count:cts.rep,color:"#f97316"}].map(s => (
          <div key={s.label} style={{ flex: "0 0 auto", minWidth: 48, background: "#fff", borderRadius: 10, padding: "6px 4px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 8, color: "#64748b", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
        {[{value:"todos",label:"Todos"}, ...statusList.map(s=>({value:s.value,label:s.label}))].map(f => <button key={f.value} onClick={() => setFStatus(f.value)} style={{ padding: "5px 10px", border: "none", borderRadius: 20, background: fStatus===f.value?"#1e3a5f":"#f1f5f9", color: fStatus===f.value?"#fff":"#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{f.label}</button>)}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        <button onClick={() => setFAndar("todos")} style={{ padding: "5px 10px", border: "none", borderRadius: 20, background: fAndar==="todos"?"#1e3a5f":"#f1f5f9", color: fAndar==="todos"?"#fff":"#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Todos</button>
        {Object.keys(ROOMS_BY_SECTION).map(s => <button key={s} onClick={() => setFAndar(s)} style={{ padding: "5px 10px", border: "none", borderRadius: 20, background: fAndar===s?"#1e3a5f":"#f1f5f9", color: fAndar===s?"#fff":"#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{s}°</button>)}
      </div>

      {fil.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>Nenhum registro</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {fil.map(r => {
            const st = statusList.find(s=>s.value===r.status) || {color:"#94a3b8",bg:"#f8fafc",label:r.status};
            return (
              <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderLeft: `4px solid ${r.repasse ? "#f97316" : r.liberado ? "#8b5cf6" : st.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>{r.quarto}</span>
                      <span style={{ background: st.bg, color: st.color, padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{r.camareira} • {r.hora}</div>
                  </div>
                  <button onClick={() => setConfirmDel(r)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#fee2e2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🗑️</button>
                </div>

                {r.enxoval && Object.values(r.enxoval).some(v=>v>0) && <div style={{ marginTop: 6, background: "#f8fafc", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#475569" }}>🛏️ {Object.entries(r.enxoval).filter(([,v])=>v>0).map(([k,v])=>`${k}: ${v}`).join(" • ")}</div>}
                {r.manutencao && <div style={{ marginTop: 4, background: "#fef2f2", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#dc2626" }}>🔧 {r.manutencao}</div>}

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => !r.repasse && handleAction(r.id, r.liberado ? "undo-liberado" : "liberado")} style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${r.liberado ? "#8b5cf6" : "#d1d5db"}`,
                    background: r.liberado ? "#f5f3ff" : "#fff",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${r.liberado ? "#8b5cf6" : "#d1d5db"}`, background: r.liberado ? "#8b5cf6" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", flexShrink: 0 }}>{r.liberado ? "✓" : ""}</div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: r.liberado ? "#6d28d9" : "#475569" }}>Liberado</div>
                      {r.liberado && r.liberado_por && <div style={{ fontSize: 9, color: "#8b5cf6" }}>{r.liberado_hora} • {r.liberado_por}</div>}
                    </div>
                  </button>
                  <button onClick={() => !r.liberado && handleAction(r.id, r.repasse ? "undo-repasse" : "repasse")} style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${r.repasse ? "#f97316" : "#d1d5db"}`,
                    background: r.repasse ? "#fff7ed" : "#fff",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${r.repasse ? "#f97316" : "#d1d5db"}`, background: r.repasse ? "#f97316" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", flexShrink: 0 }}>{r.repasse ? "✓" : ""}</div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: r.repasse ? "#c2410c" : "#475569" }}>Repasse</div>
                      {r.repasse && r.repasse_por && <div style={{ fontSize: 9, color: "#f97316" }}>{r.repasse_hora} • {r.repasse_por}</div>}
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// MANUTENÇÃO
// ════════════════════════════════════════
function ManutPage({ records, reload, manutEquipe }) {
  const [tec, setTec] = useState("");
  const [showTec, setShowTec] = useState(false);
  const [filtro, setFiltro] = useState("pendente");
  const [dataSel, setDataSel] = useState(todayStr());

  const datas = getDatasDisp(records, r => r.manutencao);
  const comManut = records.filter(r => r.manutencao && r.data === dataSel);
  const fil = comManut.filter(r => {
    if (filtro === "pendente") return !r.manut_resolvido;
    if (filtro === "resolvido") return r.manut_resolvido;
    return true;
  });
  const pend = comManut.filter(r => !r.manut_resolvido).length;
  const resol = comManut.filter(r => r.manut_resolvido).length;

  const resolver = async (id, tipo) => {
    const nome = tec || "Manutenção";
    if (manutEquipe.length > 0 && !tec) { setShowTec(true); return; }
    const updates = { manut_resolvido: true, manut_tipo: tipo, manut_resolvido_por: nome, manut_resolvido_hora: nowTime() };
    if (tipo === "limpeza") {
      updates.status = "VS"; updates.liberado = false; updates.repasse = false;
      updates.liberado_hora = ""; updates.liberado_por = ""; updates.repasse_hora = ""; updates.repasse_por = "";
    }
    await updateRecord(id, updates); await reload();
  };
  const desfazer = async (id) => {
    await updateRecord(id, { manut_resolvido: false, manut_tipo: "", manut_resolvido_por: "", manut_resolvido_hora: "" });
    await reload();
  };

  return (
    <div style={{ padding: 16 }}>
      {showTec && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f", marginBottom: 4 }}>Quem está resolvendo?</div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Selecione seu nome</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {manutEquipe.map(n => <button key={n} onClick={() => { setTec(n); setShowTec(false); }} style={{ padding: 14, border: "2px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#334155", fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>🔧 {n}</button>)}
          </div>
          <button onClick={() => setShowTec(false)} style={{ width: "100%", marginTop: 12, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#64748b", fontSize: 14, cursor: "pointer" }}>Cancelar</button>
        </div>
      </div>}

      {tec && <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>🔧 Técnico: {tec}</span>
        <button onClick={() => setTec("")} style={{ background: "#fde68a", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#92400e", cursor: "pointer", fontWeight: 600 }}>Trocar</button>
      </div>}

      <div style={{ display: "flex", gap: 4, marginBottom: 10, overflowX: "auto" }}>
        {datas.map(d => <button key={d} onClick={() => setDataSel(d)} style={{ padding: "6px 12px", border: "none", borderRadius: 20, whiteSpace: "nowrap", background: dataSel===d?"#1e3a5f":"#f1f5f9", color: dataSel===d?"#fff":"#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{d===todayStr()?`Hoje (${d})`:d}</button>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
        {[{l:"Total",c:comManut.length,co:"#1e3a5f"},{l:"Pendentes",c:pend,co:"#ef4444"},{l:"Resolvidos",c:resol,co:"#22c55e"}].map(s => (
          <div key={s.l} style={{ background: "#fff", borderRadius: 10, padding: "8px 6px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${s.co}` }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.co }}>{s.c}</div>
            <div style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[{v:"pendente",l:"🔴 Pendentes"},{v:"resolvido",l:"✅ Resolvidos"},{v:"todos",l:"Todos"}].map(f => <button key={f.v} onClick={() => setFiltro(f.v)} style={{ flex: 1, padding: "8px 4px", border: "none", borderRadius: 10, background: filtro===f.v?"#1e3a5f":"#f1f5f9", color: filtro===f.v?"#fff":"#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{f.l}</button>)}
      </div>

      {fil.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>{filtro==="pendente"?"Nenhum problema pendente 👏":"Nenhum registro"}</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {fil.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderLeft: `4px solid ${r.manut_resolvido?"#22c55e":"#ef4444"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>{r.quarto}</span>
                {r.manut_resolvido && <span style={{ background: r.manut_tipo==="liberado"?"#f0fdf4":"#fffbeb", color: r.manut_tipo==="liberado"?"#16a34a":"#d97706", padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700 }}>{r.manut_tipo==="liberado"?"✅ Liberado":"🧹 Precisa Limpeza"}</span>}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{r.camareira} • {r.hora}</div>
              <div style={{ marginTop: 8, background: "#fef2f2", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#dc2626" }}>🔧 {r.manutencao}</div>
              {r.manut_resolvido ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✓ Resolvido às {r.manut_resolvido_hora} por {r.manut_resolvido_por}{r.manut_tipo==="limpeza"?" — aguardando limpeza":""}</div>
                  <button onClick={() => desfazer(r.id)} style={{ marginTop: 6, padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer" }}>Desfazer</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button onClick={() => resolver(r.id,"liberado")} style={{ flex: 1, padding: 12, border: "none", borderRadius: 10, background: "#16a34a", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✅ Resolvido e Liberado</button>
                  <button onClick={() => resolver(r.id,"limpeza")} style={{ flex: 1, padding: 12, border: "none", borderRadius: 10, background: "#d97706", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🧹 Precisa Limpeza</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════
function DashPage({ records, statusList, enxovalList }) {
  const [dataSel, setDataSel] = useState(todayStr());
  const datas = getDatasDisp(records);
  const day = records.filter(r => r.data === dataSel);

  const byCam = {};
  day.forEach(r => {
    if (!byCam[r.camareira]) byCam[r.camareira] = { quartos: [], enxoval: {} };
    byCam[r.camareira].quartos.push(r);
    enxovalList.forEach(it => { byCam[r.camareira].enxoval[it.key] = (byCam[r.camareira].enxoval[it.key]||0) + (r.enxoval?.[it.key]||0); });
  });
  const totEnx = {}; enxovalList.forEach(it => { totEnx[it.key] = day.reduce((s,r) => s+(r.enxoval?.[it.key]||0),0); });
  const sorted = Object.entries(byCam).sort((a,b) => b[1].quartos.length - a[1].quartos.length);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, overflowX: "auto" }}>
        {datas.map(d => <button key={d} onClick={() => setDataSel(d)} style={{ padding: "6px 12px", border: "none", borderRadius: 20, whiteSpace: "nowrap", background: dataSel===d?"#1e3a5f":"#f1f5f9", color: dataSel===d?"#fff":"#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{d===todayStr()?`Hoje (${d})`:d}</button>)}
      </div>

      <div style={{ background: "linear-gradient(135deg,#1e3a5f 0%,#0f2440 100%)", borderRadius: 14, padding: 16, marginBottom: 12, color: "#fff" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📊 Resumo — {dataSel}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
          {[{v:day.length,l:"Quartos"},{v:day.filter(r=>r.liberado).length,l:"Liberados"},{v:day.filter(r=>r.manutencao).length,l:"Manut."},{v:Object.keys(byCam).length,l:"Equipe"}].map((s,i) => <div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800 }}>{s.v}</div><div style={{ fontSize: 9, opacity: 0.7 }}>{s.l}</div></div>)}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f", marginBottom: 8 }}>🛏️ Enxoval Total</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          {enxovalList.map(it => <div key={it.key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: totEnx[it.key]>0?"#f0f9ff":"#f8fafc", borderRadius: 8, fontSize: 11 }}><span style={{ color: "#475569" }}>{it.label}</span><span style={{ fontWeight: 800, color: totEnx[it.key]>0?"#1e3a5f":"#cbd5e1" }}>{totEnx[it.key]}</span></div>)}
        </div>
      </div>

      {sorted.map(([name,data]) => (
        <div key={name} style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div><div style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f" }}>{name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{data.quartos.length} quartos • {data.quartos.filter(r=>r.liberado).length} liberados</div></div>
            <div style={{ background: "#1e3a5f", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 18, fontWeight: 800 }}>{data.quartos.length}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 6 }}>
            {data.quartos.map(r => { const st = statusList.find(s=>s.value===r.status)||{bg:"#f8fafc",color:"#94a3b8"}; return <span key={r.id} style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color, border: r.liberado?"1px solid #8b5cf6":"none" }}>{r.quarto}{r.liberado&&" ✓"}</span>; })}
          </div>
          {Object.values(data.enxoval).some(v=>v>0) && <div style={{ background: "#f8fafc", borderRadius: 8, padding: "5px 10px", fontSize: 10, color: "#475569" }}>{enxovalList.filter(it=>data.enxoval[it.key]>0).map(it=>`${it.label}: ${data.enxoval[it.key]}`).join(" • ")}</div>}
          {data.quartos.filter(r=>r.manutencao).length > 0 && <div style={{ marginTop: 4 }}>{data.quartos.filter(r=>r.manutencao).map(r => <div key={r.id} style={{ background: "#fef2f2", borderRadius: 6, padding: "3px 10px", fontSize: 10, color: "#dc2626", marginTop: 3 }}>🔧 {r.quarto}: {r.manutencao}</div>)}</div>}
        </div>
      ))}
      {sorted.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>Nenhum dado</div>}
    </div>
  );
}

// ════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════
function CfgSection({ title, icon, items, onAdd, onRemove, renderItem, placeholder }) {
  const [v, setV] = useState("");
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", marginBottom: 12 }}>{icon} {title}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={v} onChange={e => setV(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, padding: 12, border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none" }}
          onKeyDown={e => { if (e.key==="Enter" && v.trim()) { onAdd(v.trim()); setV(""); } }}
        />
        <button onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); } }} style={{ padding: "12px 16px", border: "none", borderRadius: 10, background: "#1e3a5f", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>+ Adicionar</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", padding: 12, fontSize: 13 }}>Nenhum cadastrado</div>}
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderRadius: 10, padding: "10px 14px" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>{renderItem(item)}</span>
            <button onClick={() => onRemove(i)} style={{ border: "none", background: "#fee2e2", color: "#dc2626", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfigPage({ camareirasList, setCamareirasList, enxovalList, setEnxovalList, statusList, setStatusList, vistoriadorasList, setVistoriadorasList, manutEquipe, setManutEquipe, reload }) {
  const [msg, setMsg] = useState("");
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2500); };

  const saveList = async (chave, lista, setter) => {
    setter(lista); await saveConfig(chave, lista);
  };

  const addCam = async (n) => { if (camareirasList.includes(n)) { flash("⚠️ Já existe"); return; } await saveList("camareiras", [...camareirasList,n].sort(), setCamareirasList); flash(`✅ ${n} adicionada`); };
  const rmCam = async (i) => { await saveList("camareiras", camareirasList.filter((_,x)=>x!==i), setCamareirasList); flash("Removida"); };

  const addVist = async (n) => { if (vistoriadorasList.includes(n)) { flash("⚠️ Já existe"); return; } await saveList("vistoriadoras", [...vistoriadorasList,n].sort(), setVistoriadorasList); flash(`✅ ${n} adicionada`); };
  const rmVist = async (i) => { await saveList("vistoriadoras", vistoriadorasList.filter((_,x)=>x!==i), setVistoriadorasList); flash("Removida"); };

  const addMeq = async (n) => { if (manutEquipe.includes(n)) { flash("⚠️ Já existe"); return; } await saveList("manutEquipe", [...manutEquipe,n].sort(), setManutEquipe); flash(`✅ ${n} adicionado`); };
  const rmMeq = async (i) => { await saveList("manutEquipe", manutEquipe.filter((_,x)=>x!==i), setManutEquipe); flash("Removido"); };

  const addEnx = async (l) => { const k=l.toLowerCase().replace(/[^a-z0-9]/g,"_").replace(/_+/g,"_"); if (enxovalList.some(e=>e.key===k)) { flash("⚠️ Já existe"); return; } await saveList("enxoval", [...enxovalList,{key:k,label:l}], setEnxovalList); flash(`✅ ${l} adicionado`); };
  const rmEnx = async (i) => { await saveList("enxoval", enxovalList.filter((_,x)=>x!==i), setEnxovalList); flash("Removido"); };

  const addSts = async (l) => { const v=l.split(" ").map(w=>w[0]?.toUpperCase()).join("").slice(0,4); if (statusList.some(s=>s.value===v)) { flash("⚠️ Já existe"); return; } const ci=statusList.length%ICON_COLORS.length; await saveList("status", [...statusList,{value:v,label:l,color:ICON_COLORS[ci],bg:ICON_COLORS[ci]+"15",icon:ICON_EMOJIS[ci]}], setStatusList); flash(`✅ ${l} adicionado`); };
  const rmSts = async (i) => { await saveList("status", statusList.filter((_,x)=>x!==i), setStatusList); flash("Removido"); };

  return (
    <div style={{ padding: 16 }}>
      {msg && <div style={{ background: msg.startsWith("⚠️")?"#fffbeb":"#f0fdf4", border: `1px solid ${msg.startsWith("⚠️")?"#fcd34d":"#86efac"}`, borderRadius: 12, padding: 12, marginBottom: 12, textAlign: "center", fontSize: 14, fontWeight: 600, color: msg.startsWith("⚠️")?"#92400e":"#166534" }}>{msg}</div>}

      <CfgSection title="Camareiras" icon="👩" items={camareirasList} onAdd={addCam} onRemove={rmCam} renderItem={i=>i} placeholder="Nome da camareira" />
      <CfgSection title="Vistoriadoras / Supervisão" icon="🔍" items={vistoriadorasList} onAdd={addVist} onRemove={rmVist} renderItem={i=>i} placeholder="Nome da vistoriadora" />
      <CfgSection title="Equipe Manutenção" icon="🔧" items={manutEquipe} onAdd={addMeq} onRemove={rmMeq} renderItem={i=>i} placeholder="Nome do técnico" />
      <CfgSection title="Tipos de Enxoval" icon="🛏️" items={enxovalList} onAdd={addEnx} onRemove={rmEnx} renderItem={i=>i.label} placeholder="Nome do item" />
      <CfgSection title="Status de Quarto" icon="🏷️" items={statusList} onAdd={addSts} onRemove={rmSts} renderItem={i=>`${i.icon} ${i.label} (${i.value})`} placeholder="Nome do status" />
    </div>
  );
}

// ════════════════════════════════════════
// APP
// ════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("registro");
  const [records, setRecords] = useState([]);
  const [camareirasList, setCamareirasList] = useState([]);
  const [enxovalList, setEnxovalList] = useState(DEFAULT_ENXOVAL);
  const [statusList, setStatusList] = useState(DEFAULT_STATUS);
  const [vistoriadorasList, setVistoriadorasList] = useState([]);
  const [manutEquipe, setManutEquipe] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const recs = await loadRecords();
    setRecords(recs);
  };

  useEffect(() => {
    (async () => {
      const [recs, cam, vis, meq, enx, sts] = await Promise.all([
        loadRecords(),
        loadConfig("camareiras"),
        loadConfig("vistoriadoras"),
        loadConfig("manutEquipe"),
        loadConfig("enxoval"),
        loadConfig("status"),
      ]);
      setRecords(recs);
      if (cam) setCamareirasList(cam);
      if (vis) setVistoriadorasList(vis);
      if (meq) setManutEquipe(meq);
      if (enx) setEnxovalList(enx);
      if (sts) setStatusList(sts);
      setLoading(false);
    })();

    // Real-time updates via Supabase
    const channel = supabase
      .channel("registros-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "registros" }, () => { reload(); })
      .subscribe();

    // Auto-refresh a cada 10 segundos como fallback
    const interval = setInterval(reload, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <div style={{ textAlign: "center", color: "#64748b" }}><div style={{ fontSize: 32, marginBottom: 8 }}>🏨</div><div>Carregando...</div></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI',-apple-system,sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}button:active{transform:scale(0.97)}`}</style>
      <Header page={page} setPage={setPage} />
      {page === "registro" && <RegistroPage records={records} reload={reload} statusList={statusList} enxovalList={enxovalList} camareirasList={camareirasList} />}
      {page === "painel" && <PainelPage records={records} reload={reload} statusList={statusList} vistoriadorasList={vistoriadorasList} />}
      {page === "manut" && <ManutPage records={records} reload={reload} manutEquipe={manutEquipe} />}
      {page === "dash" && <DashPage records={records} statusList={statusList} enxovalList={enxovalList} />}
      {page === "config" && <ConfigPage camareirasList={camareirasList} setCamareirasList={setCamareirasList} enxovalList={enxovalList} setEnxovalList={setEnxovalList} statusList={statusList} setStatusList={setStatusList} vistoriadorasList={vistoriadorasList} setVistoriadorasList={setVistoriadorasList} manutEquipe={manutEquipe} setManutEquipe={setManutEquipe} reload={reload} />}
    </div>
  );
}
