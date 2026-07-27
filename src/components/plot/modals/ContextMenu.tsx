import React, { useState } from "react";
import type { GardenObject } from "../../../api/types/plot.types";
import Input from "../../UI/Input/Input";
import styles from "./Modals.module.css";

interface ContextMenuProps {
  x: number;
  y: number;
  object: GardenObject;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  object,
  onDelete,
  onRename,
  onClose,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(object.name);

  const handleRename = () => {
    if (newName.trim() && newName !== object.name) {
      onRename(object.id, newName.trim());
    }
    setIsRenaming(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
      setNewName(object.name);
    }
  };

  return (
    <>
      <div className={styles.contextMenuOverlay} onClick={onClose} />
      <div className={styles.contextMenu} style={{ left: x, top: y }}>
        {isRenaming ? (
          <div className={styles.renameContainer}>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите новое название"
              className={styles.renameInput}
              autoFocus
            />
            <div className={styles.renameActions}>
              <button
                onClick={() => {
                  setIsRenaming(false);
                  setNewName(object.name);
                }}
              >
                Отмена
              </button>
              <button className={styles.primary} onClick={handleRename}>
                Сохранить
              </button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={() => setIsRenaming(true)}>Переименовать</button>
            <button className={styles.danger} onClick={() => onDelete(object.id)}>
              Удалить
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ContextMenu;
