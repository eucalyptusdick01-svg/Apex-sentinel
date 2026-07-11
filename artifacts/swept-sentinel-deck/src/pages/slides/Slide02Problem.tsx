export default function Slide02Problem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      {/* Sidebar */}
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Overview</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh", marginBottom: "4vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Introduction</div>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-3vw" }} />
            The Problem
          </div>
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
      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#FF9E64", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>The Problem</div>
        <h1 style={{ fontSize: "4.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 2vh 0", letterSpacing: "-0.02em" }}>
          Fragmented tooling
        </h1>
        <p style={{ fontSize: "1.4vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "42vw", margin: "0 0 5vh 0" }}>
          Investigators juggle 20+ separate tools — whois here, port scanner there, DNS lookup elsewhere.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "3vh", maxWidth: "50vw" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "3vw", height: "3vw", borderRadius: "50%", backgroundColor: "rgba(255,158,100,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9E64", fontSize: "1.2vw", fontWeight: 700, flexShrink: 0 }}>1</div>
            <div>
              <div style={{ fontSize: "1.4vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Context gets lost</div>
              <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5 }}>Switching between tabs and tools breaks the investigation flow. Results aren't correlated.</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "3vw", height: "3vw", borderRadius: "50%", backgroundColor: "rgba(255,158,100,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9E64", fontSize: "1.2vw", fontWeight: 700, flexShrink: 0 }}>2</div>
            <div>
              <div style={{ fontSize: "1.4vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Workflows break</div>
              <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5 }}>No unified interface. Each tool has its own format, output, and authentication requirement.</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "3vw", height: "3vw", borderRadius: "50%", backgroundColor: "rgba(255,158,100,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9E64", fontSize: "1.2vw", fontWeight: 700, flexShrink: 0 }}>3</div>
            <div>
              <div style={{ fontSize: "1.4vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Speed matters in recon</div>
              <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5 }}>Time spent configuring tools is time not spent finding intelligence.</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>02</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
