import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Nav.module.css";

interface NavProps {
  links: { label: string; to: string }[];
}

const Nav: React.FC<NavProps> = ({ links }) => {
  const location = useLocation();

  return (
    <nav className={styles.nav}>
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`${styles.link} ${isActive ? styles.active : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Nav;
