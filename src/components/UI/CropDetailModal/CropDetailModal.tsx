import React from 'react';
import styles from './CropDetailModal.module.css';
import Accordion from '../Accordion/Accordion';
import type { Crop } from '../../../types/crop';

interface CropDetailModalProps {
  crop: Crop;
  onClose: () => void;
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

  // Собираем характеристики в массив для отображения
  const specs = [
    { label: 'Семейство', value: crop.family },
    { label: 'Срок вегетации', value: `${crop.vegetationDays} дн.` },
    { label: 'Вид почвы', value: crop.soilNeeds },
    { label: 'Освещённость', value: crop.lightNeeds },
    ...(crop.feeding ? [{ label: 'Питание', value: crop.feeding }] : []),
    ...(crop.enrichment ? [{ label: 'Обогащение почвы', value: crop.enrichment }] : []),
  ];

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        {/* Кнопка закрытия */}
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Заголовок — название культуры */}
        <h2 className={styles.title}>{crop.name}</h2>

        {/* Основной блок: фото + описание */}
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

        {/* Характеристики — одна колонка, слева название, справа значение */}
        <div className={styles.specsList}>
          {specs.map((spec, index) => (
            <div key={index} className={styles.specRow}>
              <span className={styles.specLabel}>{spec.label}</span>
              <span className={styles.specValue}>{spec.value}</span>
            </div>
          ))}
        </div>

        {/* Аккордеоны */}
        <div className={styles.accordions}>
          {crop.predecessors && (
            <Accordion
              title="Предшественники"
              content={
                <div className={styles.accordionContent}>
                  {crop.predecessors.good.length > 0 && (
                    <div className={styles.accordionRow}>
                      <span className={styles.accordionLabel}>Хорошие:</span>
                      <span className={styles.accordionValue}>
                        {crop.predecessors.good.join(', ')}
                      </span>
                    </div>
                  )}
                  {crop.predecessors.bad.length > 0 && (
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
          {crop.neighbors && (
            <Accordion
              title="Соседи"
              content={
                <div className={styles.accordionContent}>
                  {crop.neighbors.good.length > 0 && (
                    <div className={styles.accordionRow}>
                      <span className={styles.accordionLabel}>Хорошие:</span>
                      <span className={styles.accordionValue}>
                        {crop.neighbors.good.join(', ')}
                      </span>
                    </div>
                  )}
                  {crop.neighbors.bad.length > 0 && (
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