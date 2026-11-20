import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "./index.css";
import { capturePromoFromUrl } from "./lib/promo";

// Kód z pozvánky (?kod=…) si zapamatujeme, uplatní se po přihlášení.
capturePromoFromUrl();

createRoot(document.getElementById("root")!).render(<App />);
