export default function Slide06Recon() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Categories</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Network 001–010</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Social 011–050</div>
          <div style={{ fontSize: "1vw", color: "#E0AF68", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#E0AF68", borderRadius: "2px", marginLeft: "-3vw" }} />
            Recon 051–100
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Exploit 101–150</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Intel 151–200</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Advanced 201–230</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#E0AF68", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "1vh" }}>Recon Modules</div>
        <div style={{ display: "flex", alignItems: "center", gap: "2vw", marginBottom: "3vh" }}>
          <h1 style={{ fontSize: "4vw", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>Modules 051–100</h1>
          <div style={{ padding: "0.8vh 1.2vw", backgroundColor: "rgba(224,175,104,0.1)", border: "1px solid rgba(224,175,104,0.2)", borderRadius: "0.4vw", fontFamily: "'DM Mono', monospace", fontSize: "0.95vw", color: "#E0AF68" }}>Live lookups via public APIs</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "3vw", height: "3vw", borderRadius: "50%", backgroundColor: "rgba(224,175,104,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#E0AF68", fontSize: "1vw", fontWeight: 700, flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>051</div>
            <div>
              <div style={{ fontSize: "1.3vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>SSL Cert Info</div>
              <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Raw TLS handshake — issuer, expiry, SANs, chain depth</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "3vw", height: "3vw", borderRadius: "50%", backgroundColor: "rgba(224,175,104,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#E0AF68", fontSize: "1vw", fontWeight: 700, flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>052</div>
            <div>
              <div style={{ fontSize: "1.3vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>Wayback Check</div>
              <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>archive.org — first/last snapshot, total capture count</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "3vw", height: "3vw", borderRadius: "50%", backgroundColor: "rgba(224,175,104,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#E0AF68", fontSize: "1vw", fontWeight: 700, flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>054</div>
            <div>
              <div style={{ fontSize: "1.3vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>HTTP Fingerprint</div>
              <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Server headers, response codes, redirect chain</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "3vw", height: "3vw", borderRadius: "50%", backgroundColor: "rgba(224,175,104,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#E0AF68", fontSize: "1vw", fontWeight: 700, flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>061</div>
            <div>
              <div style={{ fontSize: "1.3vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>Subdomain Scan</div>
              <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>HackerTarget API — live subdomain enumeration</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "3vw", height: "3vw", borderRadius: "50%", backgroundColor: "rgba(158,206,106,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ECE6A", fontSize: "1vw", fontWeight: 700, flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>090</div>
            <div>
              <div style={{ fontSize: "1.3vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>Shodan Probe · Threat Intel · Tor Check</div>
              <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>InternetDB · GreyNoise · Tor exit node list</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>06</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
