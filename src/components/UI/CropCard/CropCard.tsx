import React from 'react';
import { Link } from 'react-router-dom';
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
  onClick?: () => void;
}

const CropCard: React.FC<CropCardProps> = ({
  id,
  name,
  family,
  group,
  vegetationDays,
  soilNeeds,
  lightNeeds,
  image,
  onClick,
}) => {
  return (
    <div className={styles.card} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
      </div>
      
      <div className={styles.imageWrapper}>
        {image ? (
          <img src={image} alt={name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>
      
      <p className={styles.family}>
        {family} · {group}
      </p>
      
      <div className={styles.content}>
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
    </div>
  );
};

export default CropCard;