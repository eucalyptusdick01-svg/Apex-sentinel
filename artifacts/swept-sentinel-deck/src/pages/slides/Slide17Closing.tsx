export default function Slide17Closing() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5", position: "relative" }}>
      {/* Radial glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(122,162,247,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Full-width centered layout */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10vh 8vw", position: "relative" }}>
        <div style={{ width: "4vw", height: "4vw", backgroundColor: "#7AA2F7", borderRadius: "1vw", marginBottom: "4vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "2vw", height: "2vw", backgroundColor: "#1A1B26", borderRadius: "0.5vw" }} />
        </div>
        <h1 style={{ fontSize: "5.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 3vh 0", letterSpacing: "-0.02em", textAlign: "center" }}>
          Swept Sentinel
        </h1>
        <p style={{ fontSize: "1.6vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "38vw", margin: "0 0 6vh 0", fontWeight: 400, textAlign: "center" }}>
          One dashboard. 230 modules. Real intelligence.
        </p>
        <div style={{ display: "flex", alignItems: "center", padding: "1.5vh 2.5vw", backgroundColor: "rgba(158,206,106,0.08)", border: "1px solid rgba(158,206,106,0.2)", borderRadius: "0.5vw", marginBottom: "6vh" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.3vw", color: "#9ECE6A" }}>github.com/swept-sentinel</div>
        </div>
        <div style={{ display: "flex", gap: "5vw", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <div style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#9ECE6A", borderRadius: "50%" }} />
            <div style={{ fontSize: "1.1vw", color: "#C0CAF5" }}>128 real modules</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <div style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#7AA2F7", borderRadius: "50%" }} />
            <div style={{ fontSize: "1.1vw", color: "#C0CAF5" }}>SSE streaming</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <div style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#E0AF68", borderRadius: "50%" }} />
            <div style={{ fontSize: "1.1vw", color: "#C0CAF5" }}>No auth required</div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "8vh", left: "8vw", right: "8vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>17</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
