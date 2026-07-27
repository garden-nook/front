// src/pages/PlotEditor/components/plot/BedInfo.tsx
import React from 'react';
import styles from './BedInfo.module.css';
import type { UIBed } from '../../api/types/plot.types';
import ActionButton from '../UI/ActionButton';

interface BedInfoProps {
  bed: UIBed;
  showPlantButton?: boolean;
  onPlant: () => void;
  onHarvest?: () => void;
}

export const BedInfo: React.FC<BedInfoProps> = ({
  bed,
  showPlantButton = false,
  onPlant,
  onHarvest,
}) => {
  // Проверяем наличие активной посадки по currentCropId или plantings
  const hasActivePlanting = 
    (bed.currentCropId !== null && bed.currentCropId !== undefined) ||
    bed.plantings?.some(p => !p.harvestDate) || false;

  console.log('BedInfo состояние:', {
    bedName: bed.name,
    currentCropId: bed.currentCropId,
    plantings: bed.plantings,
    hasActivePlanting,
  });

  return (
    <div className={styles.bedInfoWrapper}>
      <div className={styles.bedInfo}>
        <div className={styles.bedInfoHeader}>
          <span className={styles.bedInfoTitle}>Информация о грядке</span>
        </div>
        <div className={styles.bedInfoContent}>
          <div className={styles.bedInfoRow}>
            <span className={styles.bedInfoLabel}>Название:</span>
            <span className={styles.bedInfoValue}>{bed.name}</span>
          </div>
          <div className={styles.bedInfoRow}>
            <span className={styles.bedInfoLabel}>Размер:</span>
            <span className={styles.bedInfoValue}>
              {bed.width} × {bed.height} ({(bed.width * 0.5).toFixed(1)} × {(bed.height * 0.5).toFixed(1)} м)
            </span>
          </div>
          {hasActivePlanting && (
            <div className={styles.bedInfoRow}>
              <span className={styles.bedInfoLabel}>Посажено:</span>
              <span className={styles.bedInfoValue}>
                {bed.currentCropName}
              </span>
            </div>
          )}
          {showPlantButton && (
            <div className={styles.plantButtonWrapper}>
              {hasActivePlanting ? (
                <ActionButton
                  onClick={onHarvest || (() => {})}
                  title="Собрать урожай"
                  color="red"
                />
              ) : (
                <ActionButton
                  onClick={onPlant}
                  title="Посадить"
                  color="greenDark"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BedInfo;