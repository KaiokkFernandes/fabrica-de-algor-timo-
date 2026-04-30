import "./globals.css";
import { Press_Start_2P } from "next/font/google";
import Nav from "./components/Nav";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
});

export const metadata = {
  title: "Fabrica de Algoritmos",
  description: "Aprenda algoritmos jogando!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={pressStart.variable}>
        <div className="app-shell">
          <header className="app-header">
            <div className="brand">
              <span>🏭</span>
              <span>FABRICA DE ALGORITMOS</span>
            </div>
            <Nav />
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            <span>SISTEMA DE TREINAMENTO</span>
            <span className="footer-right">EF04CO01 — V1.0</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
