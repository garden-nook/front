import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import Input from '../../UI/Input/Input';

interface AddBedModalProps {
  open: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
  defaultName?: string;
}

export const AddBedModal: React.FC<AddBedModalProps> = ({
  open,
  onSave,
  onClose,
  defaultName = '',
}) => {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) {
      setName(defaultName);
    }
  }, [open, defaultName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h3>Новая грядка</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalField}>
            <label htmlFor="bedName">Название грядки:</label>
            <Input
              id="bedName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название грядки"
              autoFocus
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit" className={styles.primary} disabled={!name.trim()}>
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBedModal;