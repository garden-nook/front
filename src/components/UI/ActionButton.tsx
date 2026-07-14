import React from 'react';
import styles from './ActionButtons.module.css';
import addIcon from '../../assets/add.svg';
import editIcon from '../../assets/edit.svg';
import deleteIcon from '../../assets/delete.svg';
import cancelIcon from '../../assets/cancel.svg';

type IconType = 'add' | 'edit' | 'delete' | 'cancel';
type colorType = 'greenLight' | 'greenDark' | 'red';

interface ActionButtonProps{
  onClick?: () => void;
  title?: string;
  icon?: IconType;
  color?: colorType;
  shape?: 'littleSquare' | 'square' | 'circle' | 'text';
}

const iconMap: Record<IconType, string> = {
  add: addIcon,
  edit: editIcon,
  delete: deleteIcon,
  cancel: cancelIcon,
};

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  title = 'Кнопка', 
  icon,
  color,
  shape = 'text',
}) => {
    const classArray = [
    styles.actionBtn,
    styles[shape],
    icon ? styles.iconType : styles.withText,
  ];
  if (color) classArray.push(styles[color])
    const buttonClasses = classArray
    .filter(Boolean)
    .join(' ');
  const iconClassArray = [
    styles.icon,
    styles[`icon_${shape}`],
  ];
  const iconClasses = iconClassArray.filter(Boolean).join(' ');
  return (
    <button 
      onClick={onClick} 
      className={buttonClasses} 
      title={title}
    >
       {icon? (
        <img 
          src={iconMap[icon]} 
          alt={title} 
          className={iconClasses} 
        />
       ): <span className={styles.buttonText}>{title}</span>}
    </button>
  );
};

export default ActionButton;