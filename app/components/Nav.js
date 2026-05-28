import Link from "next/link";
import styles from "./Nav.module.css";

const links = [
  { href: "/", label: "HOME", icon: "🏠" },
  { href: "/introducao", label: "INTRO", icon: "📋" },
  { href: "/menu", label: "MAPA", icon: "🗺️" },
  { href: "/fases", label: "JOGAR", icon: "⚙️" },
  { href: "/manual", label: "MANUAL", icon: "📖" },
];

export default function Nav() {
  return (
    <nav className={styles.nav}>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={styles.link}>
          <span className={styles.icon}>{link.icon}</span>
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}
