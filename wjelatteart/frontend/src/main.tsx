import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { applyTheme, useThemeStore } from "./stores/useThemeStore";
import "./styles/theme.css";
import "./styles/global.css";

applyTheme(useThemeStore.getState().theme);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

