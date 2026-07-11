export default function Slide13TechStack() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "5vh 3vw", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "6vh" }}>
          <div style={{ width: "1.5vw", height: "1.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.3vw" }} />
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#FFFFFF" }}>swept-sentinel</div>
        </div>
        <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2vh" }}>Product</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Terminal Experience</div>
          <div style={{ fontSize: "1vw", color: "#7AA2F7", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "4px", height: "1.2vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-3vw" }} />
            Tech Stack
          </div>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", opacity: 0.7 }}>Deployment</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.8vw", color: "#565F89" }}>v1.0.0 · 2026</div>
      </div>

      <div style={{ flex: 1, padding: "8vh 6vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "2vh" }}>Tech Stack</div>
        <h1 style={{ fontSize: "4.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 4vh 0", letterSpacing: "-0.02em" }}>Built to spec</h1>
        <div style={{ display: "flex", gap: "4vw" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ fontSize: "1vw", fontWeight: 600, color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5vh" }}>Frontend</div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.05vw", color: "#9ECE6A" }}>React + Vite</div>
              <div style={{ fontSize: "1vw", color: "#565F89", marginTop: "0.3vh" }}>TypeScript · Tailwind CSS</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.05vw", color: "#9ECE6A" }}>Orval codegen</div>
              <div style={{ fontSize: "1vw", color: "#565F89", marginTop: "0.3vh" }}>OpenAPI → React Query hooks + Zod</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ fontSize: "1vw", fontWeight: 600, color: "#E0AF68", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5vh" }}>Backend</div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.05vw", color: "#E0AF68" }}>Node.js 24 · Express 5</div>
              <div style={{ fontSize: "1vw", color: "#565F89", marginTop: "0.3vh" }}>SSE streaming · esbuild CJS bundle</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.05vw", color: "#E0AF68" }}>80+ Python scripts</div>
              <div style={{ fontSize: "1vw", color: "#565F89", marginTop: "0.3vh" }}>One script per real module · subprocess</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ fontSize: "1vw", fontWeight: 600, color: "#9ECE6A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5vh" }}>Data</div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.05vw", color: "#9ECE6A" }}>PostgreSQL + Drizzle</div>
              <div style={{ fontSize: "1vw", color: "#565F89", marginTop: "0.3vh" }}>ORM · schema migrations</div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.8vh 1.5vw", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.05vw", color: "#9ECE6A" }}>Zod v4</div>
              <div style={{ fontSize: "1vw", color: "#565F89", marginTop: "0.3vh" }}>Input/output validation · drizzle-zod</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1vw", color: "#565F89", fontWeight: 500 }}>13</div>
          <div style={{ fontSize: "0.9vw", color: "#565F89" }}>Swept Sentinel, 2026</div>
        </div>
      </div>
    </div>
  );
}
