import "./globals.css";
import { Press_Start_2P, Nunito } from "next/font/google";

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

export const metadata = {
  title: "RoboBlocks",
  description: "Aprenda algoritmos jogando!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${pressStart.variable} ${nunito.variable}`}>
        <div className="app-shell">
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
