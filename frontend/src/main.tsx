import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("No se encontró el elemento root.");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
