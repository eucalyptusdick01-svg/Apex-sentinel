export default function Slide01Title() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}
    >
      {/* Left Sidebar */}
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Overview</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh", marginBottom: "4vh" }}>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-3vw" }} />
            Introduction
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Architecture</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Modules</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Reference</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Network</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Recon</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Intel</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Advanced</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>
          OSINT · Recon · Intelligence
        </div>
        <h1 style={{ fontSize: "5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 2vh 0", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Swept Sentinel
        </h1>
        <p style={{ fontSize: "1.5vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "42vw", margin: "0 0 6vh 0", fontWeight: 400 }}>
          230 OSINT &amp; network recon modules. One terminal. Real data.
        </p>
        <div style={{ display: "flex", alignItems: "center", padding: "2vh 2vw", backgroundColor: "rgba(158,206,106,0.1)", border: "1px solid rgba(158,206,106,0.2)", borderRadius: "0.5vw", marginBottom: "5vh", width: "fit-content" }}>
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#9ECE6A", marginRight: "1.5vw", fontFamily: "'DM Mono', monospace" }}>POST</div>
          <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontFamily: "'DM Mono', monospace" }}>/api/sentinel/execute</div>
        </div>
        <div style={{ display: "flex", gap: "4vw" }}>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "1vw", lineHeight: 1.6, flex: 1 }}>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF", marginBottom: "1.5vh", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1vh", fontFamily: "'Inter', sans-serif" }}>Request</div>
            <div style={{ color: "#7AA2F7" }}>{"{"}</div>
            <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}><span style={{ color: "#7AA2F7" }}>"moduleId"</span>: <span style={{ color: "#FF9E64" }}>3</span>,</div>
            <div style={{ paddingLeft: "2vw", color: "#C0CAF5" }}><span style={{ color: "#7AA2F7" }}>"target"</span>: <span style={{ color: "#9ECE6A" }}>"8.8.8.8"</span></div>
            <div style={{ color: "#7AA2F7" }}>{"}"}</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "1vw", lineHeight: 1.6, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5vh", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1vh" }}>
              <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>Response</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
                <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%" }} />
                <div style={{ fontSize: "0.9vw", color: "#9ECE6A" }}>200 OK</div>
              </div>
            </div>
            <div style={{ color: "#C0CAF5" }}><span style={{ color: "#7AA2F7" }}>"runId"</span>: <span style={{ color: "#E0AF68" }}>"a3f9..."</span></div>
            <div style={{ color: "#C0CAF5", marginTop: "0.5vh" }}><span style={{ color: "#7AA2F7" }}>"module"</span>: <span style={{ color: "#9ECE6A" }}>"PORT SCAN"</span></div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
