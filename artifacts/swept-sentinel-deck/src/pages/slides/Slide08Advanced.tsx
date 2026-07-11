export default function Slide08Advanced() {
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
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Intel 151–200</div>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-3vw" }} />
            Advanced 201–230
          </div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "1vh" }}>Advanced Modules</div>
        <div style={{ display: "flex", alignItems: "center", gap: "2vw", marginBottom: "3vh" }}>
          <h1 style={{ fontSize: "4vw", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>Modules 201–230</h1>
          <div style={{ padding: "0.8vh 1.2vw", backgroundColor: "rgba(122,162,247,0.1)", border: "1px solid rgba(122,162,247,0.2)", borderRadius: "0.4vw", fontFamily: "'DM Mono', monospace", fontSize: "0.95vw", color: "#7AA2F7" }}>Fully local · Zero network</div>
        </div>
        <p style={{ fontSize: "1.3vw", color: "#9AA5CE", lineHeight: 1.5, maxWidth: "44vw", margin: "0 0 3.5vh 0" }}>
          Computation and crypto — runs entirely on the server, no external dependencies.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5vw" }}>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#7AA2F7", marginBottom: "0.8vh" }}>201–204</div>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>AES · RSA</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>Cipher + keygen</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#7AA2F7", marginBottom: "0.8vh" }}>205–208</div>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>HMAC · Hash</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>Calc + compare</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#9ECE6A", marginBottom: "0.8vh" }}>209</div>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>QR Encode</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>qrcode library</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#7AA2F7", marginBottom: "0.8vh" }}>210</div>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>Entropy Calc</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>Shannon entropy</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#7AA2F7", marginBottom: "0.8vh" }}>212</div>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>JWT Decode</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>Header + payload + sec</div>
          </div>
          <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#7AA2F7", marginBottom: "0.8vh" }}>227</div>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>Unicode Info</div>
            <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>Codepoint analysis</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>08</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
