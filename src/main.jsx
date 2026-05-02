// Silence Recharts XAxis/YAxis defaultProps deprecation warnings (library-internal).
const origError = console.error;
console.error = function (...args) {
  const msg = args[0];
  if (typeof msg === "string" && msg.indexOf("defaultProps") !== -1) return;
  return origError.apply(console, args);
};

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: String(error?.message || error || "Unknown error") };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[anima-sheets] uncaught render error", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0b0b0b",
          color: "#f5f5f5",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 680, width: "100%", border: "1px solid #2f2f2f", borderRadius: 14, padding: 20, background: "#151515" }}>
          <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.2 }}>Anima Sheets ist auf einen Fehler gelaufen</h1>
          <p style={{ marginTop: 12, marginBottom: 8, color: "#b8b8b8" }}>Bitte Seite neu laden. Wenn es bleibt: diese Meldung an Codex schicken.</p>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#ff9a9a" }}>{this.state.message}</pre>
        </div>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
