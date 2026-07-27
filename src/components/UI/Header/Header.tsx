import React from "react";
import Logo from "../Logo/Logo";
import Nav from "../Nav/Nav";
import ProfileButton from "../ProfileButton/ProfileButton";
import styles from "./Header.module.css";

interface HeaderProps {
  userId: string;
  firstName: string;
}

const Header: React.FC<HeaderProps> = ({ userId, firstName }) => {
  const navLinks = [
    { label: "Мои участки", to: "/" },
    { label: "Каталог культур", to: "/catalog" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoWrapper}>
          <Logo />
        </div>
        <div className={styles.navWrapper}>
          <Nav links={navLinks} />
        </div>
        <div className={styles.profileWrapper}>
          <ProfileButton userId={userId} firstName={firstName} />
        </div>
      </div>
    </header>
  );
};

export default Header;
