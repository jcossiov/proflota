/**
 * WizardForm — Formulario guiado por pasos, fondo claro, max 3 campos/pantalla
 * Hecho por JESUS COSSIO DEV — FE-08 / FE-41 / FE-44
 */

/* ── Paleta de luz para formularios ── */
export const wz = {
  bg:         "#F0F4FF",
  card:       "#FFFFFF",
  cardSel:    "#E8EFFE",
  border:     "#D1DCF0",
  borderSel:  "#3B82F6",
  labelColor: "#374151",
  input:      "#FFFFFF",
  inputBorder:"#D1DCF0",
  textMain:   "#111827",
  textSub:    "#6B7280",
  blue:       "#3B82F6",
  blueDark:   "#1D4ED8",
  blueSoft:   "#EFF6FF",
  green:      "#10B981",
  shadow:     "0 4px 24px rgba(59,130,246,0.12)",
  shadowCard: "0 2px 12px rgba(0,0,0,0.06)",
  radius:     "18px",
  radiusSm:   "12px",
};

export function WizardPantalla({ children, style }) {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#EEF4FF 0%,#F8FAFF 60%,#EDF4FF 100%)",
      maxWidth:"430px", margin:"0 auto", paddingBottom:"32px",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function WizardHeader({ titulo, onVolver, labelVolver="Volver", badge }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"16px 20px",
      background:"#FFFFFF",
      borderBottom:`1px solid #D1DCF0`,
      boxShadow:"0 1px 8px rgba(0,0,0,0.06)",
    }}>
      <button type="button" onClick={onVolver}
        style={{ display:"flex",alignItems:"center",gap:"6px",background:"none",border:"none",
          color:"#3B82F6",fontWeight:700,fontSize:"15px",cursor:"pointer",padding:0 }}>
        ← {labelVolver}
      </button>
      <span style={{ fontSize:"17px",fontWeight:800,color:"#111827" }}>{titulo}</span>
      {badge || <span style={{ width:"60px" }} />}
    </div>
  );
}

export function WizardProgress({ total, actual, etiquetas=[] }) {
  return (
    <div style={{ padding:"16px 20px 0" }}>
      <div style={{ display:"flex",gap:"6px",marginBottom:"10px" }}>
        {Array.from({length:total},(_,i)=>(
          <div key={i} style={{
            flex:1,height:"5px",borderRadius:"3px",
            background: i < actual ? "#3B82F6" : "#DDE6F8",
            transition:"background 0.35s",
          }}/>
        ))}
      </div>
      {etiquetas[actual-1] && (
        <p style={{ fontSize:"11px",fontWeight:700,color:"#3B82F6",
          letterSpacing:"0.08em",textTransform:"uppercase",margin:0 }}>
          Paso {actual} de {total} · {etiquetas[actual-1]}
        </p>
      )}
    </div>
  );
}

export function WizardBanner({ icono, titulo, mensaje }) {
  return (
    <div style={{
      margin:"12px 20px 4px",
      background:"#FFFFFF",
      border:`1.5px solid #D1DCF0`,
      borderLeft:"4px solid #3B82F6",
      borderRadius:"12px",
      padding:"14px 16px",
      display:"flex",alignItems:"flex-start",gap:"12px",
      boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
    }}>
      <span style={{ fontSize:"28px",flexShrink:0,lineHeight:1 }}>{icono}</span>
      <div>
        <p style={{ fontSize:"17px",fontWeight:800,color:"#111827",margin:"0 0 3px" }}>{titulo}</p>
        <p style={{ fontSize:"14px",color:"#6B7280",margin:0,lineHeight:1.5 }}>{mensaje}</p>
      </div>
    </div>
  );
}

export function WizardCampo({ label, obligatorio, ayuda, children, error }) {
  return (
    <div style={{ marginBottom:"18px" }}>
      <label style={{
        display:"block", fontSize:"16px",fontWeight:700,
        color:"#374151",marginBottom:"9px",letterSpacing:"0.01em",
      }}>
        {label}{obligatorio && <span style={{ color:"#3B82F6",marginLeft:"3px" }}>*</span>}
      </label>
      {children}
      {ayuda && !error && <p style={{ fontSize:"12px",color:"#6B7280",margin:"5px 0 0" }}>{ayuda}</p>}
      {error && <p style={{ fontSize:"12px",color:"#EF4444",margin:"5px 0 0",fontWeight:600 }}>{error}</p>}
    </div>
  );
}

export function WizardInput({ value, onChange, placeholder, type="text", maxLength, min, max, style, id }) {
  const baseStyle = {
    width:"100%", boxSizing:"border-box",
    padding:"15px 16px", fontSize:"17px",
    borderRadius:"12px",
    border:"1.5px solid #D1DCF0",
    background:"#FFFFFF", color:"#111827",
    outline:"none", fontWeight:500,
    boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
    ...style,
  };
  return (
    <input id={id} type={type} value={value} onChange={onChange}
      placeholder={placeholder} maxLength={maxLength} min={min} max={max}
      style={baseStyle}
      onFocus={e=>{ e.target.style.borderColor="#3B82F6"; e.target.style.boxShadow="0 0 0 3px rgba(59,130,246,0.12)"; }}
      onBlur={e=>{ e.target.style.borderColor="#D1DCF0"; e.target.style.boxShadow="0 2px 8px rgba(0,0,0,0.05)"; }}
    />
  );
}

export function WizardSelect({ value, onChange, children, id }) {
  return (
    <select id={id} value={value} onChange={onChange}
      style={{
        width:"100%", boxSizing:"border-box",
        padding:"15px 44px 15px 16px", fontSize:"17px",
        borderRadius:"12px",
        border:"1.5px solid #D1DCF0",
        background:"#FFFFFF",
        color: value ? "#111827" : "#9CA3AF",
        outline:"none", fontWeight:500, cursor:"pointer",
        boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
        appearance:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat",
        backgroundPosition:"right 14px center",
      }}
    >
      {children}
    </select>
  );
}

export function WizardOpciones({ opciones, valor, onChange, columnas=2 }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${columnas},1fr)`, gap:"10px" }}>
      {opciones.map((op)=>{
        const sel = valor === op.value;
        return (
          <button key={op.value} type="button" onClick={()=>onChange(op.value)}
            style={{
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:"6px",
              padding:"16px 8px", minHeight:"82px",
              background: sel ? "#E8EFFE" : "#FFFFFF",
              border:`2px solid ${sel ? "#3B82F6" : "#D1DCF0"}`,
              borderRadius:"12px", cursor:"pointer",
              transition:"all 0.18s",
              boxShadow: sel ? "0 0 0 3px rgba(59,130,246,0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
              textAlign:"center",
            }}>
            {op.icono && <span style={{ fontSize:"22px",lineHeight:1 }}>{op.icono}</span>}
            <span style={{ fontSize:"13px",fontWeight:sel?800:600,
              color:sel?"#3B82F6":"#111827",lineHeight:1.3 }}>
              {op.label}
            </span>
            {op.sub && <span style={{ fontSize:"11px",color:"#6B7280" }}>{op.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function WizardCard({ children, style }) {
  return (
    <div style={{
      background:"#FFFFFF",
      borderRadius:"18px",
      margin:"12px 20px",
      padding:"24px 20px",
      boxShadow:"0 4px 24px rgba(59,130,246,0.12)",
      border:"1px solid #D1DCF0",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function WizardNav({ subPaso, totalSubPasos, onAnterior, onSiguiente, onGuardar, guardando, labelGuardar="Guardar" }) {
  const esUltimo = subPaso >= totalSubPasos;
  return (
    <div style={{ display:"flex",gap:"12px",margin:"4px 20px 0" }}>
      {subPaso > 1 && (
        <button type="button" onClick={onAnterior}
          style={{
            flex:1, minHeight:"52px",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",
            background:"#FFFFFF", border:"1.5px solid #D1DCF0",
            borderRadius:"12px", fontSize:"16px",fontWeight:700,
            color:"#6B7280", cursor:"pointer",
            boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
          }}>
          ← Anterior
        </button>
      )}
      {!esUltimo ? (
        <button type="button" onClick={onSiguiente}
          style={{
            flex:2, minHeight:"52px",
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"linear-gradient(135deg,#3B82F6 0%,#1D4ED8 100%)",
            border:"none", borderRadius:"12px",
            fontSize:"17px",fontWeight:800, color:"#FFFFFF",cursor:"pointer",
            boxShadow:"0 6px 20px rgba(59,130,246,0.35)",
          }}>
          Siguiente →
        </button>
      ) : (
        <button type="button" onClick={onGuardar} disabled={guardando}
          style={{
            flex:2, minHeight:"52px",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
            background: guardando?"#9CA3AF":"linear-gradient(135deg,#10B981 0%,#059669 100%)",
            border:"none", borderRadius:"12px",
            fontSize:"17px",fontWeight:800, color:"#FFFFFF",
            cursor:guardando?"not-allowed":"pointer",
            boxShadow: guardando?"none":"0 6px 20px rgba(16,185,129,0.35)",
            opacity:guardando?0.8:1,
          }}>
          {guardando?"⏳ Guardando...":`✓ ${labelGuardar}`}
        </button>
      )}
    </div>
  );
}

export function WizardStepDots({ total, actual }) {
  return (
    <div style={{ display:"flex",justifyContent:"center",gap:"8px",padding:"12px 0 4px" }}>
      {Array.from({length:total},(_,i)=>(
        <div key={i} style={{
          width: i===actual-1?"24px":"8px", height:"8px",
          borderRadius:"4px",
          background: i<actual?"#3B82F6":"#DDE6F8",
          transition:"all 0.25s",
        }}/>
      ))}
    </div>
  );
}
