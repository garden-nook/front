import React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder = "Введите текст",
  id,
  className = "",
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-") || "input";

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        placeholder={placeholder}
        className={`${styles.input} ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
