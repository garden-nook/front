import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Avatar from "../../Avatar";
import styles from "./ProfileButton.module.css";

interface ProfileButtonProps {
  userId: string;
  firstName: string;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ userId, firstName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={styles.button}>
        <Avatar userId={userId} firstName={firstName} size={32} />
        <svg
          className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`}
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <button type="button" onClick={handleProfileClick} className={styles.menuItem}>
            Профиль
          </button>
          <button type="button" onClick={handleLogout} className={styles.menuItem}>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
