import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PlotCard.module.css';
import ActionButton from '../ActionButton';

interface PlotCardProps {
  id: string;
  name: string;
  width: number;
  height: number;
  bedsCount: number;
  cropsCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

const PlotCard: React.FC<PlotCardProps> = ({
  id,
  name,
  width,
  height,
  bedsCount,
  cropsCount,
  onEdit,
  onDelete
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.imagePlaceholder} />
      <div className={styles.content}>
        <Link to={`/plot/${id}`} className={styles.title}>
          {name}
        </Link>
        <p className={styles.info}>
          Размер: {width}x{height} · Грядок: {bedsCount} · Культур: {cropsCount}
        </p>
      </div>
      <div className={styles.actions}>
        <ActionButton 
          icon="edit" 
          color="greenLight" 
          shape="littleSquare" 
          onClick={onEdit}
        />
        <ActionButton 
          icon="delete" 
          color="red" 
          shape="littleSquare" 
          onClick={onDelete}
        />
      </div>
    </div>
  );
};

export default PlotCard;