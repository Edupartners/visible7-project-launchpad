import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { capturePromoFromUrl } from "./lib/promo";

// Kód z pozvánky (?kod=…) si zapamatujeme, uplatní se po přihlášení.
capturePromoFromUrl();

createRoot(document.getElementById("root")!).render(<App />);
