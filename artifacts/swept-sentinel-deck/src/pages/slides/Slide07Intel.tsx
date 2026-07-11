export default function Slide07Intel() {
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
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Recon 051–100</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Exploit 101–150</div>
          <div style={{ fontSize: "1vw", color: "#BB9AF7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#BB9AF7", borderRadius: "2px", marginLeft: "-3vw" }} />
            Intel 151–200
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Advanced 201–230</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#BB9AF7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "1vh" }}>Intel Modules</div>
        <h1 style={{ fontSize: "4vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>Modules 151–200</h1>
        <p style={{ fontSize: "1.3vw", color: "#9AA5CE", lineHeight: 1.5, maxWidth: "44vw", margin: "0 0 3.5vh 0" }}>
          Cross-referenced from NVD, crt.sh, GreyNoise, urlscan.io.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2vw" }}>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(187,154,247,0.15)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#BB9AF7", marginBottom: "1vh" }}>NVD · nvd.nist.gov</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>CVE Lookup</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Search vulnerabilities by ID, keyword, or CPE string</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(187,154,247,0.15)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#BB9AF7", marginBottom: "1vh" }}>ipinfo.io</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>BGP Route</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>ASN, org, prefix, route origin</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(187,154,247,0.15)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#BB9AF7", marginBottom: "1vh" }}>DNS · RDAP</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>DMARC · SPF · DKIM · DNSSEC</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Full email security record analysis</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.5vw", padding: "2.5vh 2vw", border: "1px solid rgba(187,154,247,0.15)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", color: "#BB9AF7", marginBottom: "1vh" }}>urlscan.io · GreyNoise · crt.sh</div>
            <div style={{ fontSize: "1.2vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>URL Scan · Threat Intel · Cert History</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE" }}>Live threat feeds and certificate transparency</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>07</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
