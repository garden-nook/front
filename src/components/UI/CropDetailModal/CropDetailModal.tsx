// src/components/UI/CropDetailModal/CropDetailModal.tsx
import React from 'react';
import styles from './CropDetailModal.module.css';
import Accordion from '../Accordion/Accordion';

interface CropDetailModalProps {
  crop: {
    id: string;
    name: string;
    family_name: string;
    vegetation_days_avg: number;
    soil_name: string;
    sun_needs: number;
    image?: string;
    description?: string;
    predecessors?: { good: string[]; bad: string[] };
    neighbors?: { good: string[]; bad: string[] };
    following?: string[];
  };
  onClose: () => void;
}

function mapSunNeeds(value: number): string {
  switch (value) {
    case 1: return 'Солнце';
    case 2: return 'Полутень';
    case 3: return 'Тень';
    default: return 'Не указано';
  }
}

const CropDetailModal: React.FC<CropDetailModalProps> = ({ crop, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const specs = [
    { label: 'Семейство', value: crop.family_name || 'Не указано' },
    { label: 'Срок вегетации', value: `${crop.vegetation_days_avg} дн.` },
    { label: 'Вид почвы', value: crop.soil_name || 'Не указано' },
    { label: 'Освещённость', value: mapSunNeeds(crop.sun_needs) },
  ];

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className={styles.title}>{crop.name}</h2>

        <div className={styles.mainRow}>
          <div className={styles.imageWrapper}>
            {crop.image ? (
              <img src={crop.image} alt={crop.name} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder} />
            )}
          </div>
          <p className={styles.description}>{crop.description || 'Описание отсутствует'}</p>
        </div>

        <div className={styles.specsList}>
          {specs.map((spec, index) => (
            <div key={index} className={styles.specRow}>
              <span className={styles.specLabel}>{spec.label}</span>
              <span className={styles.specValue}>{spec.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.accordions}>
          {(crop.predecessors?.good?.length || crop.predecessors?.bad?.length) && (
            <Accordion
              title="Предшественники"
              content={
                <div className={styles.accordionContent}>
                  {crop.predecessors?.good?.length > 0 && (
                    <div className={styles.accordionRow}>
                      <span className={styles.accordionLabel}>Хорошие:</span>
                      <span className={styles.accordionValue}>
                        {crop.predecessors.good.join(', ')}
                      </span>
                    </div>
                  )}
                  {crop.predecessors?.bad?.length > 0 && (
                    <div className={styles.accordionRow}>
                      <span className={styles.accordionLabel}>Плохие:</span>
                      <span className={styles.accordionValue}>
                        {crop.predecessors.bad.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              }
            />
          )}

          {(crop.neighbors?.good?.length || crop.neighbors?.bad?.length) && (
            <Accordion
              title="Соседи"
              content={
                <div className={styles.accordionContent}>
                  {crop.neighbors?.good?.length > 0 && (
                    <div className={styles.accordionRow}>
                      <span className={styles.accordionLabel}>Хорошие:</span>
                      <span className={styles.accordionValue}>
                        {crop.neighbors.good.join(', ')}
                      </span>
                    </div>
                  )}
                  {crop.neighbors?.bad?.length > 0 && (
                    <div className={styles.accordionRow}>
                      <span className={styles.accordionLabel}>Плохие:</span>
                      <span className={styles.accordionValue}>
                        {crop.neighbors.bad.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              }
            />
          )}

          {crop.following && crop.following.length > 0 && (
            <Accordion
              title="Последующие культуры"
              content={
                <div className={styles.accordionContent}>
                  <div className={styles.accordionRow}>
                    <span className={styles.accordionValue}>
                      {crop.following.join(', ')}
                    </span>
                  </div>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CropDetailModal;