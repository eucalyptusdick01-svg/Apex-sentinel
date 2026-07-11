export default function Slide12Terminal() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Product</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#9ECE6A", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#9ECE6A", borderRadius: "2px", marginLeft: "-3vw" }} />
            Terminal Experience
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Tech Stack</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Deployment</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#9ECE6A", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>The Terminal Experience</div>
        <h1 style={{ fontSize: "4vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 2vh 0", letterSpacing: "-0.02em" }}>Dark · Retro · Monospace</h1>
        <p style={{ fontSize: "1.3vw", color: "#9AA5CE", lineHeight: 1.5, maxWidth: "44vw", margin: "0 0 3vh 0" }}>
          Select a target. Pick a module number. Watch the output stream in.
        </p>
        <div style={{ backgroundColor: "#0D0E17", borderRadius: "0.6vw", border: "1px solid rgba(255,255,255,0.08)", padding: "3vh 3vw", flex: 1, maxHeight: "42vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "2.5vh" }}>
            <div style={{ width: "0.8vw", height: "0.8vw", borderRadius: "50%", backgroundColor: "#FF5F57" }} />
            <div style={{ width: "0.8vw", height: "0.8vw", borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
            <div style={{ width: "0.8vw", height: "0.8vw", borderRadius: "50%", backgroundColor: "#28C840" }} />
            <div style={{ fontSize: "0.9vw", color: "#565F89", marginLeft: "1vw", fontFamily: "'DM Mono', monospace" }}>swept-sentinel — terminal</div>
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", lineHeight: 1.8, color: "#9AA5CE" }}>
            <div style={{ color: "#565F89" }}>[18:04:00] SYSTEM READY. 230 MODULES LOADED.</div>
            <div style={{ color: "#7AA2F7" }}>[TARGET_DATA] &gt; <span style={{ color: "#FFFFFF" }}>8.8.8.8</span></div>
            <div style={{ color: "#7AA2F7" }}>[MODULE] &gt; <span style={{ color: "#FFFFFF" }}>003 — PORT SCAN</span></div>
            <div style={{ color: "#565F89" }}>[18:04:02] Executing module 003...</div>
            <div style={{ color: "#9AA5CE" }}>[PORT SCAN] Scanning 8.8.8.8 — top 1000 ports</div>
            <div style={{ color: "#9ECE6A" }}>[OPEN]  80/tcp   http</div>
            <div style={{ color: "#9ECE6A" }}>[OPEN]  443/tcp  https</div>
            <div style={{ color: "#9ECE6A" }}>[OPEN]  853/tcp  dns-over-tls</div>
            <div style={{ color: "#565F89" }}>[18:04:09] Scan complete. 3 open ports found.</div>
            <div style={{ color: "#7AA2F7" }}>[DONE] _<span style={{ opacity: 0 }}>|</span></div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>12</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
