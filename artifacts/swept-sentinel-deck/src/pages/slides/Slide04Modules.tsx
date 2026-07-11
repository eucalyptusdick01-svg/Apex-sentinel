export default function Slide04Modules() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Overview</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh", marginBottom: "4vh" }}>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-3vw" }} />
            230 Modules
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Architecture</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Categories</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Network</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Social</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Recon</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Intel</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Advanced</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>Module Coverage</div>
        <h1 style={{ fontSize: "4.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>230 Modules</h1>
        <p style={{ fontSize: "1.3vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "44vw", margin: "0 0 4vh 0" }}>
          Six categories. 128 return real live data from free APIs and protocols. 102 cover paid/authenticated sources.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2vw" }}>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(122,162,247,0.2)" }}>
            <div style={{ fontSize: "0.85vw", fontWeight: 600, color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>Network</div>
            <div style={{ fontSize: "1.8vw", fontWeight: 700, color: "#FFFFFF", fontFamily: "'DM Mono', monospace", marginBottom: "0.5vh" }}>001–010</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>IP, DNS, Ports, Whois</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(158,206,106,0.2)" }}>
            <div style={{ fontSize: "0.85vw", fontWeight: 600, color: "#9ECE6A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>Social</div>
            <div style={{ fontSize: "1.8vw", fontWeight: 700, color: "#FFFFFF", fontFamily: "'DM Mono', monospace", marginBottom: "0.5vh" }}>011–050</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>GitHub, Reddit, npm</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(224,175,104,0.2)" }}>
            <div style={{ fontSize: "0.85vw", fontWeight: 600, color: "#E0AF68", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>Recon</div>
            <div style={{ fontSize: "1.8vw", fontWeight: 700, color: "#FFFFFF", fontFamily: "'DM Mono', monospace", marginBottom: "0.5vh" }}>051–100</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>SSL, Wayback, Tech Stack</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(255,158,100,0.2)" }}>
            <div style={{ fontSize: "0.85vw", fontWeight: 600, color: "#FF9E64", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>Exploit</div>
            <div style={{ fontSize: "1.8vw", fontWeight: 700, color: "#FFFFFF", fontFamily: "'DM Mono', monospace", marginBottom: "0.5vh" }}>101–150</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>CVE, Ciphers, Encoding</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(187,154,247,0.2)" }}>
            <div style={{ fontSize: "0.85vw", fontWeight: 600, color: "#BB9AF7", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>Intel</div>
            <div style={{ fontSize: "1.8vw", fontWeight: 700, color: "#FFFFFF", fontFamily: "'DM Mono', monospace", marginBottom: "0.5vh" }}>151–200</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>BGP, Threat Intel, DMARC</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(122,162,247,0.2)" }}>
            <div style={{ fontSize: "0.85vw", fontWeight: 600, color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>Advanced</div>
            <div style={{ fontSize: "1.8vw", fontWeight: 700, color: "#FFFFFF", fontFamily: "'DM Mono', monospace", marginBottom: "0.5vh" }}>201–230</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>Crypto, JWT, Unicode</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>04</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
