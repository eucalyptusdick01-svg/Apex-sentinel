export default function Slide11Targets() {
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
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Data Sources</div>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-3vw" }} />
            Target Types
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Tech Stack</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>Target Types</div>
        <h1 style={{ fontSize: "4.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 4vh 0", letterSpacing: "-0.02em" }}>Four input types</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh", maxWidth: "52vw" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2.5vw", backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(122,162,247,0.2)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1vw", color: "#7AA2F7", fontWeight: 700, width: "8vw", flexShrink: 0 }}>IPv4 Address</div>
            <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5 }}>Geolocate · Port scan · BGP route · Proxy check · Shodan probe · Tor exit</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2.5vw", backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(158,206,106,0.2)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1vw", color: "#9ECE6A", fontWeight: 700, width: "8vw", flexShrink: 0 }}>Domain</div>
            <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5 }}>DNS · WHOIS · SSL cert · Subdomains · Tech stack · DMARC · Wayback</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2.5vw", backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(224,175,104,0.2)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1vw", color: "#E0AF68", fontWeight: 700, width: "8vw", flexShrink: 0 }}>Email</div>
            <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5 }}>MX lookup · DMARC · SPF · DKIM · Email validation · Reputation</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2.5vw", backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(187,154,247,0.2)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1vw", color: "#BB9AF7", fontWeight: 700, width: "8vw", flexShrink: 0 }}>Username</div>
            <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.5 }}>GitHub · GitLab · Reddit · npm · HackerNews · DEV.to · StackOverflow</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>11</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
