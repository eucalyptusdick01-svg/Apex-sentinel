export default function Slide14Categories() {
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
            Category Map
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Network 001–010</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Social 011–050</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Recon 051–100</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Intel 151–200</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Advanced 201–230</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>Module Categories</div>
        <h1 style={{ fontSize: "4vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 4vh 0", letterSpacing: "-0.02em" }}>At a glance</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.8vh", maxWidth: "50vw" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "3vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#7AA2F7", width: "10vw", flexShrink: 0 }}>001–010</div>
            <div style={{ height: "1px", flex: 1, backgroundColor: "rgba(122,162,247,0.2)" }} />
            <div style={{ fontSize: "1.3vw", fontWeight: 600, color: "#7AA2F7", width: "9vw", textAlign: "right" }}>NETWORK</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "3vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#9ECE6A", width: "10vw", flexShrink: 0 }}>011–050</div>
            <div style={{ height: "1px", flex: 1, backgroundColor: "rgba(158,206,106,0.2)" }} />
            <div style={{ fontSize: "1.3vw", fontWeight: 600, color: "#9ECE6A", width: "9vw", textAlign: "right" }}>SOCIAL</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "3vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#E0AF68", width: "10vw", flexShrink: 0 }}>051–100</div>
            <div style={{ height: "1px", flex: 1, backgroundColor: "rgba(224,175,104,0.2)" }} />
            <div style={{ fontSize: "1.3vw", fontWeight: 600, color: "#E0AF68", width: "9vw", textAlign: "right" }}>RECON</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "3vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#FF9E64", width: "10vw", flexShrink: 0 }}>101–150</div>
            <div style={{ height: "1px", flex: 1, backgroundColor: "rgba(255,158,100,0.2)" }} />
            <div style={{ fontSize: "1.3vw", fontWeight: 600, color: "#FF9E64", width: "9vw", textAlign: "right" }}>EXPLOIT</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "3vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#BB9AF7", width: "10vw", flexShrink: 0 }}>151–200</div>
            <div style={{ height: "1px", flex: 1, backgroundColor: "rgba(187,154,247,0.2)" }} />
            <div style={{ fontSize: "1.3vw", fontWeight: 600, color: "#BB9AF7", width: "9vw", textAlign: "right" }}>INTEL</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "3vw" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.2vw", color: "#7AA2F7", width: "10vw", flexShrink: 0 }}>201–230</div>
            <div style={{ height: "1px", flex: 1, backgroundColor: "rgba(122,162,247,0.2)" }} />
            <div style={{ fontSize: "1.3vw", fontWeight: 600, color: "#7AA2F7", width: "9vw", textAlign: "right" }}>ADVANCED</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>14</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
