export default function Slide03WhatItIs() {
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
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>The Problem</div>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-3vw" }} />
            What It Is
          </div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Reference</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Network</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Recon</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Intel</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>What It Is</div>
        <h1 style={{ fontSize: "4.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 2vh 0", letterSpacing: "-0.02em" }}>
          One dashboard. 230 modules.
        </h1>
        <p style={{ fontSize: "1.4vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "44vw", margin: "0 0 5vh 0" }}>
          A single retro terminal dashboard that runs any of 230 numbered investigation modules against an IP, domain, email, or username — and streams live results line by line.
        </p>
        <div style={{ display: "flex", gap: "3vw" }}>
          <div style={{ flex: 1, backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "3vh 2.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "3vw", fontWeight: 700, color: "#7AA2F7", marginBottom: "1vh", fontFamily: "'DM Mono', monospace" }}>230</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Total modules</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Across six investigation categories</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "3vh 2.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "3vw", fontWeight: 700, color: "#9ECE6A", marginBottom: "1vh", fontFamily: "'DM Mono', monospace" }}>128</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Real data modules</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Free APIs, raw TCP, Python stdlib</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "3vh 2.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "3vw", fontWeight: 700, color: "#E0AF68", marginBottom: "1vh", fontFamily: "'DM Mono', monospace" }}>4</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Target types</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>IP · Domain · Email · Username</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>03</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
