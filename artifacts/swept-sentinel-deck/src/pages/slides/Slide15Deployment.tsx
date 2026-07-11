export default function Slide15Deployment() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Product</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Terminal Experience</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Tech Stack</div>
          <div style={{ fontSize: "1vw", color: "#9ECE6A", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#9ECE6A", borderRadius: "2px", marginLeft: "-3vw" }} />
            Deployment
          </div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#9ECE6A", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>Deployment</div>
        <h1 style={{ fontSize: "4.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 4vh 0", letterSpacing: "-0.02em" }}>Live on Replit</h1>
        <div style={{ display: "flex", gap: "3vw", marginBottom: "4vh" }}>
          <div style={{ flex: 1, backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "3vh 2.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2vh" }}>Monorepo</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.8 }}>
              <div><span style={{ color: "#7AA2F7" }}>pnpm</span> workspaces</div>
              <div><span style={{ color: "#7AA2F7" }}>esbuild</span> CJS bundle</div>
              <div><span style={{ color: "#7AA2F7" }}>Node.js</span> 24</div>
              <div><span style={{ color: "#7AA2F7" }}>TypeScript</span> 5.9</div>
            </div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "3vh 2.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2vh" }}>Services</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.8 }}>
              <div><span style={{ color: "#9ECE6A" }}>:5000</span> API server</div>
              <div><span style={{ color: "#9ECE6A" }}>:3000</span> Frontend</div>
              <div><span style={{ color: "#9ECE6A" }}>:5432</span> PostgreSQL</div>
              <div><span style={{ color: "#9ECE6A" }}>PATH</span> 80+ py scripts</div>
            </div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "3vh 2.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2vh" }}>Live URL</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#9ECE6A", lineHeight: 1.8 }}>
              <div>swept-sentinel</div>
              <div>.replit.app</div>
            </div>
            <div style={{ marginTop: "2vh", display: "flex", alignItems: "center", gap: "0.5vw" }}>
              <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%" }} />
              <div style={{ fontSize: "0.9vw", color: "#9ECE6A" }}>Published</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>15</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
