// src/components/UI/CropCard/CropCard.tsx
import React from 'react';
import styles from './CropCard.module.css';

interface CropCardProps {
  id: string;
  name: string;
  family: string;
  group: string;
  vegetationDays: number;
  soilNeeds: string;
  lightNeeds: string;
  image?: string;
  description?: string;
  onClick?: () => void;
}

const CropCard: React.FC<CropCardProps> = ({
  // id можно использовать для key или ссылки, но если не используется — можно убрать
  // если он нужен для onClick или ссылки — оставляем
  name,
  family,
  group,
  vegetationDays,
  soilNeeds,
  lightNeeds,
  image,
  // description не используется в карточке — убираем
  onClick,
}) => {
  return (
    <div className={styles.card} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <h3 className={styles.title}>{name.toUpperCase()}</h3>
      <p className={styles.family}>{family} - {group}</p>
      
      <div className={styles.imageWrapper}>
        {image ? (
          <img src={image} alt={name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>
      
      <div className={styles.specs}>
        <div className={styles.spec}>
          <span className={styles.specLabel}>Вегетация:</span>
          <span className={styles.specValue}>{vegetationDays} дн.</span>
        </div>
        <div className={styles.spec}>
          <span className={styles.specLabel}>Почва:</span>
          <span className={styles.specValue}>{soilNeeds}</span>
        </div>
        <div className={styles.spec}>
          <span className={styles.specLabel}>Свет:</span>
          <span className={styles.specValue}>{lightNeeds}</span>
        </div>
      </div>
    </div>
  );
};

export default CropCard;