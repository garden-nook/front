import React, { useState } from 'react';
import styles from './Accordion.module.css';

interface AccordionProps {
  title: string;
  content: string;
  variant?: 'default' | 'success' | 'danger';
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  content,
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.accordion} ${styles[variant]}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.header}
      >
        <span>{title}</span>
        <svg
          className={`${styles.icon} ${isOpen ? styles.open : ''}`}
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className={styles.content}>{content}</div>}
    </div>
  );
};

export default Accordion;