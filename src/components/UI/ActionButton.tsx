import React from 'react';
import styles from './ActionButtons.module.css';
import addIcon from '../../assets/add.svg';
import editIcon from '../../assets/edit.svg';
import deleteIcon from '../../assets/delete.svg';

type IconType = 'add' | 'edit' | 'delete';

interface ActionButtonProps{
  onClick?: () => void;
  title?: string;
  icon?: IconType;
  shape?: 'littleSquare' | 'square' | 'circle' | 'text';
}

const iconMap: Record<IconType, string> = {
  add: addIcon,
  edit: editIcon,
  delete: deleteIcon,
};

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  title = 'Кнопка', 
  icon = undefined,
  shape = 'text',
}) => {
    const buttonClasses = [
    styles.actionBtn,
    styles[shape],
    icon ? styles.withIcon : styles.withText,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button 
      onClick={onClick} 
      className={buttonClasses} 
      title={title}
    >
       {icon? <img src={iconMap[icon]} alt={title} className={styles.icon} />
       : <span className={styles.buttonText}>{title}</span>}
    </button>
  );
};

export default ActionButton;