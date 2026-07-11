export default function Slide16RealVsSim() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Reference</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-3vw" }} />
            Real vs. Simulated
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Category Map</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Deployment</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>Coverage</div>
        <h1 style={{ fontSize: "4vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 3vh 0", letterSpacing: "-0.02em" }}>Real vs. Simulated</h1>
        <div style={{ display: "flex", gap: "4vw", marginBottom: "4vh" }}>
          <div style={{ flex: 1, backgroundColor: "rgba(158,206,106,0.06)", borderRadius: "0.5vw", padding: "3vh 2.5vw", border: "1px solid rgba(158,206,106,0.2)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1vw", marginBottom: "2vh" }}>
              <div style={{ fontSize: "4vw", fontWeight: 700, color: "#9ECE6A", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>128</div>
              <div style={{ fontSize: "1.2vw", color: "#9ECE6A", fontWeight: 600 }}>Real modules</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Free APIs — ip-api, HackerTarget, NVD</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Raw TCP — port scan, banner grab</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Python stdlib — crypto, encoding, math</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>No API keys required for 120 of 128</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, backgroundColor: "rgba(122,162,247,0.04)", borderRadius: "0.5vw", padding: "3vh 2.5vw", border: "1px solid rgba(122,162,247,0.15)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1vw", marginBottom: "2vh" }}>
              <div style={{ fontSize: "4vw", fontWeight: 700, color: "#7AA2F7", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>102</div>
              <div style={{ fontSize: "1.2vw", color: "#7AA2F7", fontWeight: 600 }}>Simulated modules</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#565F89", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Breach databases — paid APIs only</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#565F89", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Phone OSINT — carrier auth required</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#565F89", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Social platforms — OAuth required</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#565F89", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Output matches real format exactly</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>16</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
