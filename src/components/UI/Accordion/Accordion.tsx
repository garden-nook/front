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
    <div className={`${styles.accordion} ${styles[variant]} ${isOpen ? styles.open : ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.header} ${isOpen ? styles.headerOpen : ''}`}
      >
        <span>{title}</span>
      </button>
      {isOpen && <div className={styles.content}>{content}</div>}
    </div>
  );
};

export default Accordion;