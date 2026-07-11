export default function Slide10DataArch() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Architecture</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Live Streaming</div>
          <div style={{ fontSize: "1vw", color: "#9ECE6A", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#9ECE6A", borderRadius: "2px", marginLeft: "-3vw" }} />
            Data Sources
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Target Types</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Tech Stack</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#9ECE6A", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>Real Data Architecture</div>
        <h1 style={{ fontSize: "4vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>Free · Live · No auth</h1>
        <p style={{ fontSize: "1.3vw", color: "#9AA5CE", lineHeight: 1.5, maxWidth: "44vw", margin: "0 0 3.5vh 0" }}>
          All real-data modules use free-tier or no-auth public APIs. Python scripts per module.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5vw" }}>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "1.5vw" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#FFFFFF", fontWeight: 500 }}>ip-api.com</div>
              <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Geo · Proxy · ASN</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "1.5vw" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#FFFFFF", fontWeight: 500 }}>HackerTarget</div>
              <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Subdomains · Reverse IP</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "1.5vw" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#FFFFFF", fontWeight: 500 }}>nvd.nist.gov</div>
              <div style={{ fontSize: "0.9vw", color: "#565F89" }}>CVE lookup</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "1.5vw" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#FFFFFF", fontWeight: 500 }}>ipinfo.io</div>
              <div style={{ fontSize: "0.9vw", color: "#565F89" }}>BGP · ASN · full IP data</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "1.5vw" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#FFFFFF", fontWeight: 500 }}>crt.sh · urlscan.io</div>
              <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Cert history · URL scan</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "1.5vw" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", backgroundColor: "#9ECE6A", borderRadius: "50%", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#FFFFFF", fontWeight: 500 }}>GreyNoise · archive.org</div>
              <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Threat intel · Wayback</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>10</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
