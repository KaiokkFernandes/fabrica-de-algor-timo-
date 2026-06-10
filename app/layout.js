import "./globals.css";
import { Press_Start_2P, Baloo_2 } from "next/font/google";
import Nav from "./components/Nav";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-baloo2",
  display: "swap",
});

export const metadata = {
  title: "Fábrica de Algoritmos",
  description: "Aprenda algoritmos jogando!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${pressStart.variable} ${baloo2.variable}`}>
        <div className="app-shell">
          <header className="app-header">
            <div className="brand">
              <span>🏭</span>
              <span>FÁBRICA DE ALGORITMOS</span>
            </div>
            <Nav />
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            <span>Fábrica de Algoritmos</span>
            <span className="footer-right">Aprendendo com diversão! 🚀</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
