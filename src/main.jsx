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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
