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
  description: string;
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
  description
}) => {
  return (
    <Link to={`/crop/${id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {image ? (
          <img src={image} alt={name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.family}>
          {family} · {group}
        </p>
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
        <p className={styles.description}>{description}</p>
      </div>
    </Link>
  );
};

export default CropCard;