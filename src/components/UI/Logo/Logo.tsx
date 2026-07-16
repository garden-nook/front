import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Logo.module.css';
import logoIcon from '/src/assets/logo.svg';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <Link to="/" className={`${styles.logo} ${className || ''}`}>
      <img src={logoIcon} alt="Логотип" className={styles.icon} />
      <span className={styles.text}>Огородный уголок</span>
    </Link>
  );
};

export default Logo;