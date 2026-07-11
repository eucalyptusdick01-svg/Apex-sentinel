export default function Slide09Streaming() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Architecture</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#9ECE6A", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#9ECE6A", borderRadius: "2px", marginLeft: "-3vw" }} />
            Live Streaming
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Real Data Sources</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Target Types</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Tech Stack</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#9ECE6A", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>Live Streaming Output</div>
        <h1 style={{ fontSize: "4vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 2vh 0", letterSpacing: "-0.02em" }}>SSE · Line by line</h1>
        <div style={{ display: "flex", gap: "4vw", marginBottom: "4vh" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1vh" }}>Step 1 — Execute</div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "1vw", lineHeight: 1.6 }}>
              <div style={{ color: "#9ECE6A" }}>POST</div>
              <div style={{ color: "#E0AF68", paddingLeft: "1.5vw" }}>/api/sentinel/execute</div>
              <div style={{ color: "#565F89", paddingLeft: "1.5vw", marginTop: "1vh" }}>moduleId: 3</div>
              <div style={{ color: "#565F89", paddingLeft: "1.5vw" }}>target: "8.8.8.8"</div>
              <div style={{ color: "#9AA5CE", marginTop: "1.5vh" }}>→ returns runId</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#565F89", fontSize: "2vw" }}>→</div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1vh" }}>
              <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>Step 2 — Stream</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
                <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%" }} />
                <div style={{ fontSize: "0.9vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A" }}>SSE</div>
              </div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "1vw", lineHeight: 1.6 }}>
              <div style={{ color: "#7AA2F7" }}>GET</div>
              <div style={{ color: "#E0AF68", paddingLeft: "1.5vw" }}>/api/sentinel/stream/:runId</div>
              <div style={{ color: "#9AA5CE", marginTop: "1.5vh" }}>data: "[PORT SCAN] Starting..."</div>
              <div style={{ color: "#9AA5CE" }}>data: "[INFO] 80/tcp  open"</div>
              <div style={{ color: "#9ECE6A" }}>data: "[DONE]"</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "2vh 2vw", backgroundColor: "rgba(122,162,247,0.06)", border: "1px solid rgba(122,162,247,0.15)", borderRadius: "0.5vw" }}>
          <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Real feel, real data</div>
          <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Results stream line by line into the terminal pane — whether the module calls a live API or runs local Python.</div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>09</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
