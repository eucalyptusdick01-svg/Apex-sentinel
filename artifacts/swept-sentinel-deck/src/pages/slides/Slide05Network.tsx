export default function Slide05Network() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Categories</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-3vw" }} />
            Network 001–010
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Social 011–050</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Recon 051–100</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Exploit 101–150</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Intel 151–200</div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Advanced 201–230</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "1vh" }}>Network Modules</div>
        <div style={{ display: "flex", alignItems: "center", gap: "2vw", marginBottom: "3vh" }}>
          <h1 style={{ fontSize: "4vw", fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>Modules 001–010</h1>
          <div style={{ padding: "0.8vh 1.2vw", backgroundColor: "rgba(158,206,106,0.1)", border: "1px solid rgba(158,206,106,0.2)", borderRadius: "0.4vw", fontFamily: "'DM Mono', monospace", fontSize: "0.95vw", color: "#9ECE6A" }}>All real data · No keys required</div>
        </div>
        <div style={{ display: "flex", gap: "4vw" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5vh" }}>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#565F89" }}>001</div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>IP Tracker</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>ip-api.com</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#565F89" }}>002</div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>DNS Resolve</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>Node dns/promises</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#565F89" }}>003</div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>Port Scan</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>Raw TCP connect</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#565F89" }}>005</div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>Whois Query</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>RDAP protocol</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#565F89" }}>007</div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>Email Rep</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>DNS MX lookup</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5vh" }}>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#565F89" }}>008</div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>Proxy Check</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>ip-api.com</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#565F89" }}>010</div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>Geolocate</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>ip-api.com</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#565F89" }}>011</div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>GitHub Lookup</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>GitHub API</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#565F89" }}>012</div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>Username Check</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>HTTP probing</div>
            </div>
            <div style={{ backgroundColor: "rgba(158,206,106,0.06)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw", border: "1px solid rgba(158,206,106,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1vw", color: "#9ECE6A" }}>ALL</div>
              <div style={{ fontSize: "1.1vw", color: "#9ECE6A", fontWeight: 600 }}>Real · Live · Free</div>
              <div style={{ fontSize: "0.9vw", color: "#9AA5CE" }}>No auth required</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>05</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
