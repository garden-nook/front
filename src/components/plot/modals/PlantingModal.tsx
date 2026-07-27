import React, { useState } from 'react';
import styles from './Modals.module.css';
import type { UIBed, UICrop } from '../../../api/types/plot.types';

interface PlantingModalProps {
  bed: UIBed;
  cropId: number;
  plantedDate: string;
  crops: UICrop[];
  onSave: (cropId: number, plantedDate: string) => void;
  onClose: () => void;
}

export const PlantingModal: React.FC<PlantingModalProps> = ({
  bed,
  cropId: initialCropId,
  plantedDate: initialPlantedDate,
  crops,
  onSave,
  onClose,
}) => {
  const [cropId, setCropId] = useState(initialCropId);
  const [plantedDate, setPlantedDate] = useState(initialPlantedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cropId, plantedDate);
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h3>🌱 Посадка на грядку</h3>
        <p className={styles.modalSubtitle}>"{bed.name}" ({bed.width}×{bed.height})</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalField}>
            <label>Культура:</label>
            <select value={cropId} onChange={(e) => setCropId(Number(e.target.value))}>
              {crops.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} ({crop.vegetationDays} дн.)
                </option>
              ))}
            </select>
          </div>
          <div className={styles.modalField}>
            <label>Дата посадки:</label>
            <input type="date" value={plantedDate} onChange={(e) => setPlantedDate(e.target.value)} />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit" className={styles.primary}>Посадить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantingModal;