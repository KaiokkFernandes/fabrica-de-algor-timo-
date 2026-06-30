import "./globals.css";
import { Press_Start_2P, Nunito } from "next/font/google";
import localFont from "next/font/local";
import ClickSound from "./components/ClickSound";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-fredoka",
  display: "swap",
});

// Hospedada localmente (app/fonts) — não depende mais do Google Fonts em runtime
const jersey20 = localFont({
  src: "./fonts/Jersey20-Regular.ttf",
  weight: "400",
  variable: "--font-jersey",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata = {
  title: "RoboBlocks",
  description: "Aprenda algoritmos jogando!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${pressStart.variable} ${nunito.variable} ${jersey20.variable}`}>
        <ClickSound />
        <div className="app-shell">
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
