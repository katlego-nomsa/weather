import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  // The current page gets an underline
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.active : ""}`;

  return (
    <header className={`container ${styles.bar}`}>
      <Link to="/" className={styles.logo}>
        <span className={styles.mark} aria-hidden="true" />
        Weather
      </Link>

      <nav aria-label="Main" className={styles.nav}>
        <NavLink to="/" end className={linkClass}>
          Weather
        </NavLink>
        <NavLink to="/locations" className={linkClass}>
          Locations
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          Settings
        </NavLink>
      </nav>
    </header>
  );
}