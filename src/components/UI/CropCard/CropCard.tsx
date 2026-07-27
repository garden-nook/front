import React from "react";
import styles from "./CropCard.module.css";

interface CropCardProps {
  id: string;
  name: string;
  family: string;
  vegetationDays: number;
  soilNeeds: string;
  lightNeeds: string;
  image?: string;
  description?: string;
  onClick?: () => void;
}

const CropCard: React.FC<CropCardProps> = ({
  id: _id,
  name,
  family,
  vegetationDays,
  soilNeeds,
  lightNeeds,
  image,
  description: _description,
  onClick,
}) => {
  return (
    <div
      className={styles.card}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <h3 className={styles.title}>{name.toUpperCase()}</h3>

      <div className={styles.imageWrapper}>
        {image ? (
          <img src={image} alt={name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      <p className={styles.family}>{family}</p>

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
