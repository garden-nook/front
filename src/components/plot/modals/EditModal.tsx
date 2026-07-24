import React, { useState } from 'react';
import styles from './Modals.module.css';
import type { GardenObject } from '../../../api/types/plot.types';

interface EditModalProps {
  object: GardenObject;
  name: string;
  width: number;
  height: number;
  onSave: (name: string, width: number, height: number) => void;
  onClose: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  object,
  name: initialName,
  width: initialWidth,
  height: initialHeight,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialName);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (width < 1 || height < 1) {
      alert('Размеры должны быть больше 0');
      return;
    }
    onSave(name, width, height);
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h3>✏️ Редактировать объект</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalField}>
            <label>Название:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.modalField}>
            <label>Ширина (клеток):</label>
            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} min={1} step={1} />
          </div>
          <div className={styles.modalField}>
            <label>Высота (клеток):</label>
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} min={1} step={1} />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit" className={styles.primary}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;