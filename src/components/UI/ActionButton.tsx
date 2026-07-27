import React from "react";
import addIcon from "../../assets/add.svg";
import cancelIcon from "../../assets/cancel.svg";
import cursorIcon from "../../assets/cursor.svg";
import deleteIcon from "../../assets/delete.svg";
import editIcon from "../../assets/edit.svg";
import logoIcon from "../../assets/logo.svg";
import minusIcon from "../../assets/minus.svg";
import styles from "./ActionButtons.module.css";

type IconType = "add" | "edit" | "delete" | "cancel" | "minus" | "logo" | "cursor";
type colorType = "greenLight" | "greenDark" | "red";

interface ActionButtonProps {
  onClick?: () => void;
  title?: string;
  icon?: IconType;
  color?: colorType;
  shape?: "littleSquare" | "square" | "circle" | "littleCircle" | "miniCircle" | "text";
  disabled?: boolean;
}

const iconMap: Record<IconType, string> = {
  add: addIcon,
  edit: editIcon,
  delete: deleteIcon,
  cancel: cancelIcon,
  minus: minusIcon,
  logo: logoIcon,
  cursor: cursorIcon,
};

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  title = "Кнопка",
  icon,
  color,
  shape = "text",
  disabled = false,
}) => {
  const classArray = [styles.actionBtn, styles[shape], icon ? styles.iconType : styles.withText];
  if (color) classArray.push(styles[color]);
  const buttonClasses = classArray.filter(Boolean).join(" ");
  if (disabled) classArray.push(styles.disabled);
  const iconClassArray = [styles.icon, styles[`icon_${shape}`]];
  const iconClasses = iconClassArray.filter(Boolean).join(" ");
  return (
    <button onClick={onClick} className={buttonClasses} title={title} disabled={disabled}>
      {icon ? (
        <img src={iconMap[icon]} alt={title} className={iconClasses} />
      ) : (
        <span className={styles.buttonText}>{title}</span>
      )}
    </button>
  );
};

export default ActionButton;
